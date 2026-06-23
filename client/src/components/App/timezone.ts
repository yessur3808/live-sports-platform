export const TIMEZONE_OPTIONS = [
  { label: "Local time", value: "local" },
  { label: "UTC", value: "UTC" },
  { label: "America/New_York", value: "America/New_York" },
  { label: "Europe/London", value: "Europe/London" },
  { label: "Asia/Tokyo", value: "Asia/Tokyo" },
  { label: "Australia/Sydney", value: "Australia/Sydney" },
] as const;

export type DisplayTimeZone = (typeof TIMEZONE_OPTIONS)[number]["value"];

export const getBrowserTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
};

export const resolveTimeZone = (timeZone: DisplayTimeZone): string => {
  return timeZone === "local" ? getBrowserTimeZone() : timeZone;
};

export const describeTimeZone = (
  selectedTimeZone: DisplayTimeZone,
  resolvedTimeZone: string,
): string => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: resolvedTimeZone,
    timeZoneName: "long",
  });

  const zoneName = formatter
    .formatToParts(new Date())
    .find((part) => part.type === "timeZoneName")?.value;

  if (selectedTimeZone === "local") {
    return zoneName ? `Local time (${zoneName})` : "Local time";
  }

  return zoneName ? `${selectedTimeZone} (${zoneName})` : selectedTimeZone;
};

export const formatScheduleRange = (
  startTimeUtc: string,
  endTimeUtc: string,
  timeZone: string,
): string => {
  const start = new Date(startTimeUtc);
  const end = new Date(endTimeUtc);

  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
};

export const formatUtcRange = (
  startTimeUtc: string,
  endTimeUtc: string,
): string => {
  return formatScheduleRange(startTimeUtc, endTimeUtc, "UTC");
};
