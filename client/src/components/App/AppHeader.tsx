import { Activity } from "lucide-react";
import { Chip, Stack, Typography } from "@mui/material";

interface AppHeaderProps {
  activeChannelName?: string;
  usingBackup?: boolean;
  activeLatencyMs?: number;
}

export const AppHeader = ({
  activeChannelName,
  usingBackup,
  activeLatencyMs,
}: AppHeaderProps) => {
  return (
    <Stack spacing={1.5} sx={{ mb: 3 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Activity color="#34d399" /> Live Sports Aggregator
      </Typography>

      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
        <Chip
          size="small"
          color={usingBackup ? "warning" : "success"}
          variant="outlined"
          label={usingBackup ? "Backup feed active" : "Primary feed active"}
        />
        {activeChannelName && (
          <Chip
            size="small"
            variant="outlined"
            label={`Watching: ${activeChannelName}`}
          />
        )}
        {typeof activeLatencyMs === "number" && activeLatencyMs > 0 && (
          <Chip
            size="small"
            variant="outlined"
            label={`Proxy RTT: ${activeLatencyMs} ms`}
          />
        )}
      </Stack>
    </Stack>
  );
};
