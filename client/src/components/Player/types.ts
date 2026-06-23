export interface PlayerStats {
  buffer?: string;
  bitrate?: number | null;
  resolution?: string | null;
  latency?: string | null;
  frameRate?: number | null;
  dropped?: number | null;
  rebuffers?: number;
  level?: string | null;
  startup?: string;
}

export interface PlayerProps {
  channelId?: string | null;
  onStats?: (stats: PlayerStats) => void;
}
