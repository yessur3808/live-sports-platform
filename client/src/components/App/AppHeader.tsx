import { Activity } from "lucide-react";
import { Typography } from "@mui/material";

export const AppHeader = () => {
  return (
    <Typography
      variant="h4"
      sx={{
        fontWeight: 700,
        mb: 3,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Activity color="#34d399" /> Live Sports Aggregator
    </Typography>
  );
};
