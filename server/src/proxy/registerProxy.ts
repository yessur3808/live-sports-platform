import type { FastifyInstance } from "fastify";
import type { Cache } from "../types/cache.js";
import type { ChannelParams, UrlParams } from "../types/proxy.js";
import {
  handleChannelPlaylist,
  handleNestedPlaylist,
  handleSegment,
} from "./handlers.js";

export const registerProxy = (app: FastifyInstance, cache: Cache): void => {
  app.get<{ Params: ChannelParams }>("/proxy/:id/playlist.m3u8", (req, reply) =>
    handleChannelPlaylist(req, reply),
  );

  app.get<{ Params: UrlParams }>("/proxy/:id/playlist/:url", (req, reply) =>
    handleNestedPlaylist(req, reply),
  );

  app.get<{ Params: UrlParams }>("/proxy/:id/seg/:url", (req, reply) =>
    handleSegment(req, reply, cache),
  );
};
