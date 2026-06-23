import Hls from "hls.js";
import type { PlayerStats } from "./types";

interface AttachHlsEventHandlersOptions {
  hlsInstance: Hls;
  videoElement: HTMLVideoElement;
  startupStartTimeRef: { current: number };
  onStats?: (stats: PlayerStats) => void;
  setPlaybackError: (message: string | null) => void;
}

export const attachHlsEventHandlers = ({
  hlsInstance,
  videoElement,
  startupStartTimeRef,
  onStats,
  setPlaybackError,
}: AttachHlsEventHandlersOptions) => {
  let networkRetryCount = 0;
  let rebufferCount = 0;
  let mediaRecoveryCount = 0;
  const retryTimerIds: number[] = [];

  const onManifestParsed = () => {
    videoElement.play().catch(() => {});
  };

  const onFragBuffered = () => {
    if (!startupStartTimeRef.current) return;

    const startupTimeSeconds =
      (performance.now() - startupStartTimeRef.current) / 1000;
    onStats?.({ startup: startupTimeSeconds.toFixed(2) });
    startupStartTimeRef.current = 0;
  };

  const onError = (_event: unknown, errorData: unknown) => {
    const data = errorData as {
      details?: string;
      fatal?: boolean;
      type?: string;
    };

    if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
      rebufferCount += 1;
      onStats?.({ rebuffers: rebufferCount });
    }

    if (!data.fatal) return;

    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        networkRetryCount += 1;

        if (networkRetryCount <= 5) {
          const retryDelayMs = Math.min(1000 * 2 ** networkRetryCount, 8000);
          setPlaybackError(
            `Network issue - retrying (${networkRetryCount})...`,
          );
          const retryTimerId = window.setTimeout(
            () => hlsInstance.startLoad(),
            retryDelayMs,
          );
          retryTimerIds.push(retryTimerId);
        } else {
          setPlaybackError("Source unreachable after retries");
          hlsInstance.stopLoad();
        }
        break;

      case Hls.ErrorTypes.MEDIA_ERROR:
        mediaRecoveryCount += 1;

        if (mediaRecoveryCount === 1) {
          setPlaybackError("Media error - recovering...");
          hlsInstance.recoverMediaError();
        } else if (mediaRecoveryCount === 2) {
          setPlaybackError("Media error - trying codec swap...");
          hlsInstance.swapAudioCodec();
          hlsInstance.recoverMediaError();
        } else {
          setPlaybackError("Media recovery exhausted");
          hlsInstance.stopLoad();
        }
        break;

      default:
        setPlaybackError("Fatal error");
        hlsInstance.stopLoad();
    }
  };

  const onFragLoaded = () => {
    networkRetryCount = 0;
    mediaRecoveryCount = 0;
    setPlaybackError(null);
  };

  hlsInstance.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
  hlsInstance.on(Hls.Events.FRAG_BUFFERED, onFragBuffered);
  hlsInstance.on(Hls.Events.ERROR, onError);
  hlsInstance.on(Hls.Events.FRAG_LOADED, onFragLoaded);

  return () => {
    hlsInstance.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
    hlsInstance.off(Hls.Events.FRAG_BUFFERED, onFragBuffered);
    hlsInstance.off(Hls.Events.ERROR, onError);
    hlsInstance.off(Hls.Events.FRAG_LOADED, onFragLoaded);
    for (const retryTimerId of retryTimerIds) {
      window.clearTimeout(retryTimerId);
    }
  };
};
