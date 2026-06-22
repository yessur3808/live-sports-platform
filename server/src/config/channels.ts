import type { Channel } from "../types/channel.js";

export const channels: Channel[] = [
  {
    id: "mux-test",
    name: "Mux Live Loop",
    sport: "Test/Harness",
    primary: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    backup: "https://test-streams.mux.dev/test_001/stream.m3u8",
  },
  {
    id: "apple-bipbop",
    name: "Apple BipBop (ABR ladder)",
    sport: "Test/Harness",
    primary:
      "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
    backup: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  {
    id: "soccer-fast",
    name: "Soccer Channel",
    sport: "Soccer",
    primary: "PUT_A_LIVE_SOCCER_HLS_URL_HERE.m3u8",
    backup: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  {
    id: "basketball-fast",
    name: "Basketball Channel",
    sport: "Basketball",
    primary: "PUT_A_LIVE_BASKETBALL_HLS_URL_HERE.m3u8",
    backup: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
];
