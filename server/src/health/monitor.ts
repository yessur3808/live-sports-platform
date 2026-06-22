import { channels } from "../config/channels.js";
import { checkManifestHealth, probeChannelManifest } from "./probe.js";
import { healthState } from "./store.js";

export const startHealthMonitor = (intervalMs = 5000): void => {
  healthState.initialize();

  setInterval(() => {
    for (const channel of channels) {
      const activeUrl = healthState.activeUrl(channel.id);
      if (activeUrl) {
        void probeChannelManifest(channel.id, activeUrl);
      }

      const status = healthState.snapshot()[channel.id];
      if (!status?.usingBackup) {
        continue;
      }

      void checkManifestHealth(channel.primary).then((isPrimaryHealthy) => {
        if (isPrimaryHealthy) {
          healthState.markPrimaryRecoverySuccess(channel.id);
        } else {
          healthState.markPrimaryRecoveryFailure(channel.id);
        }
      });
    }
  }, intervalMs);
};
