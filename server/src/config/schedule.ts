import type { ChannelEvent } from "../types/channel.js";

const toIsoString = (value: unknown): string | undefined => {
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

const defaultDurationMs = (sourceUrl?: string): number => {
  if (!sourceUrl) {
    return 2 * 60 * 60 * 1000;
  }

  if (sourceUrl.includes("/racing/f1/")) {
    return 3 * 24 * 60 * 60 * 1000;
  }

  if (sourceUrl.includes("/basketball/nba/")) {
    return 3 * 60 * 60 * 1000;
  }

  return 2 * 60 * 60 * 1000;
};

const normalizeEspnEvent = (
  value: unknown,
  sourceUrl?: string,
): ChannelEvent | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const event = value as Record<string, unknown>;
  const startTimeUtc = toIsoString(event.date) ?? toIsoString(event.startDate);
  if (!startTimeUtc) {
    return null;
  }

  const competitionArray = Array.isArray(event.competitions)
    ? event.competitions
    : [];
  const competition =
    competitionArray.length > 0 &&
    typeof competitionArray[0] === "object" &&
    competitionArray[0] !== null
      ? (competitionArray[0] as Record<string, unknown>)
      : undefined;

  const venue =
    competition &&
    typeof competition.venue === "object" &&
    competition.venue !== null &&
    typeof (competition.venue as Record<string, unknown>).fullName === "string"
      ? ((competition.venue as Record<string, unknown>).fullName as string)
      : typeof event.venue === "object" &&
          event.venue !== null &&
          typeof (event.venue as Record<string, unknown>).fullName === "string"
        ? ((event.venue as Record<string, unknown>).fullName as string)
        : undefined;

  const status =
    competition &&
    typeof competition.status === "object" &&
    competition.status !== null
      ? (competition.status as Record<string, unknown>)
      : typeof event.status === "object" && event.status !== null
        ? (event.status as Record<string, unknown>)
        : undefined;

  const statusType =
    status && typeof status.type === "object" && status.type !== null
      ? (status.type as Record<string, unknown>)
      : undefined;

  const endTimeUtc =
    toIsoString(event.endDate) ??
    toIsoString(competition?.endDate) ??
    new Date(
      Date.parse(startTimeUtc) + defaultDurationMs(sourceUrl),
    ).toISOString();

  return {
    title:
      (typeof event.name === "string" && event.name) ||
      (typeof event.shortName === "string" && event.shortName) ||
      "Scheduled event",
    competition: sourceUrl?.includes("/basketball/nba/")
      ? "NBA"
      : sourceUrl?.includes("/soccer/")
        ? "Football"
        : sourceUrl?.includes("/racing/f1/")
          ? "Formula 1"
          : undefined,
    startTimeUtc,
    endTimeUtc,
    venue,
    note:
      (typeof statusType?.shortDetail === "string" && statusType.shortDetail) ||
      (typeof statusType?.detail === "string" && statusType.detail) ||
      undefined,
  };
};

const isChannelEvent = (value: unknown): value is ChannelEvent => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.title === "string" &&
    typeof candidate.startTimeUtc === "string" &&
    typeof candidate.endTimeUtc === "string"
  );
};

const extractSchedule = (
  payload: unknown,
  sourceUrl?: string,
): ChannelEvent[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isChannelEvent);
  }

  if (typeof payload !== "object" || payload === null) {
    return [];
  }

  const candidate = payload as Record<string, unknown>;
  const possibleLists = [candidate.schedule, candidate.events, candidate.items];

  for (const list of possibleLists) {
    if (Array.isArray(list)) {
      const normalized = list
        .map((value) => normalizeEspnEvent(value, sourceUrl))
        .filter((event): event is ChannelEvent => event !== null);

      if (normalized.length > 0) {
        return normalized;
      }

      return list.filter(isChannelEvent);
    }
  }

  return [];
};

export const fetchChannelSchedule = async (
  scheduleSourceUrl?: string,
): Promise<ChannelEvent[]> => {
  if (!scheduleSourceUrl) {
    return [];
  }

  const response = await fetch(scheduleSourceUrl, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load schedule from ${scheduleSourceUrl} with ${response.status}`,
    );
  }

  const payload = (await response.json()) as unknown;
  return extractSchedule(payload, scheduleSourceUrl);
};

export const resolveChannelEvents = (
  schedule: ChannelEvent[],
  now = Date.now(),
): { currentEvent?: ChannelEvent; nextEvent?: ChannelEvent } => {
  const orderedSchedule = [...schedule].sort(
    (left, right) =>
      Date.parse(left.startTimeUtc) - Date.parse(right.startTimeUtc),
  );

  const currentEvent = orderedSchedule.find((event) => {
    const start = Date.parse(event.startTimeUtc);
    const end = Date.parse(event.endTimeUtc);
    return start <= now && now < end;
  });

  const nextEvent = orderedSchedule.find((event) => {
    return Date.parse(event.startTimeUtc) > now;
  });

  return { currentEvent, nextEvent };
};
