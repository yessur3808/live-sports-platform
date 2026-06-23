import { Box, Typography } from "@mui/material";
import type { ChannelEvent } from "../../types";
import { formatScheduleRange, formatUtcRange } from "../../timezone";

interface ChannelTimingDetailsProps {
  label: "now" | "next";
  event: ChannelEvent;
  displayTimeZone: string;
  displayTimeZoneLabel: string;
}

export const ChannelTimingDetails = ({
  label,
  event,
  displayTimeZone,
  displayTimeZoneLabel,
}: ChannelTimingDetailsProps) => {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ display: "block", fontWeight: 600 }}>
        {label}{" "}
        {formatScheduleRange(
          event.startTimeUtc,
          event.endTimeUtc,
          displayTimeZone,
        )}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", opacity: 0.75 }}
      >
        {displayTimeZoneLabel}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", opacity: 0.6 }}
      >
        UTC: {formatUtcRange(event.startTimeUtc, event.endTimeUtc)}
      </Typography>
    </Box>
  );
};
