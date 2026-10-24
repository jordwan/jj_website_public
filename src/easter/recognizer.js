/* $P point-cloud gesture recognizer (Vatavu, Anthony & Wobbrock, 2012),
   with block-capital letter and digit templates drawn on a 2×4 grid.
   Strokes are arrays of {x, y}; a character may be several strokes. */

const N = 32;

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function pathLength(pts) {
  let d = 0;
  for (let i = 1; i < pts.length; i++) if (pts[i].id === pts[i - 1].id) d += dist(pts[i - 1], pts[i]);
  return d;
}

function resample(points, n) {
  const pts = points.map((p) => ({ ...p }));
  const I = pathLength(pts) / (n - 1);
  if (!I) return Array.from({ length: n }, () => ({ ...pts[0] }));
  let D = 0;
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].id !== pts[i - 1].id) continue;
    const d = dist(pts[i - 1], pts[i]);
    if (D + d >= I) {
      const t = (I - D) / d;
      const q = { x: pts[i - 1].x + t * (pts[i].x - pts[i - 1].x), y: pts[i - 1].y + t * (pts[i].y - pts[i - 1].y), id: pts[i].id };
      out.push(q);
      pts.splice(i, 0, q);
      D = 0;
    } else D += d;
  }
  while (out.length < n) out.push({ ...pts[pts.length - 1] });
  return out.slice(0, n);
}

function normalize(points) {
  const r = resample(points, N);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of r) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
  // scale each axis to the unit square so aspect ratio doesn't matter;
  // thin shapes (I, 1) keep a uniform scale so they don't blow up sideways
  const w = maxX - minX || 1, h = maxY - minY || 1;
  const thin = Math.min(w, h) < 0.2 * Math.max(w, h);
  const sx = thin ? Math.max(w, h) : w, sy = thin ? Math.max(w, h) : h;
  const scaled = r.map((p) => ({ x: (p.x - minX) / sx, y: (p.y - minY) / sy, id: p.id }));
  const cx = scaled.reduce((s, p) => s + p.x, 0) / N;
  const cy = scaled.reduce((s, p) => s + p.y, 0) / N;
  return scaled.map((p) => ({ x: p.x - cx, y: p.y - cy, id: p.id }));
}

function cloudDistance(a, b, start) {
  const n = a.length;
  const matched = new Array(n).fill(false);
  let sum = 0;
  let i = start;
  do {
    let min = Infinity, idx = -1;
    for (let j = 0; j < n; j++) {
      if (matched[j]) continue;
      const d = dist(a[i], b[j]);
      if (d < min) { min = d; idx = j; }
    }
    matched[idx] = true;
    sum += (1 - ((i - start + n) % n) / n) * min;
    i = (i + 1) % n;
  } while (i !== start);
  return sum;
}

function greedyCloudMatch(a, b) {
  const step = Math.max(1, Math.floor(Math.sqrt(a.length)));
  let min = Infinity;
  for (let i = 0; i < a.length; i += step) min = Math.min(min, cloudDistance(a, b, i), cloudDistance(b, a, i));
  return min;
}

/* block capitals on a 2-wide, 4-tall grid: each entry is a list of strokes */
const G = {
  A: [[[0, 4], [1, 0], [2, 4]], [[0.5, 2.2], [1.5, 2.2]]],
  B: [[[0, 0], [0, 4]], [[0, 0], [1.4, 0], [2, 0.6], [2, 1.4], [1.4, 2], [0, 2]], [[0, 2], [1.4, 2], [2, 2.6], [2, 3.4], [1.4, 4], [0, 4]]],
  C: [[[2, 0.6], [1.4, 0], [0.6, 0], [0, 0.6], [0, 3.4], [0.6, 4], [1.4, 4], [2, 3.4]]],
  D: [[[0, 0], [0, 4]], [[0, 0], [1, 0], [2, 1], [2, 3], [1, 4], [0, 4]]],
  E: [[[2, 0], [0, 0], [0, 4], [2, 4]], [[0, 2], [1.5, 2]]],
  F: [[[2, 0], [0, 0], [0, 4]], [[0, 2], [1.5, 2]]],
  G: [[[2, 0.6], [1.4, 0], [0.6, 0], [0, 0.6], [0, 3.4], [0.6, 4], [1.4, 4], [2, 3.4], [2, 2.2], [1, 2.2]]],
  H: [[[0, 0], [0, 4]], [[2, 0], [2, 4]], [[0, 2], [2, 2]]],
  I: [[[1, 0], [1, 4]]],
  J: [[[2, 0], [2, 3.4], [1.4, 4], [0.6, 4], [0, 3.4]]],
  K: [[[0, 0], [0, 4]], [[2, 0], [0, 2.2], [2, 4]]],
  L: [[[0, 0], [0, 4], [2, 4]]],
  M: [[[0, 4], [0, 0], [1, 2.2], [2, 0], [2, 4]]],
  N: [[[0, 4], [0, 0], [2, 4], [2, 0]]],
  O: [[[1, 0], [0.2, 0.6], [0, 2], [0.2, 3.4], [1, 4], [1.8, 3.4], [2, 2], [1.8, 0.6], [1, 0]]],
  P: [[[0, 4], [0, 0], [1.4, 0], [2, 0.6], [2, 1.6], [1.4, 2.2], [0, 2.2]]],
  Q: [[[1, 0], [0.2, 0.6], [0, 2], [0.2, 3.4], [1, 4], [1.8, 3.4], [2, 2], [1.8, 0.6], [1, 0]], [[1.2, 3], [2.2, 4.2]]],
  R: [[[0, 4], [0, 0], [1.4, 0], [2, 0.6], [2, 1.6], [1.4, 2.2], [0, 2.2]], [[0.8, 2.2], [2, 4]]],
  S: [[[2, 0.6], [1.4, 0], [0.6, 0], [0, 0.6], [0, 1.4], [0.6, 2], [1.4, 2], [2, 2.6], [2, 3.4], [1.4, 4], [0.6, 4], [0, 3.4]]],
  T: [[[0, 0], [2, 0]], [[1, 0], [1, 4]]],
  U: [[[0, 0], [0, 3.4], [0.6, 4], [1.4, 4], [2, 3.4], [2, 0]]],
  V: [[[0, 0], [1, 4], [2, 0]]],
  W: [[[0, 0], [0.5, 4], [1, 1.6], [1.5, 4], [2, 0]]],
  X: [[[0, 0], [2, 4]], [[2, 0], [0, 4]]],
  Y: [[[0, 0], [1, 2], [2, 0]], [[1, 2], [1, 4]]],
  Z: [[[0, 0], [2, 0], [0, 4], [2, 4]]],
  0: [[[1, 0], [0.2, 0.8], [0, 2], [0.2, 3.2], [1, 4], [1.8, 3.2], [2, 2], [1.8, 0.8], [1, 0]]],
  1: [[[0.4, 1], [1.2, 0], [1.2, 4]]],
  2: [[[0, 0.6], [0.6, 0], [1.4, 0], [2, 0.6], [2, 1.4], [0, 4], [2, 4]]],
  3: [[[0, 0], [2, 0], [1, 1.8], [2, 2.6], [2, 3.4], [1.4, 4], [0.6, 4], [0, 3.4]]],
  4: [[[1.6, 4], [1.6, 0], [0, 2.8], [2, 2.8]]],
  5: [[[2, 0], [0, 0], [0, 1.8], [1.4, 1.8], [2, 2.4], [2, 3.4], [1.4, 4], [0.6, 4], [0, 3.4]]],
  6: [[[2, 0], [0.6, 0.8], [0, 2.4], [0, 3.4], [0.6, 4], [1.4, 4], [2, 3.4], [2, 2.6], [1.4, 2], [0, 2.2]]],
  7: [[[0, 0], [2, 0], [0.6, 4]]],
  8: [[[1, 2], [0.2, 1.4], [0.2, 0.6], [1, 0], [1.8, 0.6], [1.8, 1.4], [1, 2], [0.2, 2.6], [0.2, 3.4], [1, 4], [1.8, 3.4], [1.8, 2.6], [1, 2]]],
  9: [[[2, 1.6], [1, 2.2], [0, 1.6], [0, 0.6], [1, 0], [2, 0.6], [2, 3], [1.4, 4]]],
  "?": [[[0, 0.6], [0.6, 0], [1.4, 0], [2, 0.6], [2, 1.4], [1, 2.2], [1, 3]], [[1, 3.8], [1, 4]]],
};

function densify(stroke, id) {
  const out = [];
  for (let i = 1; i < stroke.length; i++) {
    const [x0, y0] = stroke[i - 1], [x1, y1] = stroke[i];
    const steps = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) * 8));
    for (let s = 0; s < steps; s++) out.push({ x: x0 + ((x1 - x0) * s) / steps, y: y0 + ((y1 - y0) * s) / steps, id });
  }
  const [lx, ly] = stroke[stroke.length - 1];
  out.push({ x: lx, y: ly, id });
  return out;
}

const TEMPLATES = Object.entries(G).map(([name, strokes]) => ({
  name,
  strokes: strokes.length,
  points: normalize(strokes.flatMap((s, i) => densify(s, i))),
}));

/* strokes: [[{x,y}, …], …]  →  [{ char, score }] best first (score 0..1) */
export function recognize(strokes) {
  const raw = strokes.flatMap((s, i) => s.map((p) => ({ x: p.x, y: p.y, id: i })));
  if (raw.length < 2) return [];
  const cloud = normalize(raw);
  const scored = TEMPLATES.map((t) => {
    const d = greedyCloudMatch(cloud, t.points);
    // mild preference for templates with the same stroke count
    const penalty = t.strokes === strokes.length ? 0 : 0.15 * Math.abs(t.strokes - strokes.length);
    return { char: t.name.toLowerCase(), score: Math.max(0, 1 - (d + penalty) / 4) };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3);
}

/* a tap (tiny stroke) is a full stop */
export function isDot(strokes) {
  if (strokes.length !== 1) return false;
  const s = strokes[0];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of s) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
  return maxX - minX < 8 && maxY - minY < 8;
}

export { G as GLYPH_TEMPLATES, densify };

/* ── word segmentation ───────────────────────────────────────────────── */

function bbox(pts) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
  return { minX, minY, maxX, maxY };
}
const union = (a, b) => ({ minX: Math.min(a.minX, b.minX), minY: Math.min(a.minY, b.minY), maxX: Math.max(a.maxX, b.maxX), maxY: Math.max(a.maxY, b.maxY) });

/* A long single stroke is probably cursive: slice it into letter-sized
   pieces at dips toward the baseline nearest to evenly spaced cut points. */
function splitCursive(stroke, H) {
  const b = bbox(stroke);
  const w = b.maxX - b.minX;
  const n = Math.min(8, Math.max(2, Math.round(w / H)));
  const targets = Array.from({ length: n - 1 }, (_, k) => b.minX + (w * (k + 1)) / n);
  const dips = [];
  for (let i = 1; i < stroke.length - 1; i++) {
    const p = stroke[i];
    if (p.y >= stroke[i - 1].y && p.y >= stroke[i + 1].y && p.y > b.maxY - 0.4 * H) dips.push(i);
  }
  const cuts = [];
  for (const t of targets) {
    let best = -1, bd = Infinity;
    for (const i of dips) { const d = Math.abs(stroke[i].x - t); if (d < bd && !cuts.includes(i)) { bd = d; best = i; } }
    if (best < 0 || bd > 0.35 * H) {
      for (let i = 1; i < stroke.length - 1; i++) { const d = Math.abs(stroke[i].x - t); if (d < bd && !cuts.includes(i)) { bd = d; best = i; } }
    }
    if (best > 0) cuts.push(best);
  }
  cuts.sort((a, c) => a - c);
  const segs = [];
  let start = 0;
  for (const c of cuts) if (c - start >= 2) { segs.push(stroke.slice(start, c + 1)); start = c; }
  segs.push(stroke.slice(start));
  return segs.filter((s) => s.length >= 2);
}

/* strokes drawn as a word → array of stroke-groups, one per character,
   left to right. Crossbars and dots are merged into the letter they sit on. */
export function segment(strokes) {
  if (!strokes.length) return [];
  const all = bbox(strokes.flat());
  const H = Math.max(all.maxY - all.minY, 1);
  const items = strokes.map((s) => ({ s, b: bbox(s) })).sort((a, c) => a.b.minX - c.b.minX);
  const groups = [];
  for (const it of items) {
    const g = groups[groups.length - 1];
    const w = it.b.maxX - it.b.minX, h = it.b.maxY - it.b.minY;
    const tiny = w < 0.15 * H && h < 0.15 * H;
    if (g) {
      const gw = g.b.maxX - g.b.minX;
      const overlap = Math.min(g.b.maxX, it.b.maxX) - Math.max(g.b.minX, it.b.minX);
      const cx = (it.b.minX + it.b.maxX) / 2;
      const inside = cx > g.b.minX - 0.08 * H && cx < g.b.maxX + 0.08 * H;
      const nearDot = tiny && it.b.minX - g.b.maxX < 0.2 * H;
      const touching = overlap > -0.05 * H; // posts of H / T / E meet their bars
      if (touching || overlap > 0.35 * Math.max(1, Math.min(gw, w)) || inside || nearDot) {
        g.strokes.push(it.s);
        g.b = union(g.b, it.b);
        continue;
      }
    }
    groups.push({ strokes: [it.s], b: it.b });
  }
  const out = [];
  for (const g of groups) {
    const w = g.b.maxX - g.b.minX;
    if (g.strokes.length === 1 && w > 1.6 * H) out.push(...splitCursive(g.strokes[0], H).map((s) => [s]));
    else out.push(g.strokes);
  }
  return out;
}

/* whole word → { text, last } where last = candidates for the final char */
export function recognizeWord(strokes) {
  const groups = segment(strokes);
  let text = "";
  let last = [];
  for (const g of groups) {
    if (isDot(g)) { text += "."; last = []; continue; }
    const c = recognize(g);
    if (c[0]) { text += c[0].char; last = c; }
  }
  return { text, last };
}
