import { request } from "undici";
import { channels } from "./channels.js";
import { state } from "./health.js";

const absolutize = (line, baseUrl) => {
  try {
    return new URL(line, baseUrl).toString();
  } catch {
    return line;
  }
};

const enc = (u) => Buffer.from(u).toString("base64url");
const dec = (s) => Buffer.from(s, "base64url").toString();

const rewriteManifest = (text, manifestUrl, channelId, origin) => {
  const lines = text.split("\n");
  return lines
    .map((raw) => {
      const line = raw.trim();
      if (line === "" || line.startsWith("#")) {
        if (line.includes('URI="')) {
          return raw.replace(/URI="([^"]+)"/g, (_, uri) => {
            const abs = absolutize(uri, manifestUrl);
            return `URI="${origin}/proxy/${channelId}/seg/${enc(abs)}"`;
          });
        }
        return raw;
      }

      const abs = absolutize(line, manifestUrl);
      const isPlaylist = abs.includes(".m3u8");
      const route = isPlaylist ? "playlist" : "seg";
      return `${origin}/proxy/${channelId}/${route}/${enc(abs)}`;
    })
    .join("\n");
  };

  export const registerProxy = (app, cache) => {
  const originOf = (req) => `${req.protocol}://${req.headers.host}`;

  app.get("/proxy/:id/playlist.m3u8", async (req, reply) => {
    const ch = channels.find((c) => c.id === req.params.id);
    if (!ch) return reply.code(404).send("unknown channel");

    const upstream = state.activeUrl(ch.id) || ch.primary;
    try {
      const res = await request(upstream, { maxRedirections: 3 });
      const text = await res.body.text();
      const rewritten = rewriteManifest(text, upstream, ch.id, originOf(req));
      reply
        .header("content-type", "application/vnd.apple.mpegurl")
        .header("cache-control", "no-cache")
        .send(rewritten);
    } catch (e) {
      state.markFailure(ch.id);
      reply.code(502).send("upstream error");
    }
  });

  app.get("/proxy/:id/playlist/:url", async (req, reply) => {
    const ch = channels.find((c) => c.id === req.params.id);
    if (!ch) return reply.code(404).send("unknown channel");
    const upstream = dec(req.params.url);
    try {
      const res = await request(upstream, { maxRedirections: 3 });
      const text = await res.body.text();
      const rewritten = rewriteManifest(text, upstream, ch.id, originOf(req));
      reply
        .header("content-type", "application/vnd.apple.mpegurl")
        .header("cache-control", "no-cache")
        .send(rewritten);
    } catch {
      reply.code(502).send("upstream playlist error");
    }
  });

  app.get("/proxy/:id/seg/:url", async (req, reply) => {
    const upstream = dec(req.params.url);
    const cached = cache.get(upstream);
    if (cached) {
      reply.header("content-type", cached.type).header("x-cache", "HIT");
      return reply.send(cached.body);
    }
    try {
      const t0 = Date.now();
      const res = await request(upstream, { maxRedirections: 3 });
      const buf = Buffer.from(await res.body.arrayBuffer());
      const type = res.headers["content-type"] || "video/mp2t";
      cache.set(upstream, { body: buf, type });
      state.recordLatency(req.params.id, Date.now() - t0);
      reply
        .header("content-type", type)
        .header("cache-control", "public, max-age=6")
        .header("x-cache", "MISS")
        .send(buf);
    } catch {
      state.markFailure(req.params.id);
      reply.code(502).send("segment error");
    }
  });
};