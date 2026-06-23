import Hls from "hls.js";
import type { PlayerStats } from "./types";

interface EmitPlaybackStatsOptions {
  videoElement: HTMLVideoElement | null;
  hlsInstance: Hls | null;
  onStats?: (stats: PlayerStats) => void;
}

interface DecodedBytesSample {
  atMs: number;
  bytes: number;
}

interface FrameSample {
  atMs: number;
  totalFrames: number;
}

const decodedBytesSamples = new WeakMap<HTMLVideoElement, DecodedBytesSample>();
const frameSamples = new WeakMap<HTMLVideoElement, FrameSample>();

const getApproxNativeBitrateKbps = (
  videoElement: HTMLVideoElement,
): number | null => {
  const decodedBytes = (
    videoElement as HTMLVideoElement & {
      webkitVideoDecodedByteCount?: number;
    }
  ).webkitVideoDecodedByteCount;

  if (typeof decodedBytes !== "number" || decodedBytes <= 0) {
    return null;
  }

  const nowMs = Date.now();
  const previous = decodedBytesSamples.get(videoElement);
  decodedBytesSamples.set(videoElement, { atMs: nowMs, bytes: decodedBytes });

  if (!previous) {
    return null;
  }

  const elapsedSeconds = (nowMs - previous.atMs) / 1000;
  const deltaBytes = decodedBytes - previous.bytes;
  if (elapsedSeconds <= 0 || deltaBytes <= 0) {
    return null;
  }

  return Math.round((deltaBytes * 8) / elapsedSeconds / 1000);
};

const getActiveLevel = (hlsInstance: Hls | null) => {
  if (!hlsInstance || hlsInstance.levels.length === 0) {
    return undefined;
  }

  const candidateIndexes = [
    hlsInstance.currentLevel,
    hlsInstance.loadLevel,
    hlsInstance.nextAutoLevel,
    hlsInstance.nextLoadLevel,
    hlsInstance.firstLevel,
  ];

  const levelIndex = candidateIndexes.find(
    (index) => index >= 0 && index < hlsInstance.levels.length,
  );
  if (levelIndex === undefined) {
    return undefined;
  }

  return hlsInstance.levels[levelIndex];
};

const getLiveLatencySeconds = (
  videoElement: HTMLVideoElement,
  hlsInstance: Hls | null,
): string | null => {
  const hlsLatency = hlsInstance?.latency;
  if (typeof hlsLatency === "number" && Number.isFinite(hlsLatency)) {
    return hlsLatency <= 0.2 ? "live" : hlsLatency.toFixed(1);
  }

  const targetLatency = hlsInstance?.targetLatency;
  if (typeof targetLatency === "number" && Number.isFinite(targetLatency)) {
    return targetLatency <= 0.2 ? "live" : targetLatency.toFixed(1);
  }

  if (videoElement.seekable.length === 0) {
    if (
      hlsInstance?.liveSyncPosition &&
      Number.isFinite(hlsInstance.liveSyncPosition)
    ) {
      const syncDelta = hlsInstance.liveSyncPosition - videoElement.currentTime;
      if (Number.isFinite(syncDelta)) {
        return syncDelta <= 0.2 ? "live" : Math.max(syncDelta, 0).toFixed(1);
      }
    }

    return videoElement.readyState >= 2 ? "live" : null;
  }

  const liveEdgeSeconds = videoElement.seekable.end(
    videoElement.seekable.length - 1,
  );
  const delta = liveEdgeSeconds - videoElement.currentTime;
  if (!Number.isFinite(delta)) {
    return videoElement.readyState >= 2 ? "live" : null;
  }

  return delta <= 0.2 ? "live" : Math.max(delta, 0).toFixed(1);
};

const getMeasuredFrameRate = (
  videoElement: HTMLVideoElement,
  playbackQuality:
    | {
        totalVideoFrames?: number;
      }
    | undefined,
): number | null => {
  const totalFrames = playbackQuality?.totalVideoFrames;
  if (typeof totalFrames !== "number" || totalFrames <= 0) {
    return null;
  }

  const nowMs = Date.now();
  const previous = frameSamples.get(videoElement);
  frameSamples.set(videoElement, { atMs: nowMs, totalFrames });

  if (!previous) {
    return null;
  }

  const elapsedSeconds = (nowMs - previous.atMs) / 1000;
  const deltaFrames = totalFrames - previous.totalFrames;
  if (elapsedSeconds <= 0 || deltaFrames <= 0) {
    return null;
  }

  return Number((deltaFrames / elapsedSeconds).toFixed(1));
};

export const emitPlaybackStats = ({
  videoElement,
  hlsInstance,
  onStats,
}: EmitPlaybackStatsOptions) => {
  if (!videoElement || !onStats) return;

  const bufferSeconds =
    videoElement.buffered.length > 0
      ? videoElement.buffered.end(videoElement.buffered.length - 1) -
        videoElement.currentTime
      : 0;

  const activeLevel = getActiveLevel(hlsInstance);

  const levelLabel = hlsInstance
    ? hlsInstance.autoLevelEnabled
      ? activeLevel
        ? `auto/${activeLevel.height}p`
        : "auto"
      : activeLevel
        ? `${activeLevel.height}p`
        : null
    : "native";

  const playbackQuality = videoElement.getVideoPlaybackQuality?.();
  const nativeBitrateKbps = getApproxNativeBitrateKbps(videoElement);
  const measuredFrameRate = getMeasuredFrameRate(videoElement, playbackQuality);
  const derivedResolution =
    activeLevel && activeLevel.width > 0 && activeLevel.height > 0
      ? `${activeLevel.width}x${activeLevel.height}`
      : videoElement.videoWidth > 0 && videoElement.videoHeight > 0
        ? `${videoElement.videoWidth}x${videoElement.videoHeight}`
        : null;

  onStats({
    buffer: bufferSeconds.toFixed(1),
    bitrate: activeLevel
      ? Math.round(activeLevel.bitrate / 1000)
      : hlsInstance?.bandwidthEstimate
        ? Math.round(hlsInstance.bandwidthEstimate / 1000)
        : nativeBitrateKbps,
    resolution: derivedResolution,
    level: levelLabel,
    latency: getLiveLatencySeconds(videoElement, hlsInstance),
    frameRate:
      activeLevel?.frameRate && Number.isFinite(activeLevel.frameRate)
        ? Number(activeLevel.frameRate.toFixed(1))
        : measuredFrameRate,
    dropped: playbackQuality ? playbackQuality.droppedVideoFrames : null,
  });
};
