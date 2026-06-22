import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCache } from "./cache/memoryCache.js";
import { registerProxy } from "./proxy/registerProxy.js";
import { channels } from "./config/channels.js";
import { startHealthMonitor, healthState } from "./health/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = Fastify({ logger: false });
await app.register(cors, { origin: true });

const cache = createCache();
registerProxy(app, cache);

app.get("/channels", async () =>
  channels.map(({ id, name, sport }) => ({ id, name, sport })),
);

app.get("/health", async () => healthState.snapshot());

app.post<{ Params: { id: string } }>("/debug/break/:id", async (req) => {
  healthState.markFailure(req.params.id);
  healthState.markFailure(req.params.id);
  healthState.markFailure(req.params.id);
  return { ok: true };
});

await app.register(fastifyStatic, {
  root: path.join(__dirname, "../../client/dist"),
});

startHealthMonitor();
const port = Number(process.env.PORT ?? 4000);
await app.listen({ port, host: "0.0.0.0" });
console.log(`proxy up on :${port}`);
