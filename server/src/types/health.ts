export interface ChannelStatus {
  active: string;
  usingBackup: boolean;
  failures: number;
  lastLatency: number;
  healthy: boolean;
  lastSeen: number;
}
