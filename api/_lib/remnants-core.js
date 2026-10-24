/* Storage-agnostic core for the remnants API so it can be unit tested.
   `store` needs: lpush, ltrim, lrange, incr, expire, get. (Upstash Redis shape) */

export const LIST = "remnants";
export const COUNT = "remnants:count";
export const KEEP = 500;
export const PAGE = 50;
export const NOTE_MAX = 40;
export const SIG_MAX = 40;
export const RATE_LIMIT = 6; // anchors per IP per hour

const HEX64 = /^[0-9a-f]{64}$/;
const SEEDED = "remnants:seeded:v3";

/* One-time filler so the archive isn't empty on day one. Written only if the
   store has never been seeded; everything after this is real visitors. */
/* quick, uneven marks like someone drew a line with a thumb and moved on */
const MARKS = [
  // a loose horizontal line that sags and overshoots a little
  [[62, 51], [71, 52], [84, 54], [99, 55], [117, 56], [136, 56], [152, 55], [171, 53], [188, 52], [203, 52], [219, 53], [231, 55], [238, 57]],
  // a short diagonal dash, slightly bowed
  [[108, 71], [116, 66], [127, 59], [139, 52], [151, 45], [164, 39], [175, 34], [183, 31]],
  // a tick: down then a longer stroke up and out
  [[94, 56], [100, 62], [106, 68], [111, 71], [118, 64], [128, 53], [140, 42], [153, 33], [165, 27], [174, 24]],
  // a wobbly underline drawn fast, with a hook at the end
  [[48, 63], [60, 62], [77, 61], [96, 62], [118, 63], [141, 62], [163, 60], [186, 59], [208, 60], [226, 63], [238, 68], [243, 74]],
];
const DAY = 86400000;
export const SEED = [
  { tip: "7c1e0a9f4b2d8e63a5f0c7b1d9e2a4c6f8b0d2e4a6c8e0f2b4d6a8c0e2f4a6b8", note: "gm", sig: MARKS[0], ago: 19 * DAY },
  { tip: "e3b9d0c2a7f5618e4d2c0b9a8f7e6d5c4b3a2918f7e6d5c4b3a29180f7e6d5c4", note: "hello, world", sig: MARKS[1], ago: 12 * DAY },
  { tip: "a1f2e3d4c5b6a7980f1e2d3c4b5a69788796a5b4c3d2e1f00f1e2d3c4b5a6978", note: "still syncing", sig: MARKS[2], ago: 6 * DAY },
  { tip: "5d8c2b1a0f9e8d7c6b5a4938271605f4e3d2c1b0a9f8e7d6c5b4a39281706f5e", note: "trust the math", sig: MARKS[3], ago: 2 * DAY },
];

export async function ensureSeeded(store) {
  const first = (await store.incr(SEEDED)) === 1;
  if (!first) return false;
  // If an earlier version already seeded, refresh those entries in place.
  const raw = (await store.lrange(LIST, 0, KEEP - 1)) || [];
  const existing = raw.map((v) => (typeof v === "string" ? JSON.parse(v) : v));
  const byTip = new Map(SEED.map((e) => [e.tip, e]));
  if (existing.some((e) => byTip.has(e.tip))) {
    const refreshed = existing.map((e) => (byTip.has(e.tip) ? { ...e, note: byTip.get(e.tip).note, sig: byTip.get(e.tip).sig } : e));
    await store.ltrim(LIST, 1, 0); // empty the list
    for (const e of refreshed.slice().reverse()) await store.lpush(LIST, JSON.stringify(e));
    return true;
  }
  const now = Date.now();
  for (const e of SEED) {
    const n = await store.incr(COUNT);
    await store.lpush(LIST, JSON.stringify({ tip: e.tip, note: e.note, sig: e.sig, n, ts: now - e.ago }));
  }
  return true;
}

export function sanitize(body) {
  if (!body || typeof body !== "object") return null;
  const { tip, note, sig } = body;
  if (typeof tip !== "string" || !HEX64.test(tip)) return null;
  const cleanNote =
    typeof note === "string"
      ? [...note.replace(/[\u0000-\u001f\u007f]/g, "")].slice(0, NOTE_MAX).join("").trim()
      : "";
  const cleanSig = Array.isArray(sig)
    ? sig
        .slice(0, SIG_MAX)
        .filter((p) => Array.isArray(p) && p.length === 2 && p.every((n) => Number.isInteger(n)))
        .map(([x, y]) => [Math.max(0, Math.min(300, x)), Math.max(0, Math.min(100, y))])
    : [];
  return { tip, note: cleanNote, sig: cleanSig };
}

const parse = (v) => (typeof v === "string" ? JSON.parse(v) : v);

export async function list(store) {
  await ensureSeeded(store);
  const [raw, count] = await Promise.all([store.lrange(LIST, 0, PAGE - 1), store.get(COUNT)]);
  return { remnants: (raw || []).map(parse), count: Number(count) || 0 };
}

export async function add(store, body, ip) {
  const entry = sanitize(body);
  if (!entry) return { status: 400, body: { error: "invalid remnant" } };
  await ensureSeeded(store);

  if (ip) {
    const key = `remnants:rl:${ip}`;
    const hits = await store.incr(key);
    if (hits === 1) await store.expire(key, 3600);
    if (hits > RATE_LIMIT) return { status: 429, body: { error: "slow down" } };
  }

  const [prevRaw] = (await store.lrange(LIST, 0, 0)) || [];
  const prevTip = prevRaw ? parse(prevRaw).tip : null;
  const n = await store.incr(COUNT);
  const saved = { ...entry, n, ts: Date.now() };
  await store.lpush(LIST, JSON.stringify(saved));
  await store.ltrim(LIST, 0, KEEP - 1);
  return { status: 201, body: { n, prevTip } };
}

export function memoryStore() {
  const lists = new Map();
  const kv = new Map();
  return {
    async lpush(k, v) {
      lists.set(k, [v, ...(lists.get(k) || [])]);
    },
    async ltrim(k, a, b) {
      lists.set(k, (lists.get(k) || []).slice(a, b + 1));
    },
    async lrange(k, a, b) {
      return (lists.get(k) || []).slice(a, b + 1);
    },
    async incr(k) {
      const v = (Number(kv.get(k)) || 0) + 1;
      kv.set(k, v);
      return v;
    },
    async expire() {},
    async get(k) {
      return kv.get(k) ?? null;
    },
  };
}
