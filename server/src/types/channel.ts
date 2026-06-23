export interface Channel {
  id: string;
  name: string;
  sport: string;
  matchContext: string;
  scheduleSourceUrl?: string;
  currentEvent?: ChannelEvent;
  nextEvent?: ChannelEvent;
  primary: string;
  backup: string;
}

export interface ChannelEvent {
  title: string;
  competition?: string;
  startTimeUtc: string;
  endTimeUtc: string;
  venue?: string;
  note?: string;
}
