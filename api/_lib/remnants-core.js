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
  const [raw, count] = await Promise.all([store.lrange(LIST, 0, PAGE - 1), store.get(COUNT)]);
  return { remnants: (raw || []).map(parse), count: Number(count) || 0 };
}

export async function add(store, body, ip) {
  const entry = sanitize(body);
  if (!entry) return { status: 400, body: { error: "invalid remnant" } };

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
