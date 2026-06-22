export interface Channel {
  id: string;
  name: string;
  sport: string;
}

export interface ChannelHealth {
  healthy?: boolean;
  usingBackup?: boolean;
  lastLatency?: number;
  failures?: number;
}

export type HealthByChannel = Record<string, ChannelHealth>;
