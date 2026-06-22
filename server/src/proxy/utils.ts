import type { FastifyRequest } from "fastify";

export const enc = (value: string): string =>
  Buffer.from(value).toString("base64url");

export const dec = (value: string): string =>
  Buffer.from(value, "base64url").toString();

export const originOf = (req: FastifyRequest): string => {
  return `${req.protocol}://${req.headers.host}`;
};
