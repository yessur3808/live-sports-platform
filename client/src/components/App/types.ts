export interface Channel {
  id: string;
  name: string;
  sport: string;
}

export interface ChannelHealth {
  healthy?: boolean;
  usingBackup?: boolean;
}

export type HealthByChannel = Record<string, ChannelHealth>;
