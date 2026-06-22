import { useEffect, useRef, useState, useMemo } from "react";
import Hls from "hls.js";
import { Box, Typography } from "@mui/material";
import type { PlayerProps } from "./types";
import { attachHlsEventHandlers } from "./hlsEventHandlers";
import { emitPlaybackStats } from "./stats";

export const Player = ({ channelId, onStats }: PlayerProps) => {
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const hlsInstanceRef = useRef<Hls | null>(null);
  const startupStartTimeRef = useRef<number>(0);
  const rebufferCountRef = useRef<number>(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [lastChannelId, setLastChannelId] = useState(channelId);

  const canUseNativeHls = useMemo(
    () =>
      typeof document !== "undefined" &&
      document
        .createElement("video")
        .canPlayType("application/vnd.apple.mpegurl") !== "",
    [],
  );
  const canUseHlsJs = useMemo(() => Hls.isSupported(), []);

  if (channelId !== lastChannelId) {
    setLastChannelId(channelId);
    setPlaybackError(null);
  }

  const compatibilityError =
    !canUseNativeHls && !canUseHlsJs
      ? "HLS not supported in this browser"
      : null;
  const activeError = compatibilityError ?? playbackError;

  useEffect(() => {
    const videoElement = videoElementRef.current;
    if (!channelId || !videoElement) return;
    const streamUrl = `/proxy/${channelId}/playlist.m3u8`;
    startupStartTimeRef.current = performance.now();
    rebufferCountRef.current = 0;
    onStats?.({ rebuffers: 0, startup: undefined });
    setPlaybackError(null);

    if (hlsInstanceRef.current) {
      hlsInstanceRef.current.destroy();
      hlsInstanceRef.current = null;
    }

    if (canUseNativeHls) {
      videoElement.src = streamUrl;
      videoElement.play().catch(() => {});
      const onWaiting = () => {
        rebufferCountRef.current += 1;
        onStats?.({ rebuffers: rebufferCountRef.current });
      };
      videoElement.addEventListener("waiting", onWaiting);
      return () => {
        videoElement.removeEventListener("waiting", onWaiting);
        videoElement.pause();
        videoElement.removeAttribute("src");
        videoElement.load();
      };
    }

    if (!canUseHlsJs) return;

    const hlsInstance = new Hls({
      lowLatencyMode: true,
      enableWorker: true,
      backBufferLength: 20,
      maxBufferLength: 14,
      maxMaxBufferLength: 24,
      liveSyncDurationCount: 2,
      liveMaxLatencyDurationCount: 6,
      abrEwmaDefaultEstimate: 1_200_000,
      startLevel: -1,
      capLevelToPlayerSize: true,
      fragLoadingMaxRetry: 5,
      manifestLoadingMaxRetry: 4,
      levelLoadingMaxRetry: 4,
    });
    hlsInstanceRef.current = hlsInstance;
    attachHlsEventHandlers({
      hlsInstance,
      videoElement,
      startupStartTimeRef,
      onStats,
      setPlaybackError,
    });

    hlsInstance.loadSource(streamUrl);
    hlsInstance.attachMedia(videoElement);

    return () => {
      try {
        hlsInstance.destroy();
        hlsInstanceRef.current = null;
        videoElement.pause();
        videoElement.removeAttribute("src");
        videoElement.load();
      } catch {
        /* noop */
      }
    };
  }, [channelId, canUseNativeHls, canUseHlsJs, onStats]);

  useEffect(() => {
    const statsIntervalId = setInterval(() => {
      emitPlaybackStats({
        videoElement: videoElementRef.current,
        hlsInstance: hlsInstanceRef.current,
        onStats,
      });
    }, 1000);
    return () => clearInterval(statsIntervalId);
  }, [onStats]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        backgroundColor: "black",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Box
        component="video"
        ref={videoElementRef}
        controls
        autoPlay
        muted
        playsInline
        sx={{ width: "100%", aspectRatio: "16 / 9", display: "block" }}
      />
      {activeError && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.8)",
          }}
        >
          <Typography variant="body2" color="error.light">
            {activeError}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
