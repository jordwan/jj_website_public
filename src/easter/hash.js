const enc = new TextEncoder();

export const ZERO = "0".repeat(64);

export async function sha256(str) {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(str));
    return [...new Uint8Array(buf)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback for non-secure contexts: FNV-1a widened to 64 hex chars.
  let out = "";
  for (let seed = 0; out.length < 64; seed++) {
    let h = (0x811c9dc5 ^ seed) >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    out += h.toString(16).padStart(8, "0");
  }
  return out;
}

export function hashBlock({ index, prevHash, data, nonce = 0 }) {
  return sha256(`${index}|${prevHash}|${data}|${nonce}`);
}

export const short = (h) => (h ? `${h.slice(0, 6)}…${h.slice(-4)}` : "");

export const randomHex = (n) =>
  Array.from({ length: n }, () => "0123456789abcdef"[(Math.random() * 16) | 0]).join("");

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
