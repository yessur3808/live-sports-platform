import { Box, Chip, Stack, Typography } from "@mui/material";
import type { Channel } from "../../types";

interface ChannelSidebarHeaderProps {
  filteredCount: number;
  activeChannel?: Channel;
}

export const ChannelSidebarHeader = ({
  filteredCount,
  activeChannel,
}: ChannelSidebarHeaderProps) => {
  return (
    <Box>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
          Live Channels
        </Typography>

        <Chip
          label={`${filteredCount} shown`}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      </Stack>

      {activeChannel && (
        <Box
          sx={{
            mt: 1.5,
            p: 1.5,
            borderRadius: "12px",
            border: 1,
            borderColor: "divider",
            bgcolor: "rgba(45, 212, 191, 0.14)",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Now selected
          </Typography>
          <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {activeChannel.name}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
