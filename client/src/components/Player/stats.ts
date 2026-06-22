import Hls from "hls.js";
import type { PlayerStats } from "./types";

interface EmitPlaybackStatsOptions {
  videoElement: HTMLVideoElement | null;
  hlsInstance: Hls | null;
  onStats?: (stats: PlayerStats) => void;
}

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

  const activeLevel =
    hlsInstance && hlsInstance.currentLevel >= 0
      ? hlsInstance.levels[hlsInstance.currentLevel]
      : undefined;

  const playbackQuality = videoElement.getVideoPlaybackQuality?.();

  onStats({
    buffer: bufferSeconds.toFixed(1),
    bitrate: activeLevel ? Math.round(activeLevel.bitrate / 1000) : null,
    resolution: activeLevel
      ? `${activeLevel.width}x${activeLevel.height}`
      : null,
    latency: hlsInstance?.latency ? hlsInstance.latency.toFixed(1) : null,
    dropped: playbackQuality ? playbackQuality.droppedVideoFrames : null,
  });
};