export interface PlayerStats {
  buffer?: string;
  bitrate?: number | null;
  resolution?: string | null;
  latency?: string | null;
  dropped?: number | null;
  startup?: string;
}

export interface PlayerProps {
  channelId?: string | null;
  onStats?: (stats: PlayerStats) => void;
}