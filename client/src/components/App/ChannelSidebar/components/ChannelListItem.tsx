import { Box, Chip, ListItemButton, Stack, Typography } from "@mui/material";
import type { Channel, ChannelHealth } from "../../types";
import { ChannelTimingDetails } from "./ChannelTimingDetails";

interface ChannelListItemProps {
  channel: Channel;
  channelHealth?: ChannelHealth;
  isActive: boolean;
  onSelectChannel: (channelId: string) => void;
  displayTimeZone: string;
  displayTimeZoneLabel: string;
}

const getStatusDotColor = (channelHealth?: ChannelHealth): string => {
  if (channelHealth?.usingBackup) {
    return "#facc15";
  }

  if (channelHealth?.healthy) {
    return "#34d399";
  }

  return "#ef4444";
};

export const ChannelListItem = ({
  channel,
  channelHealth,
  isActive,
  onSelectChannel,
  displayTimeZone,
  displayTimeZoneLabel,
}: ChannelListItemProps) => {
  const statusDotColor = getStatusDotColor(channelHealth);

  return (
    <ListItemButton
      selected={isActive}
      onClick={() => onSelectChannel(channel.id)}
      disableGutters
      sx={{
        borderRadius: "12px",
        border: 1,
        borderColor: isActive ? "primary.main" : "divider",
        bgcolor: isActive ? "rgba(45,212,191,0.2)" : "rgba(8,22,31,0.58)",
        minHeight: 82,
        pl: 2,
        pr: 1.5,
        py: 1.25,
        transition:
          "transform 140ms ease, border-color 140ms ease, background-color 140ms ease",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: "primary.main",
          bgcolor: "rgba(45,212,191,0.14)",
        },
        "&.Mui-selected": {
          bgcolor: "rgba(45,212,191,0.24)",
        },
        "&.Mui-selected:hover": {
          bgcolor: "rgba(45,212,191,0.28)",
        },
      }}
    >
      <Box sx={{ width: "100%", position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            left: -6,
            top: 4,
            bottom: 4,
            width: 3,
            borderRadius: 999,
            bgcolor: isActive ? "primary.main" : "transparent",
          }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.25,
            ml: isActive ? 2 : 0,
          }}
        >
          <Box sx={{ minWidth: 0, pr: 1 }}>
            <Typography
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {channel.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {channel.sport}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: statusDotColor,
              flexShrink: 0,
              boxShadow:
                channelHealth?.usingBackup || channelHealth?.healthy
                  ? `0 0 0 4px ${statusDotColor}22`
                  : "none",
            }}
          />
        </Box>

        <Stack
          direction="row"
          spacing={0.75}
          sx={{ mt: 1, flexWrap: "wrap", ml: isActive ? 2 : 0 }}
        >
          {channelHealth?.usingBackup && (
            <Chip
              label="backup"
              size="small"
              sx={{ height: 20, fontSize: 11, fontWeight: 600 }}
              color="warning"
              variant="outlined"
            />
          )}

          {channel.currentEvent && (
            <ChannelTimingDetails
              label="now"
              event={channel.currentEvent}
              displayTimeZone={displayTimeZone}
              displayTimeZoneLabel={displayTimeZoneLabel}
            />
          )}

          {channel.nextEvent && (
            <ChannelTimingDetails
              label="next"
              event={channel.nextEvent}
              displayTimeZone={displayTimeZone}
              displayTimeZoneLabel={displayTimeZoneLabel}
            />
          )}

          {typeof channelHealth?.lastLatency === "number" && (
            <Chip
              label={`${channelHealth.lastLatency} ms`}
              size="small"
              sx={{ height: 20, fontSize: 11, fontWeight: 600 }}
              variant="outlined"
            />
          )}
        </Stack>
      </Box>
    </ListItemButton>
  );
};
