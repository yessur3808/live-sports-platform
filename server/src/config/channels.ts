import type { Channel } from "../types/channel.js";

const fromEnv = (key: string, fallback: string): string => {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    return fallback;
  }

  return value;
};

export const channels: Channel[] = [
  {
    id: "mux-test",
    name: "Mux Live Loop",
    sport: "Test/Harness",
    primary: fromEnv(
      "MUX_TEST_PRIMARY",
      "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    ),
    backup: fromEnv(
      "MUX_TEST_BACKUP",
      "https://test-streams.mux.dev/test_001/stream.m3u8",
    ),
  },
  {
    id: "apple-bipbop",
    name: "Apple BipBop (ABR ladder)",
    sport: "Test/Harness",
    primary: fromEnv(
      "APPLE_BIPBOP_PRIMARY",
      "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
    ),
    backup: fromEnv(
      "APPLE_BIPBOP_BACKUP",
      "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    ),
  },
  {
    id: "soccer-fast",
    name: "Soccer Live-Style",
    sport: "Soccer",
    primary: fromEnv(
      "SOCCER_PRIMARY",
      "https://test-streams.mux.dev/test_001/stream.m3u8",
    ),
    backup: fromEnv(
      "SOCCER_BACKUP",
      "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    ),
  },
  {
    id: "basketball-fast",
    name: "Basketball Live-Style",
    sport: "Basketball",
    primary: fromEnv(
      "BASKETBALL_PRIMARY",
      "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8",
    ),
    backup: fromEnv(
      "BASKETBALL_BACKUP",
      "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    ),
  },
];
