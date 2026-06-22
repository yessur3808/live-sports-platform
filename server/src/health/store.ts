import { channels } from "../config/channels.js";
import type { Channel } from "../types/channel.js";
import type { ChannelStatus } from "../types/health.js";

const statusByChannel = new Map<string, ChannelStatus>();

const createInitialStatus = (primaryUrl: string): ChannelStatus => {
  return {
    active: primaryUrl,
    usingBackup: false,
    failures: 0,
    consecutiveSuccesses: 0,
    lastLatency: 0,
    healthy: true,
    lastSeen: 0,
  };
};

const findChannel = (id: string): Channel | undefined => {
  return channels.find((channel) => channel.id === id);
};

export const healthState = {
  initialize(): void {
    statusByChannel.clear();
    for (const channel of channels) {
      statusByChannel.set(channel.id, createInitialStatus(channel.primary));
    }
  },
  activeUrl(id: string): string | undefined {
    return statusByChannel.get(id)?.active;
  },
  snapshot(): Record<string, ChannelStatus> {
    return Object.fromEntries(statusByChannel);
  },
  recordLatency(id: string, ms: number): void {
    const status = statusByChannel.get(id);
    if (!status) {
      return;
    }

    status.lastLatency = ms;
    status.failures = 0;
    status.healthy = true;
  },
  markProbeSuccess(id: string): void {
    const status = statusByChannel.get(id);
    if (!status) {
      return;
    }

    status.healthy = true;
    status.failures = 0;
    status.consecutiveSuccesses = 0;
    status.lastSeen = Date.now();
  },
  markFailure(id: string): void {
    const status = statusByChannel.get(id);
    if (!status) {
      return;
    }

    status.failures += 1;
    status.consecutiveSuccesses = 0;
    if (status.failures >= 3 && !status.usingBackup) {
      const channel = findChannel(id);
      if (channel?.backup) {
        status.active = channel.backup;
        status.usingBackup = true;
        status.healthy = false;
        console.log(`[failover] ${id} -> backup`);
      }
    }
  },
  markPrimaryRecoverySuccess(id: string): void {
    const status = statusByChannel.get(id);
    if (!status?.usingBackup) {
      return;
    }

    status.consecutiveSuccesses += 1;
    if (status.consecutiveSuccesses < 4) {
      return;
    }

    const channel = findChannel(id);
    if (!channel?.primary) {
      return;
    }

    status.active = channel.primary;
    status.usingBackup = false;
    status.failures = 0;
    status.healthy = true;
    status.consecutiveSuccesses = 0;
    console.log(`[failback] ${id} -> primary`);
  },
  markPrimaryRecoveryFailure(id: string): void {
    const status = statusByChannel.get(id);
    if (!status?.usingBackup) {
      return;
    }

    status.consecutiveSuccesses = 0;
  },
};
