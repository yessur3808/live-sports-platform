import type { FastifyRequest } from "fastify";

export const enc = (value: string): string =>
  Buffer.from(value).toString("base64url");

export const dec = (value: string): string =>
  Buffer.from(value, "base64url").toString();

const firstHeaderValue = (
  value: string | string[] | undefined,
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  if (!value) {
    return undefined;
  }

  return value.split(",")[0]?.trim();
};

export const originOf = (req: FastifyRequest): string => {
  const forwardedProto = firstHeaderValue(req.headers["x-forwarded-proto"]);
  const forwardedHost = firstHeaderValue(req.headers["x-forwarded-host"]);

  const protocol = forwardedProto || req.protocol;
  const host = forwardedHost || req.headers.host;

  return `${protocol}://${host}`;
};
