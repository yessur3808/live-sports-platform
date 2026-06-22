export interface ChannelStatus {
  active: string;
  usingBackup: boolean;
  failures: number;
  consecutiveSuccesses: number;
  lastLatency: number;
  healthy: boolean;
  lastSeen: number;
}
