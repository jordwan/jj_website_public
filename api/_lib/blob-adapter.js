/* Adapts a Netlify Blobs store (get / setJSON) to the small redis-like
   interface remnants-core expects. Lists are single JSON documents, counters
   are { v, exp } so rate-limit keys can expire. Fine for low traffic. */
export function blobAdapter(store) {
  const read = async (k, fallback) => {
    const v = await store.get(k, { type: "json" });
    return v === null || v === undefined ? fallback : v;
  };
  const write = (k, v) => store.setJSON(k, v);
  const live = (o) => o && typeof o === "object" && "v" in o && (!o.exp || o.exp > Date.now());

  return {
    async lrange(k, a, b) {
      return (await read(k, [])).slice(a, b + 1);
    },
    async lpush(k, v) {
      await write(k, [v, ...(await read(k, []))]);
    },
    async ltrim(k, a, b) {
      await write(k, (await read(k, [])).slice(a, b + 1));
    },
    async incr(k) {
      const o = await read(k, null);
      const v = (live(o) ? o.v : 0) + 1;
      await write(k, { v, exp: live(o) ? o.exp : null });
      return v;
    },
    async expire(k, seconds) {
      const o = await read(k, { v: 0 });
      await write(k, { ...o, exp: Date.now() + seconds * 1000 });
    },
    async get(k) {
      const o = await read(k, null);
      return live(o) ? o.v : o && typeof o === "object" && "v" in o ? 0 : o;
    },
  };
}
