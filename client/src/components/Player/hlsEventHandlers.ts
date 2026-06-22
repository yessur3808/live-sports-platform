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

  hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
    videoElement.play().catch(() => {});
  });

  hlsInstance.on(Hls.Events.FRAG_BUFFERED, () => {
    if (!startupStartTimeRef.current) return;

    const startupTimeSeconds =
      (performance.now() - startupStartTimeRef.current) / 1000;
    onStats?.({ startup: startupTimeSeconds.toFixed(2) });
    startupStartTimeRef.current = 0;
  });

  hlsInstance.on(Hls.Events.ERROR, (_event, errorData) => {
    if (!errorData.fatal) return;

    switch (errorData.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        networkRetryCount += 1;

        if (networkRetryCount <= 5) {
          const retryDelayMs = Math.min(1000 * 2 ** networkRetryCount, 8000);
          setPlaybackError(`Network issue — retrying (${networkRetryCount})…`);
          setTimeout(() => hlsInstance.startLoad(), retryDelayMs);
        } else {
          setPlaybackError("Source unreachable after retries");
        }
        break;

      case Hls.ErrorTypes.MEDIA_ERROR:
        setPlaybackError("Media error — recovering…");
        hlsInstance.recoverMediaError();
        break;

      default:
        setPlaybackError("Fatal error");
        hlsInstance.destroy();
    }
  });

  hlsInstance.on(Hls.Events.FRAG_LOADED, () => {
    networkRetryCount = 0;
    setPlaybackError(null);
  });
};
