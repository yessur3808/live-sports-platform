import { request } from "undici";
import { healthState } from "./store.js";

export const checkManifestHealth = async (url: string): Promise<boolean> => {
  try {
    const response = await request(url, {
      headersTimeout: 5000,
      bodyTimeout: 5000,
    });
    const text = await response.body.text();
    return text.includes("#EXTINF") || text.includes(".m3u8");
  } catch {
    return false;
  }
};

export const probeChannelManifest = async (
  channelId: string,
  activeUrl: string,
): Promise<void> => {
  const isHealthyManifest = await checkManifestHealth(activeUrl);
  if (isHealthyManifest) {
    healthState.markProbeSuccess(channelId);
  } else {
    healthState.markFailure(channelId);
  }
};
