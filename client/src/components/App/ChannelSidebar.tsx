import { Box, Chip, ListItemButton, Stack, Typography } from "@mui/material";
import type { Channel, HealthByChannel } from "./types";

interface ChannelSidebarProps {
  channels: Channel[];
  healthByChannel: HealthByChannel;
  activeChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
}

export const ChannelSidebar = ({
  channels,
  healthByChannel,
  activeChannelId,
  onSelectChannel,
}: ChannelSidebarProps) => {
  const channelsBySport = channels.reduce<Record<string, Channel[]>>(
    (groupedChannels, channel) => {
      (groupedChannels[channel.sport] ||= []).push(channel);
      return groupedChannels;
    },
    {},
  );

  return (
    <Stack spacing={3}>
      {Object.entries(channelsBySport).map(([sport, sportChannels]) => (
        <Box key={sport}>
          <Typography
            variant="overline"
            sx={{ color: "text.secondary", letterSpacing: 1 }}
          >
            {sport}
          </Typography>

          <Stack spacing={1} sx={{ mt: 1 }}>
            {sportChannels.map((channel) => {
              const channelHealth = healthByChannel[channel.id];
              const statusDotColor = channelHealth?.usingBackup
                ? "#facc15"
                : channelHealth?.healthy
                  ? "#34d399"
                  : "#ef4444";

              return (
                <ListItemButton
                  key={channel.id}
                  selected={activeChannelId === channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                  sx={{
                    borderRadius: 2,
                    border: 1,
                    borderColor:
                      activeChannelId === channel.id
                        ? "primary.main"
                        : "divider",
                  }}
                >
                  <Box sx={{ width: "100%" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography sx={{ fontWeight: 500 }}>
                        {channel.name}
                      </Typography>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: statusDotColor,
                        }}
                      />
                    </Box>

                    {channelHealth?.usingBackup && (
                      <Chip
                        label="on backup feed"
                        size="small"
                        sx={{ mt: 0.5, height: 18, fontSize: 11 }}
                        color="warning"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </ListItemButton>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};
