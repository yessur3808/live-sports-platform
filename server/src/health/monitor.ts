import { channels } from "../config/channels.js";
import { probeChannelManifest } from "./probe.js";
import { healthState } from "./store.js";

export const startHealthMonitor = (intervalMs = 5000): void => {
  healthState.initialize();

  setInterval(() => {
    for (const channel of channels) {
      const activeUrl = healthState.activeUrl(channel.id);
      if (activeUrl) {
        void probeChannelManifest(channel.id, activeUrl);
      }
    }
  }, intervalMs);
};
