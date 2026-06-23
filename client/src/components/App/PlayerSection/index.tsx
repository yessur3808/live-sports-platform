import { useState } from "react";
import { Box, Button, Chip, Collapse, Stack, Typography } from "@mui/material";
import { Player } from "../../Player";
import { PlayerStatsGrid } from "../../Player/PlayerStatsGrid";
import type { PlayerStats } from "../../Player/types";
import type { Channel } from "../types";
import { formatScheduleRange, formatUtcRange } from "../timezone";

interface PlayerSectionProps {
  activeChannelId: string | null;
  activeChannel?: Channel;
  stats: PlayerStats;
  onStats: (partialStats: PlayerStats) => void;
  onBreakSource: () => Promise<Response> | void;
  displayTimeZone: string;
  displayTimeZoneLabel: string;
}

export const PlayerSection = ({
  activeChannelId,
  activeChannel,
  stats,
  onStats,
  onBreakSource,
  displayTimeZone,
  displayTimeZoneLabel,
}: PlayerSectionProps) => {
  const [debugOpen, setDebugOpen] = useState(false);

  const triggerFailover = async () => {
    await onBreakSource();
  };

  return (
    <Stack spacing={2.25}>
      <Player channelId={activeChannelId} onStats={onStats} />

      {activeChannel && (
        <Box
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: "12px",
            px: 2.5,
            py: 2.25,
            background:
              "linear-gradient(150deg, rgba(13,30,40,0.9) 0%, rgba(10,22,31,0.82) 100%)",
            boxShadow: "0 18px 44px rgba(0, 0, 0, 0.32)",
          }}
        >
          <Stack spacing={1.1}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", flexWrap: "wrap" }}
            >
              <Chip
                label={activeChannel.sport}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {activeChannel.name}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {activeChannel.matchContext}
            </Typography>
            <Stack spacing={1.2} sx={{ pt: 0.5 }}>
              {activeChannel.currentEvent && (
                <Box
                  sx={{
                    p: 1.4,
                    borderRadius: 2,
                    bgcolor: "rgba(45, 212, 191, 0.14)",
                    border: 1,
                    borderColor: "rgba(45, 212, 191, 0.28)",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Now playing
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {activeChannel.currentEvent.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeChannel.currentEvent.competition}
                    {activeChannel.currentEvent.note
                      ? ` · ${activeChannel.currentEvent.note}`
                      : ""}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatScheduleRange(
                      activeChannel.currentEvent.startTimeUtc,
                      activeChannel.currentEvent.endTimeUtc,
                      displayTimeZone,
                    )}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", opacity: 0.8 }}
                  >
                    {displayTimeZoneLabel}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", opacity: 0.6 }}
                  >
                    UTC:{" "}
                    {formatUtcRange(
                      activeChannel.currentEvent.startTimeUtc,
                      activeChannel.currentEvent.endTimeUtc,
                    )}
                  </Typography>
                </Box>
              )}

              {activeChannel.nextEvent && (
                <Box
                  sx={{
                    p: 1.4,
                    borderRadius: 2,
                    bgcolor: "rgba(251, 146, 60, 0.14)",
                    border: 1,
                    borderColor: "rgba(251, 146, 60, 0.24)",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Up next
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {activeChannel.nextEvent.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeChannel.nextEvent.competition}
                    {activeChannel.nextEvent.note
                      ? ` · ${activeChannel.nextEvent.note}`
                      : ""}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatScheduleRange(
                      activeChannel.nextEvent.startTimeUtc,
                      activeChannel.nextEvent.endTimeUtc,
                      displayTimeZone,
                    )}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", opacity: 0.8 }}
                  >
                    {displayTimeZoneLabel}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", opacity: 0.6 }}
                  >
                    UTC:{" "}
                    {formatUtcRange(
                      activeChannel.nextEvent.startTimeUtc,
                      activeChannel.nextEvent.endTimeUtc,
                    )}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Stack>
        </Box>
      )}

      <PlayerStatsGrid stats={stats} />

      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: "12px",
          p: 1.6,
          background: "rgba(10, 24, 34, 0.82)",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Chip
              label="Debug"
              size="small"
              variant="outlined"
              color="warning"
            />
            <Typography variant="body2" color="text.secondary">
              Playback diagnostics and failover test tools
            </Typography>
          </Stack>

          <Button
            variant="text"
            size="small"
            color="inherit"
            onClick={() => setDebugOpen((open) => !open)}
          >
            {debugOpen ? "Hide" : "Show"}
          </Button>
        </Stack>

        <Collapse in={debugOpen}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              mt: 1.25,
              pt: 1.25,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={triggerFailover}
            >
              Trigger failover
            </Button>
            <Typography variant="caption" color="text.secondary">
              Sends 3 quick failure marks to activate backup feed.
            </Typography>
          </Stack>
        </Collapse>
      </Box>
    </Stack>
  );
};
