import { useEffect, useState, useCallback } from "react";
import { Box, Grid } from "@mui/material";
import type { PlayerStats } from "./components/Player/types";
import { AppHeader } from "./components/App/AppHeader";
import { PlayerSection } from "./components/App/PlayerSection";
import { ChannelSidebar } from "./components/App/ChannelSidebar";
import type {
  Channel,
  ChannelHealth,
  HealthByChannel,
} from "./components/App/types";

export const App = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [stats, setStats] = useState<PlayerStats>({});
  const [health, setHealth] = useState<HealthByChannel>({});

  useEffect(() => {
    fetch("/channels")
      .then((r) => r.json())
      .then((channelList: Channel[]) => {
        setChannels(channelList);
        setActive(channelList[0]?.id ?? null);
      });
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      fetch("/health")
        .then((r) => r.json())
        .then((healthByChannel: Record<string, ChannelHealth>) =>
          setHealth(healthByChannel),
        );
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const onStats = useCallback(
    (partialStats: PlayerStats) =>
      setStats((prevStats) => ({ ...prevStats, ...partialStats })),
    [],
  );

  const breakSource = () => {
    if (!active) return;
    return fetch(`/debug/break/${active}`, { method: "POST" });
  };

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <AppHeader />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <PlayerSection
            activeChannelId={active}
            stats={stats}
            onStats={onStats}
            onBreakSource={breakSource}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ChannelSidebar
            channels={channels}
            healthByChannel={health}
            activeChannelId={active}
            onSelectChannel={setActive}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
