import { Chip, Stack } from "@mui/material";

interface SportFilterChipsProps {
  sports: string[];
  sportFilter: string;
  onSportFilterChange: (sport: string) => void;
}

export const SportFilterChips = ({
  sports,
  sportFilter,
  onSportFilterChange,
}: SportFilterChipsProps) => {
  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{ flexWrap: "wrap", paddingLeft: 2 }}
    >
      {sports.map((sport) => (
        <Chip
          key={sport}
          label={sport}
          size="small"
          color={sportFilter === sport ? "primary" : "default"}
          variant={sportFilter === sport ? "filled" : "outlined"}
          onClick={() => onSportFilterChange(sport)}
          sx={{ fontWeight: 600 }}
        />
      ))}
    </Stack>
  );
};
