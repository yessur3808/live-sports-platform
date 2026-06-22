import { request } from "undici";
import { healthState } from "./store.js";

export const probeChannelManifest = async (
  channelId: string,
  activeUrl: string,
): Promise<void> => {
  try {
    const response = await request(activeUrl);
    const text = await response.body.text();

    const isHealthyManifest =
      text.includes("#EXTINF") || text.includes(".m3u8");
    if (isHealthyManifest) {
      healthState.markProbeSuccess(channelId);
      return;
    }

    healthState.markFailure(channelId);
  } catch {
    healthState.markFailure(channelId);
  }
};
