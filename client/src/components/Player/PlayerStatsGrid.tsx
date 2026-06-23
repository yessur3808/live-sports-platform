import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
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
      value:
        stats.latency === "live"
          ? "Live"
          : stats.latency
            ? `${stats.latency}s`
            : "—",
    },
    {
      label: "Frame Rate",
      icon: <Film size={16} />,
      value:
        typeof stats.frameRate === "number" ? `${stats.frameRate} fps` : "—",
    },
    {
      label: "Dropped",
      icon: <Activity size={16} />,
      value: stats.dropped ?? "—",
    },
    {
      label: "Rebuffers",
      icon: <AlertTriangle size={16} />,
      value: stats.rebuffers ?? 0,
    },
  ];
};

export const PlayerStatsGrid = ({ stats }: PlayerStatsGridProps) => {
  const statCards = getStatCards(stats);

  return (
    <Grid container spacing={2}>
      {statCards.map((statCard) => (
        <Grid size={{ xs: 6, sm: 4, md: 4, lg: 3 }} key={statCard.label}>
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              borderRadius: "12px",
              background:
                "linear-gradient(165deg, rgba(14, 32, 43, 0.94) 0%, rgba(10, 23, 31, 0.82) 100%)",
              boxShadow: "0 12px 24px rgba(0, 0, 0, 0.28)",
            }}
          >
            <CardContent
              sx={{ p: 2, "&:last-child": { pb: 2 }, minHeight: 104 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.75,
                  color: "text.secondary",
                  fontSize: 12,
                  mb: 1,
                  letterSpacing: 0.2,
                  textAlign: "center",
                }}
              >
                {statCard.icon}
                {statCard.label}
              </Box>

              <Typography
                sx={{
                  fontSize: { xs: 19, md: 22 },
                  fontWeight: 700,
                  lineHeight: 1.15,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: -0.2,
                  textAlign: "center",
                }}
              >
                {statCard.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
