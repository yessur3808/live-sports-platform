import { Activity } from "lucide-react";
import {
  Box,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { DisplayTimeZone } from "../timezone";

interface AppHeaderProps {
  activeChannelName?: string;
  usingBackup?: boolean;
  activeLatencyMs?: number;
  displayTimeZone: DisplayTimeZone;
  displayTimeZoneLabel: string;
  timezoneOptions: ReadonlyArray<{ label: string; value: DisplayTimeZone }>;
  onDisplayTimeZoneChange: (value: DisplayTimeZone) => void;
}

export const AppHeader = ({
  activeChannelName,
  usingBackup,
  activeLatencyMs,
  displayTimeZone,
  displayTimeZoneLabel,
  timezoneOptions,
  onDisplayTimeZoneChange,
}: AppHeaderProps) => {
  return (
    <Stack
      spacing={2}
      sx={{
        mb: 3,
        p: { xs: 2, md: 2.5 },
        borderRadius: "12px",
        border: 1,
        borderColor: "divider",
        background:
          "linear-gradient(125deg, rgba(13,30,40,0.9) 0%, rgba(9,22,31,0.82) 100%)",
        boxShadow: "0 22px 48px rgba(0, 0, 0, 0.34)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Stack spacing={0.5}>
        <Typography
          variant="h4"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: { xs: "1.6rem", md: "2rem" },
          }}
        >
          <Activity color="#2dd4bf" /> Live Sports Aggregator
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 700 }}
        >
          Multi-channel live stream control room with real-time health,
          schedule-aware metadata, and timezone-smart event timing.
        </Typography>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ flexWrap: "wrap", alignItems: "center" }}
      >
        <Chip
          size="small"
          color={usingBackup ? "warning" : "success"}
          variant="filled"
          label={usingBackup ? "Backup feed active" : "Primary feed active"}
        />
        {activeChannelName && (
          <Chip
            size="small"
            variant="filled"
            label={`Watching: ${activeChannelName}`}
            sx={{ bgcolor: "rgba(45,212,191,0.18)", color: "primary.main" }}
          />
        )}
        {typeof activeLatencyMs === "number" && activeLatencyMs > 0 && (
          <Chip
            size="small"
            variant="filled"
            label={`Proxy RTT: ${activeLatencyMs} ms`}
            sx={{ bgcolor: "rgba(251,146,60,0.2)", color: "secondary.main" }}
          />
        )}

        <Box sx={{ flexGrow: 1 }} />

        <TextField
          select
          size="small"
          label="Timezone"
          value={displayTimeZone}
          onChange={(event) =>
            onDisplayTimeZoneChange(event.target.value as DisplayTimeZone)
          }
          sx={{ minWidth: { xs: "100%", sm: 280 } }}
          helperText={displayTimeZoneLabel}
        >
          {timezoneOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Stack>
  );
};
