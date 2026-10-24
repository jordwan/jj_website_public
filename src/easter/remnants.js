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

/* Signature data is "x,y;x,y|x,y;x,y" (strokes separated by |).
   Returns an array of strokes, each an array of [x, y] ints, with at most
   SIG_MAX points in total. */
export function compressSignature(data) {
  const strokes = (data || "")
    .split("|")
    .map((st) =>
      st
        .split(";")
        .map((p) => p.split(",").map(Number))
        .filter((p) => p.length === 2 && p.every(Number.isFinite))
        .map(([x, y]) => [x | 0, y | 0])
    )
    .filter((st) => st.length >= 1)
    .slice(0, 8);
  const total = strokes.reduce((n, st) => n + st.length, 0);
  if (total <= SIG_MAX) return strokes;
  return strokes.map((st) => {
    const keep = Math.max(2, Math.round((st.length / total) * SIG_MAX));
    if (st.length <= keep) return st;
    const step = st.length / keep;
    return Array.from({ length: keep }, (_, i) => st[Math.min(st.length - 1, Math.floor(i * step))]);
  });
}

/* Accepts either a flat point list [[x,y],…] (older entries) or a list of
   strokes [[[x,y],…],…] and returns an SVG path. */
export function sigToPath(sig) {
  if (!Array.isArray(sig) || !sig.length) return "";
  const strokes = Array.isArray(sig[0]?.[0]) ? sig : [sig];
  return strokes
    .filter((st) => st.length)
    .map((st) => st.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" "))
    .join(" ");
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
