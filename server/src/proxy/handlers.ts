import type { FastifyReply, FastifyRequest } from "fastify";
import { channels } from "../config/channels.js";
import { healthState } from "../health/store.js";
import type { Cache, CachedSegment } from "../types/cache.js";
import type { Channel } from "../types/channel.js";
import type { ChannelParams, UrlParams } from "../types/proxy.js";
import { rewriteManifest } from "./rewriteManifest.js";
import { dec, originOf } from "./utils.js";

const fetchWithTimeout = async (
  url: string,
  timeoutMs: number,
): Promise<Response> => {
  return fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
  });
};

const findChannel = (channelId: string): Channel | undefined => {
  return channels.find((channel) => channel.id === channelId);
};

const inFlightSegments = new Map<string, Promise<CachedSegment>>();

export const handleChannelPlaylist = async (
  req: FastifyRequest<{ Params: ChannelParams }>,
  reply: FastifyReply,
): Promise<unknown> => {
  const channel = findChannel(req.params.id);
  if (!channel) {
    return reply.code(404).send("unknown channel");
  }

  const upstream = healthState.activeUrl(channel.id) ?? channel.primary;
  try {
    const response = await fetchWithTimeout(upstream, 6000);
    if (!response.ok) {
      healthState.markFailure(channel.id);
      return reply.code(502).send("upstream manifest error");
    }

    const text = await response.text();
    const rewritten = rewriteManifest(
      text,
      upstream,
      channel.id,
      originOf(req),
    );
    return reply
      .header("content-type", "application/vnd.apple.mpegurl")
      .header("cache-control", "no-cache")
      .send(rewritten);
  } catch {
    healthState.markFailure(channel.id);
    return reply.code(502).send("upstream error");
  }
};

export const handleNestedPlaylist = async (
  req: FastifyRequest<{ Params: UrlParams }>,
  reply: FastifyReply,
): Promise<unknown> => {
  const channel = findChannel(req.params.id);
  if (!channel) {
    return reply.code(404).send("unknown channel");
  }

  const upstream = dec(req.params.url);
  try {
    const response = await fetchWithTimeout(upstream, 6000);
    if (!response.ok) {
      healthState.markFailure(channel.id);
      return reply.code(502).send("upstream nested playlist error");
    }

    const text = await response.text();
    const rewritten = rewriteManifest(
      text,
      upstream,
      channel.id,
      originOf(req),
    );
    return reply
      .header("content-type", "application/vnd.apple.mpegurl")
      .header("cache-control", "no-cache")
      .send(rewritten);
  } catch {
    healthState.markFailure(channel.id);
    return reply.code(502).send("upstream playlist error");
  }
};

export const handleSegment = async (
  req: FastifyRequest<{ Params: UrlParams }>,
  reply: FastifyReply,
  cache: Cache,
): Promise<unknown> => {
  const upstream = dec(req.params.url);
  const cachedSegment = cache.get(upstream);
  if (cachedSegment) {
    return reply
      .header("content-type", cachedSegment.type)
      .header("x-cache", "HIT")
      .send(cachedSegment.body);
  }

  try {
    let segmentPromise = inFlightSegments.get(upstream);
    const isCollapsed = Boolean(segmentPromise);
    if (!segmentPromise) {
      segmentPromise = (async () => {
        const startedAt = Date.now();
        const response = await fetchWithTimeout(upstream, 10_000);
        if (!response.ok) {
          throw new Error("segment upstream error");
        }

        const body = Buffer.from(await response.arrayBuffer());
        const contentType =
          response.headers.get("content-type") ?? "video/mp2t";
        const segment = { body, type: contentType };
        cache.set(upstream, segment);
        healthState.recordLatency(req.params.id, Date.now() - startedAt);
        return segment;
      })();
      inFlightSegments.set(upstream, segmentPromise);
    }

    const segment = await segmentPromise;

    return reply
      .header("content-type", segment.type)
      .header("cache-control", "public, max-age=3")
      .header("x-cache", isCollapsed ? "COLLAPSED" : "MISS")
      .send(segment.body);
  } catch {
    healthState.markFailure(req.params.id);
    return reply.code(502).send("segment error");
  } finally {
    inFlightSegments.delete(upstream);
  }
};
