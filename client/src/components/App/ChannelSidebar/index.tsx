import { useMemo, useState } from "react";
import {
  Box,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Channel, HealthByChannel } from "../types";
import { ChannelListItem } from "./components/ChannelListItem";
import { ChannelSidebarHeader } from "./components/ChannelSidebarHeader";
import { SportFilterChips } from "./components/SportFilterChips";

interface ChannelSidebarProps {
  channels: Channel[];
  healthByChannel: HealthByChannel;
  activeChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  displayTimeZone: string;
  displayTimeZoneLabel: string;
}

export const ChannelSidebar = ({
  channels,
  healthByChannel,
  activeChannelId,
  onSelectChannel,
  displayTimeZone,
  displayTimeZoneLabel,
}: ChannelSidebarProps) => {
  const [query, setQuery] = useState("");
  const [sportFilter, setSportFilter] = useState<string>("All");

  const sports = useMemo(
    () => [
      "All",
      ...Array.from(new Set(channels.map((channel) => channel.sport))),
    ],
    [channels],
  );

  const filteredChannels = useMemo(
    () =>
      channels.filter((channel) => {
        const matchesSport =
          sportFilter === "All" || channel.sport === sportFilter;
        const matchesQuery = channel.name
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        return matchesSport && matchesQuery;
      }),
    [channels, query, sportFilter],
  );

  const channelsBySport = filteredChannels.reduce<Record<string, Channel[]>>(
    (groupedChannels, channel) => {
      (groupedChannels[channel.sport] ||= []).push(channel);
      return groupedChannels;
    },
    {},
  );

  const activeChannel = channels.find(
    (channel) => channel.id === activeChannelId,
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2.75, sm: 3.5 },
        borderRadius: "12px",
        background:
          "linear-gradient(180deg, rgba(13,30,40,0.9) 0%, rgba(9,22,31,0.82) 100%)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.34)",
      }}
    >
      <Stack spacing={2.25}>
        <ChannelSidebarHeader
          filteredCount={filteredChannels.length}
          activeChannel={activeChannel}
        />

        <TextField
          size="small"
          placeholder="Search channels"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          fullWidth
        />

        <SportFilterChips
          sports={sports}
          sportFilter={sportFilter}
          onSportFilterChange={setSportFilter}
        />

        <Divider />

        <Stack
          spacing={2}
          sx={{
            maxHeight: { xs: "none", md: 650 },
            overflowY: { xs: "visible", md: "auto" },
            pr: { xs: 0, md: 0.5 },
            pb: 0.5,
          }}
        >
          {Object.entries(channelsBySport).map(([sport, sportChannels]) => (
            <Box key={sport}>
              <Typography
                variant="overline"
                sx={{ color: "text.secondary", letterSpacing: 1.2 }}
              >
                {sport}
              </Typography>

              <Stack spacing={1} sx={{ mt: 1.25 }}>
                {sportChannels.map((channel) => {
                  return (
                    <ChannelListItem
                      key={channel.id}
                      channel={channel}
                      channelHealth={healthByChannel[channel.id]}
                      isActive={activeChannelId === channel.id}
                      onSelectChannel={onSelectChannel}
                      displayTimeZone={displayTimeZone}
                      displayTimeZoneLabel={displayTimeZoneLabel}
                    />
                  );
                })}
              </Stack>
            </Box>
          ))}

          {filteredChannels.length === 0 && (
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                border: 1,
                borderStyle: "dashed",
                borderColor: "divider",
                bgcolor: "rgba(8, 22, 31, 0.52)",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                No channels match your search.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Try a different keyword or switch sport filters.
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};
