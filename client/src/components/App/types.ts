export interface Channel {
  id: string;
  name: string;
  sport: string;
  matchContext: string;
  currentEvent?: ChannelEvent;
  nextEvent?: ChannelEvent;
}

export interface ChannelEvent {
  title: string;
  competition?: string;
  startTimeUtc: string;
  endTimeUtc: string;
  venue?: string;
  note?: string;
}

export interface ChannelHealth {
  healthy?: boolean;
  usingBackup?: boolean;
  lastLatency?: number;
  failures?: number;
}

export type HealthByChannel = Record<string, ChannelHealth>;
