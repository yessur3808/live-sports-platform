import type { Channel } from "../types/channel.js";

const fromEnv = (key: string, fallback: string): string => {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    return fallback;
  }

  return value;
};

const fromEnvMany = (keys: string[], fallback: string): string => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value;
    }
  }

  return fallback;
};

const fromEnvOrDefault = (key: string, fallback: string): string => {
  return fromEnv(key, fallback);
};

const ESPN_NBA_SCHEDULE =
  "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";
const ESPN_SOCCER_SCHEDULE =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard";
const ESPN_F1_SCHEDULE =
  "https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard";

export const channels: Channel[] = [
  {
    id: "football-fast",
    name: "beIN SPORTS XTRA",
    sport: "Football",
    matchContext: "Live football coverage, studio segments, and match windows",
    scheduleSourceUrl: fromEnvOrDefault(
      "FOOTBALL_SCHEDULE_URL",
      ESPN_SOCCER_SCHEDULE,
    ),
    primary: fromEnv(
      "FOOTBALL_PRIMARY",
      "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
    ),
    backup: fromEnvMany(
      ["FOOTBALL_BACKUP"],
      "https://mainstreammedia-worldoffreesportsintl-rakuten.amagi.tv/playlist.m3u8",
    ),
  },
  {
    id: "basketball-fast",
    name: "NBA FAST Channel (Tubi)",
    sport: "Basketball",
    matchContext: "NBA-focused live windows, recaps, and studio analysis",
    scheduleSourceUrl: fromEnvOrDefault(
      "BASKETBALL_SCHEDULE_URL",
      ESPN_NBA_SCHEDULE,
    ),
    primary: fromEnv(
      "BASKETBALL_PRIMARY",
      "https://sportsgrid-tribal.amagi.tv/playlist.m3u8",
    ),
    backup: fromEnv(
      "BASKETBALL_BACKUP",
      "https://live-manifest.production-public.tubi.io/live/553b8d5e-fd2a-4a61-bdfa-73b34c299d75/playlist.m3u8",
    ),
  },
  {
    id: "basketball-alt",
    name: "NBA Source Alt (SportsGrid)",
    sport: "Basketball",
    matchContext:
      "Alternate basketball feed with live talk, highlights, and game coverage",
    scheduleSourceUrl: fromEnvOrDefault(
      "BASKETBALL_ALT_SCHEDULE_URL",
      ESPN_NBA_SCHEDULE,
    ),
    primary: fromEnv(
      "BASKETBALL_ALT_PRIMARY",
      "https://amg00315-sportsgrid-firetv.amagi.tv/playlist.m3u8",
    ),
    backup: fromEnv(
      "BASKETBALL_ALT_BACKUP",
      "https://sportsgrid-tribal.amagi.tv/playlist.m3u8",
    ),
  },
  {
    id: "foottball-alt",
    name: "World of Freesports",
    sport: "Football",
    matchContext: "Global football features, replays, and live event blocks",
    scheduleSourceUrl: fromEnvOrDefault(
      "FOOTBALL_ALT_SCHEDULE_URL",
      ESPN_SOCCER_SCHEDULE,
    ),
    primary: fromEnv(
      "FOOTTBALL_ALT_PRIMARY",
      "https://mainstreammedia-worldoffreesportsintl-rakuten.amagi.tv/playlist.m3u8",
    ),
    backup: fromEnv(
      "FOOTTBALL_ALT_BACKUP",
      "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
    ),
  },
  {
    id: "basketball-sportsgrid",
    name: "SportsGrid Live",
    sport: "Basketball",
    matchContext:
      "Basketball-adjacent live analysis, betting context, and score coverage",
    scheduleSourceUrl: fromEnvOrDefault(
      "BASKETBALL_SPORTSGRID_SCHEDULE_URL",
      ESPN_NBA_SCHEDULE,
    ),
    primary: fromEnv(
      "BASKETBALL_SPORTSGRID_PRIMARY",
      "https://sportsgrid-tribal.amagi.tv/playlist.m3u8",
    ),
    backup: fromEnv(
      "BASKETBALL_SPORTSGRID_BACKUP",
      "https://amg00315-sportsgrid-firetv.amagi.tv/playlist.m3u8",
    ),
  },
  {
    id: "motorsport-speedsport",
    name: "Speed Sport 1",
    sport: "Motorsport",
    matchContext: "Live races, motorsport recaps, and event coverage",
    scheduleSourceUrl: fromEnvOrDefault(
      "MOTORSPORT_SPEEDSPORT_SCHEDULE_URL",
      ESPN_F1_SCHEDULE,
    ),
    primary: fromEnv(
      "MOTORSPORT_SPEEDSPORT_PRIMARY",
      "https://linear-599.frequency.stream/dist/stirr/599/hls/master/playlist.m3u8",
    ),
    backup: fromEnv(
      "MOTORSPORT_SPEEDSPORT_BACKUP",
      "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
    ),
  },
  {
    id: "motorsport-floracing",
    name: "FloRacing 24/7",
    sport: "Motorsport",
    matchContext:
      "Round-the-clock racing coverage, highlights, and feature segments",
    scheduleSourceUrl: fromEnvOrDefault(
      "FLORACING_SCHEDULE_URL",
      ESPN_F1_SCHEDULE,
    ),
    primary: fromEnv(
      "FLORACING_PRIMARY",
      "https://amg02278-amg02278c1-flosports-worldwide-7592.playouts.now.amagi.tv/playlist.m3u8",
    ),
    backup: fromEnv(
      "FLORACING_BACKUP",
      "https://sportsgrid-tribal.amagi.tv/playlist.m3u8",
    ),
  },
  {
    id: "multi-trace-stars",
    name: "Trace Sports Stars",
    sport: "Multi-Sport",
    matchContext: "Athlete features, mixed-sport stories, and event highlights",
    scheduleSourceUrl: fromEnvOrDefault(
      "TRACE_SPORTS_SCHEDULE_URL",
      ESPN_NBA_SCHEDULE,
    ),
    primary: fromEnv(
      "TRACE_SPORTS_PRIMARY",
      "https://trace-sportstars-samsungnz.amagi.tv/playlist.m3u8",
    ),
    backup: fromEnv(
      "TRACE_SPORTS_BACKUP",
      "https://mainstreammedia-worldoffreesportsintl-rakuten.amagi.tv/playlist.m3u8",
    ),
  },
  {
    id: "multi-bahrain-sports",
    name: "Bahrain Sports 1",
    sport: "Multi-Sport",
    matchContext:
      "Regional live sports coverage, studio segments, and match blocks",
    scheduleSourceUrl: fromEnvOrDefault(
      "BAHRAIN_SPORTS_SCHEDULE_URL",
      ESPN_SOCCER_SCHEDULE,
    ),
    primary: fromEnv(
      "BAHRAIN_SPORTS_PRIMARY",
      "https://5c7b683162943.streamlock.net/live/ngrp:sportsone_all/playlist.m3u8",
    ),
    backup: fromEnv(
      "BAHRAIN_SPORTS_BACKUP",
      "https://mainstreammedia-worldoffreesportsintl-rakuten.amagi.tv/playlist.m3u8",
    ),
  },
  {
    id: "f1-channel",
    name: "F1 Channel",
    sport: "F1",
    matchContext:
      "Formula race sessions, paddock analysis, and grand prix coverage",
    scheduleSourceUrl: fromEnvOrDefault("F1_SCHEDULE_URL", ESPN_F1_SCHEDULE),
    primary: fromEnv(
      "F1_PRIMARY",
      "https://tv.cdn.xsg.ge/c4635/TVFormula/playlist.m3u8",
    ),
    backup: fromEnv(
      "F1_BACKUP",
      "https://amg00378-mavtv-amg00378c2-rakuten-us-1048.playouts.now.amagi.tv/playlist/amg00378-mavtvfast-motorsportsnetwork-rakutenus/playlist.m3u8",
    ),
  },
  {
    id: "f1-formula",
    name: "Formula Racing",
    sport: "F1",
    matchContext: "Formula racing highlights, live windows, and event analysis",
    scheduleSourceUrl: fromEnvOrDefault(
      "F1_FORMULA_SCHEDULE_URL",
      ESPN_F1_SCHEDULE,
    ),
    primary: fromEnv(
      "F1_FORMULA_PRIMARY",
      "https://amg00378-mavtv-amg00378c2-rakuten-us-1048.playouts.now.amagi.tv/playlist/amg00378-mavtvfast-motorsportsnetwork-rakutenus/playlist.m3u8",
    ),
    backup: fromEnv(
      "F1_FORMULA_BACKUP",
      "https://tv.cdn.xsg.ge/c4635/TVFormula/playlist.m3u8",
    ),
  },
];
