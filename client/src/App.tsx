import { useEffect, useState, useCallback } from "react";
import { Box, Grid } from "@mui/material";
import type { PlayerStats } from "./components/Player/types";
import { AppHeader } from "./components/App/AppHeader";
import { PlayerSection } from "./components/App/PlayerSection";
import { ChannelSidebar } from "./components/App/ChannelSidebar";
import type {
  Channel,
  ChannelHealth,
  HealthByChannel,
} from "./components/App/types";
import {
  describeTimeZone,
  TIMEZONE_OPTIONS,
  resolveTimeZone,
  type DisplayTimeZone,
} from "./components/App/timezone";

const fetchJson = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed for ${url} with ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const App = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [stats, setStats] = useState<PlayerStats>({});
  const [health, setHealth] = useState<HealthByChannel>({});
  const [displayTimeZone, setDisplayTimeZone] =
    useState<DisplayTimeZone>("local");

  const refreshChannels = useCallback(async () => {
    const channelList = await fetchJson<Channel[]>("/channels");
    setChannels(channelList);
    setActive((currentActive) => {
      if (
        currentActive &&
        channelList.some((channel) => channel.id === currentActive)
      ) {
        return currentActive;
      }

      return channelList[0]?.id ?? null;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryTimeoutId: number | undefined;

    const loadChannels = async () => {
      try {
        await refreshChannels();
      } catch {
        if (!cancelled) {
          retryTimeoutId = window.setTimeout(loadChannels, 5000);
        }
      }
    };

    void loadChannels();

    return () => {
      cancelled = true;
      if (retryTimeoutId) {
        window.clearTimeout(retryTimeoutId);
      }
    };
  }, [refreshChannels]);

  useEffect(() => {
    const refreshTimerId = window.setInterval(() => {
      void refreshChannels().catch(() => {});
    }, 30000);

    return () => {
      window.clearInterval(refreshTimerId);
    };
  }, [refreshChannels]);

  useEffect(() => {
    let cancelled = false;
    let pollTimeoutId: number | undefined;
    let needsRefreshAfterReconnect = false;

    const pollHealth = async () => {
      try {
        const healthByChannel =
          await fetchJson<Record<string, ChannelHealth>>("/health");

        if (cancelled) {
          return;
        }

        setHealth(healthByChannel);

        if (needsRefreshAfterReconnect) {
          needsRefreshAfterReconnect = false;
          void refreshChannels().catch(() => {});
        }

        pollTimeoutId = window.setTimeout(pollHealth, 4000);
      } catch {
        if (cancelled) {
          return;
        }

        needsRefreshAfterReconnect = true;
        setHealth({});
        pollTimeoutId = window.setTimeout(pollHealth, 6000);
      }
    };

    void pollHealth();

    return () => {
      cancelled = true;
      if (pollTimeoutId) {
        window.clearTimeout(pollTimeoutId);
      }
    };
  }, [refreshChannels]);

  const onStats = useCallback(
    (partialStats: PlayerStats) =>
      setStats((prevStats) => ({ ...prevStats, ...partialStats })),
    [],
  );

  const activeChannel = channels.find((channel) => channel.id === active);
  const activeHealth = active ? health[active] : undefined;
  const resolvedTimeZone = resolveTimeZone(displayTimeZone);
  const displayTimeZoneLabel = describeTimeZone(
    displayTimeZone,
    resolvedTimeZone,
  );

  const breakSource = () => {
    if (!active) return;
    return fetch(`/debug/break/${active}`, { method: "POST" });
  };

  return (
    <Box sx={{ minHeight: "100vh", p: { xs: 2.25, md: 4.5 } }}>
      <AppHeader
        activeChannelName={activeChannel?.name}
        usingBackup={activeHealth?.usingBackup}
        activeLatencyMs={activeHealth?.lastLatency}
        displayTimeZone={displayTimeZone}
        displayTimeZoneLabel={displayTimeZoneLabel}
        timezoneOptions={TIMEZONE_OPTIONS}
        onDisplayTimeZoneChange={setDisplayTimeZone}
      />

      <Grid container spacing={{ xs: 2.5, md: 3.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <PlayerSection
            activeChannelId={active}
            activeChannel={activeChannel}
            stats={stats}
            onStats={onStats}
            onBreakSource={breakSource}
            displayTimeZone={resolvedTimeZone}
            displayTimeZoneLabel={displayTimeZoneLabel}
          />
        </Grid>

        <Grid
          size={{ xs: 12, md: 4 }}
          sx={{
            position: { md: "sticky" },
            top: { md: 18 },
            alignSelf: "flex-start",
          }}
        >
          <ChannelSidebar
            channels={channels}
            healthByChannel={health}
            activeChannelId={active}
            onSelectChannel={setActive}
            displayTimeZone={resolvedTimeZone}
            displayTimeZoneLabel={displayTimeZoneLabel}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
