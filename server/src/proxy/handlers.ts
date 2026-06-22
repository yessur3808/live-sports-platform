import { request } from "undici";
import type { FastifyReply, FastifyRequest } from "fastify";
import { channels } from "../config/channels.js";
import { healthState } from "../health/store.js";
import type { Cache } from "../types/cache.js";
import type { Channel } from "../types/channel.js";
import type { ChannelParams, UrlParams } from "../types/proxy.js";
import { rewriteManifest } from "./rewriteManifest.js";
import { dec, originOf } from "./utils.js";

const findChannel = (channelId: string): Channel | undefined => {
  return channels.find((channel) => channel.id === channelId);
};

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
    const response = await request(upstream);
    const text = await response.body.text();
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
    const response = await request(upstream);
    const text = await response.body.text();
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
    const startedAt = Date.now();
    const response = await request(upstream);
    const body = Buffer.from(await response.body.arrayBuffer());
    const contentType =
      (response.headers["content-type"] as string | undefined) ?? "video/mp2t";

    cache.set(upstream, { body, type: contentType });
    healthState.recordLatency(req.params.id, Date.now() - startedAt);

    return reply
      .header("content-type", contentType)
      .header("cache-control", "public, max-age=6")
      .header("x-cache", "MISS")
      .send(body);
  } catch {
    healthState.markFailure(req.params.id);
    return reply.code(502).send("segment error");
  }
};
