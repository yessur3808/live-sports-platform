import { Box, Button, Stack } from "@mui/material";
import { Player } from "../Player";
import { PlayerStatsGrid } from "../Player/PlayerStatsGrid";
import type { PlayerStats } from "../Player/types";

interface PlayerSectionProps {
  activeChannelId: string | null;
  stats: PlayerStats;
  onStats: (partialStats: PlayerStats) => void;
  onBreakSource: () => Promise<Response> | void;
}

export const PlayerSection = ({
  activeChannelId,
  stats,
  onStats,
  onBreakSource,
}: PlayerSectionProps) => {
  return (
    <Stack spacing={2}>
      <Player channelId={activeChannelId} onStats={onStats} />
      <PlayerStatsGrid stats={stats} />

      <Box>
        <Button variant="contained" color="error" onClick={onBreakSource}>
          Simulate source failure (demo failover)
        </Button>
      </Box>
    </Stack>
  );
};
