import { getStore } from "@netlify/blobs";
import { add, list } from "../../api/_lib/remnants-core.js";
import { blobAdapter } from "../../api/_lib/blob-adapter.js";

const headers = { "cache-control": "no-store" };

export default async (req, context) => {
  const store = blobAdapter(getStore({ name: "remnants", consistency: "strong" }));
  try {
    if (req.method === "GET") {
      return Response.json(await list(store), { headers });
    }
    if (req.method === "POST") {
      const body = await req.json().catch(() => null);
      const ip = context?.ip || req.headers.get("x-nf-client-connection-ip") || "";
      const out = await add(store, body, ip);
      return Response.json(out.body, { status: out.status, headers });
    }
    return Response.json({ error: "method not allowed" }, { status: 405, headers: { ...headers, allow: "GET, POST" } });
  } catch {
    return Response.json({ error: "remnants unavailable" }, { status: 500, headers });
  }
};
