import { Redis } from "@upstash/redis";
import { add, list, memoryStore } from "./_lib/remnants-core.js";

let store;
function getStore() {
  if (store) return store;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  store = url && token ? new Redis({ url, token }) : memoryStore(); // memory = per-instance, dev only
  return store;
}

export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  try {
    if (req.method === "GET") {
      return res.status(200).json(await list(getStore()));
    }
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
      const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress;
      const out = await add(getStore(), body, ip);
      return res.status(out.status).json(out.body);
    }
    res.setHeader("allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "remnants unavailable" });
  }
}
