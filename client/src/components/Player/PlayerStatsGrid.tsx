import type { ReactNode } from "react";
import {
  Activity,
  Clock3,
  Film,
  Gauge,
  RefreshCw,
  Timer,
  Waves,
} from "lucide-react";
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import type { PlayerStats } from "./types";

interface PlayerStatsGridProps {
  stats: PlayerStats;
}

interface StatCardData {
  label: string;
  icon: ReactNode;
  value: string | number;
}

const getStatCards = (stats: PlayerStats): StatCardData[] => {
  return [
    {
      label: "Startup",
      icon: <Timer size={16} />,
      value: stats.startup ? `${stats.startup}s` : "—",
    },
    {
      label: "Bitrate",
      icon: <Gauge size={16} />,
      value: typeof stats.bitrate === "number" ? `${stats.bitrate} kbps` : "—",
    },
    {
      label: "Resolution",
      icon: <Film size={16} />,
      value: stats.resolution || "—",
    },
    {
      label: "Level",
      icon: <RefreshCw size={16} />,
      value: stats.level || "—",
    },
    {
      label: "Buffer",
      icon: <Clock3 size={16} />,
      value: stats.buffer ? `${stats.buffer}s` : "—",
    },
    {
      label: "Latency",
      icon: <Waves size={16} />,
      value: stats.latency ? `${stats.latency}s` : "—",
    },
    {
      label: "Dropped",
      icon: <Activity size={16} />,
      value: stats.dropped ?? "—",
    },
    {
      label: "Rebuffers",
      icon: <Activity size={16} />,
      value: stats.rebuffers ?? 0,
    },
  ];
};

export const PlayerStatsGrid = ({ stats }: PlayerStatsGridProps) => {
  const statCards = getStatCards(stats);

  return (
    <Grid container spacing={1.5}>
      {statCards.map((statCard) => (
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={statCard.label}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.secondary",
                  fontSize: 12,
                  mb: 0.5,
                }}
              >
                {statCard.icon}
                {statCard.label}
              </Box>
              <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
                {statCard.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
