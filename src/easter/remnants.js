/* Remnants: small anonymous traces left by visitors who anchored a chain.
   Talks to /api/remnants. If the API isn't deployed, falls back to a local
   echo of this browser's own anchors so the feature still works offline. */

const LOCAL_KEY = "jordwan.remnants.local";
export const NOTE_MAX = 40;
export const SIG_MAX = 40;

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeLocal(list) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    /* ignore */
  }
}

export async function loadRemnants() {
  try {
    const r = await fetch("/api/remnants", { headers: { accept: "application/json" } });
    if (!r.ok) throw new Error(r.status);
    const data = await r.json();
    if (!Array.isArray(data.remnants)) throw new Error("bad payload");
    return { remnants: data.remnants, count: data.count ?? data.remnants.length, online: true };
  } catch {
    const local = readLocal();
    return { remnants: local, count: local.length, online: false };
  }
}

/* Downsample a "x,y;x,y;…" stroke to at most SIG_MAX integer points. */
export function compressSignature(data) {
  const pts = (data || "")
    .split(";")
    .map((p) => p.split(",").map(Number))
    .filter((p) => p.length === 2 && p.every(Number.isFinite));
  if (pts.length <= SIG_MAX) return pts.map(([x, y]) => [x | 0, y | 0]);
  const step = pts.length / SIG_MAX;
  return Array.from({ length: SIG_MAX }, (_, i) => {
    const [x, y] = pts[Math.floor(i * step)];
    return [x | 0, y | 0];
  });
}

export async function leaveRemnant({ tip, note, sig }) {
  const entry = { tip, note: (note || "").slice(0, NOTE_MAX), sig: (sig || []).slice(0, SIG_MAX) };
  try {
    const r = await fetch("/api/remnants", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!r.ok) throw new Error(r.status);
    const data = await r.json();
    return { online: true, n: data.n, prevTip: data.prevTip ?? null };
  } catch {
    const local = readLocal();
    const n = local.length + 1;
    const prevTip = local[0]?.tip ?? null;
    writeLocal([{ ...entry, n, ts: Date.now() }, ...local]);
    return { online: false, n, prevTip };
  }
}

export function timeAgo(ts) {
  if (!ts) return "";
  const s = Math.max(1, (Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
