import React, { useEffect, useMemo, useRef, useState } from "react";
import { sha256, short } from "./hash";
import { NOTE_MAX, compressSignature, leaveRemnant, timeAgo } from "./remnants";
import TextEntry from "./TextEntry";
import { svgPoint } from "./svg";

/* 1 ── handshake: a short glyph sequence to echo back */
const GLYPHS = ["◆", "◇", "●", "○", "▲", "△"];
function Handshake({ onCommit }) {
  const seq = useMemo(() => Array.from({ length: 4 }, () => GLYPHS[(Math.random() * 6) | 0]), []);
  const [shown, setShown] = useState(-1); // index currently flashing
  const [phase, setPhase] = useState("show");
  const [typed, setTyped] = useState([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (phase !== "show") return;
    let i = 0;
    setShown(0);
    const t = setInterval(() => {
      i++;
      if (i >= seq.length) {
        clearInterval(t);
        setShown(-1);
        setPhase("repeat");
      } else setShown(i);
    }, 650);
    return () => clearInterval(t);
  }, [phase, seq]);

  const press = (g) => {
    if (phase !== "repeat") return;
    const next = [...typed, g];
    if (seq[next.length - 1] !== g) {
      setShake(true);
      setTyped([]);
      setTimeout(() => {
        setShake(false);
        setPhase("show");
      }, 500);
      return;
    }
    setTyped(next);
    if (next.length === seq.length) setTimeout(() => onCommit("handshake", seq.join("")), 400);
  };

  return (
    <div className="eg-col">
      <div className={`eg-glyphs ${shake ? "shake" : ""}`}>
        {seq.map((g, i) => (
          <span key={i} className={shown === i ? "lit" : typed[i] ? "done" : ""}>
            {phase === "show" ? (shown === i ? g : "·") : typed[i] || "·"}
          </span>
        ))}
      </div>
      <div className="eg-keys">
        {GLYPHS.map((g) => (
          <button key={g} className="eg-key" onClick={() => press(g)} disabled={phase !== "repeat"}>
            {g}
          </button>
        ))}
      </div>
      <div className="eg-meta">
        <span>{phase === "show" ? "watch…" : "repeat the sequence"}</span>
      </div>
    </div>
  );
}

/* 2 ── keypair: gather entropy from movement, derive a public key */
function Keypair({ onCommit }) {
  const [moves, setMoves] = useState(0);
  const [pub, setPub] = useState("");
  const entropy = useRef("");
  const done = useRef(false);
  const need = 70;

  const onMove = (e) => {
    if (done.current) return;
    entropy.current += `${e.clientX | 0}${e.clientY | 0}${performance.now() | 0}`;
    setMoves((m) => m + 1);
  };

  useEffect(() => {
    if (moves < need || done.current) return;
    done.current = true;
    sha256(entropy.current).then((h) => {
      setPub(h);
      setTimeout(() => onCommit("keypair", `pub ${h}`), 900);
    });
  }, [moves, onCommit]);

  const pct = Math.min(100, Math.round((moves / need) * 100));
  return (
    <div className="eg-col">
      <div className="eg-pad eg-entropy" onPointerMove={onMove} onTouchMove={(e) => e.preventDefault()}>
        <div className="fill" style={{ width: `${pct}%` }} />
        <span>{pub ? `pub ${short(pub)}` : `entropy ${pct}%`}</span>
      </div>
      <div className="eg-meta">
        <span>{pub ? "key derived. private half never leaves this tab." : "move inside the box"}</span>
      </div>
    </div>
  );
}

/* 3 ── cipher: turn the key until the ciphertext resolves */
const PLAIN = "south okanagan, bc";
function Cipher({ onCommit }) {
  const key = useMemo(() => 1 + ((Math.random() * 62) | 0), []);
  const bytes = useMemo(() => [...PLAIN].map((c) => c.charCodeAt(0) ^ key), [key]);
  const [k, setK] = useState(0);
  const hit = k === key;

  useEffect(() => {
    if (!hit) return;
    const t = setTimeout(() => onCommit("cipher", `xor key ${key}`), 900);
    return () => clearTimeout(t);
  }, [hit, key, onCommit]);

  const decoded = bytes
    .map((b) => {
      const c = b ^ k;
      return c >= 32 && c < 127 ? String.fromCharCode(c) : "·";
    })
    .join("");

  return (
    <div className="eg-col">
      <div className="eg-meta">
        <span className="eg-hash-inline">{bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ")}</span>
      </div>
      <div className={`eg-oracle ${hit ? "" : "dim"}`}>{decoded}</div>
      <input className="eg-range" type="range" min={0} max={63} value={k} onChange={(e) => setK(+e.target.value)} />
      <div className="eg-meta">
        <span>{hit ? "decrypted · holding…" : `key ${k}`}</span>
      </div>
    </div>
  );
}

/* 4 ── ghosts: sign again, over the faint strokes of everyone before you */
function Ghosts({ blocks, remnants, onCommit }) {
  const [pts, setPts] = useState([]);
  const drawing = useRef(false);
  const box = useRef(null);
  const mine = useMemo(() => compressSignature(blocks.find((b) => b.label === "signature")?.data), [blocks]);
  const ghosts = useMemo(() => remnants.map((r) => r.sig).filter((s) => s?.length > 1).slice(0, 30), [remnants]);

  const pos = (e) => svgPoint(box.current, e);
  const down = (e) => {
    drawing.current = true;
    box.current.setPointerCapture(e.pointerId);
    setPts([pos(e)]);
  };
  const move = (e) => drawing.current && setPts((p) => [...p, pos(e)]);
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (pts.length >= 15) onCommit("ghosts", pts.map((p) => `${p.x | 0},${p.y | 0}`).join(";"));
    else setPts([]);
  };
  const path = (arr) =>
    arr
      .map((p) => (Array.isArray(p) ? p : [p.x, p.y]))
      .map(([x, y], i) => `${i ? "L" : "M"}${(+x).toFixed(1)} ${(+y).toFixed(1)}`)
      .join(" ");

  return (
    <div className="eg-col">
      <svg ref={box} className="eg-pad" viewBox="0 0 300 100" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {ghosts.map((g, i) => (
          <path key={i} className="ghost" d={path(g)} />
        ))}
        {mine.length > 1 && <path className="ghost mine" d={path(mine)} />}
        <path d={path(pts)} />
      </svg>
      <div className="eg-meta">
        <span>
          {ghosts.length ? `${ghosts.length} visitor${ghosts.length > 1 ? "s" : ""} signed here before you` : "no one has signed here yet"}
        </span>
      </div>
    </div>
  );
}

/* 5 ── mempool: fill a block with pending transactions */
function Mempool({ onCommit }) {
  const txs = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        fee: 1 + ((Math.random() * 9) | 0),
        size: 1 + ((Math.random() * 4) | 0),
      })),
    []
  );
  const cap = 8;
  const [sel, setSel] = useState([]);
  const weight = sel.reduce((s, i) => s + txs[i].size, 0);
  const fees = sel.reduce((s, i) => s + txs[i].fee, 0);
  const best = useMemo(() => {
    let b = 0;
    for (let m = 0; m < 64; m++) {
      let w = 0,
        f = 0;
      txs.forEach((t, i) => m & (1 << i) && ((w += t.size), (f += t.fee)));
      if (w <= cap) b = Math.max(b, f);
    }
    return b;
  }, [txs]);

  const toggle = (i) => setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  const over = weight > cap;
  return (
    <div className="eg-col">
      <div className="eg-txs">
        {txs.map((t) => (
          <button key={t.id} className={`eg-tx ${sel.includes(t.id) ? "in" : ""}`} onClick={() => toggle(t.id)}>
            <span>tx{t.id}</span>
            <span>fee {t.fee}</span>
            <span>size {t.size}</span>
          </button>
        ))}
      </div>
      <div className="eg-cap">
        <div className={`fill ${over ? "over" : ""}`} style={{ width: `${Math.min(100, (weight / cap) * 100)}%` }} />
      </div>
      <div className="eg-meta">
        <span>
          weight {weight} / {cap} · fees {fees} (best {best})
        </span>
        {sel.length > 0 && !over && (
          <button className="eg-link-btn" onClick={() => onCommit("mempool", `txs ${sel.join(",")} · fees ${fees}/${best}`)}>
            mine block →
          </button>
        )}
      </div>
    </div>
  );
}

/* 6 ── echoes: what previous visitors left behind */
function Echoes({ remnants, online, onCommit }) {
  const [pick, setPick] = useState(null);
  const list = remnants.slice(0, 8);
  const ack = (r) => {
    setPick(r.tip);
    setTimeout(() => onCommit("echoes", `ack ${short(r.tip)}`), 600);
  };
  if (!list.length)
    return (
      <div className="eg-col">
        <div className="eg-meta">
          <span>{online ? "you are the first. the next visitor will see you." : "offline · no echoes reachable."}</span>
        </div>
        <button className="eg-action" onClick={() => onCommit("echoes", "first")}>
          continue
        </button>
      </div>
    );
  return (
    <div className="eg-col">
      <div className="eg-echoes">
        {list.map((r) => (
          <button key={r.tip + r.n} className={`eg-echo ${pick === r.tip ? "in" : ""}`} onClick={() => !pick && ack(r)}>
            <span>#{r.n}</span>
            <span className="note">{r.note || "—"}</span>
            <span>{short(r.tip)}</span>
            <span>{timeAgo(r.ts)}</span>
          </button>
        ))}
      </div>
      <div className="eg-meta">
        <span>{online ? "tap one to acknowledge" : "local echoes · tap one"}</span>
      </div>
    </div>
  );
}

/* 7 ── timelock: wait out the block time, or nudge it along */
function Timelock({ onCommit }) {
  const [left, setLeft] = useState(10);
  const [taps, setTaps] = useState(0);
  const fired = useRef(false);
  useEffect(() => {
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 0.1)), 100);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (left > 0 || fired.current) return;
    fired.current = true;
    onCommit("timelock", `taps ${taps}`);
  }, [left, taps, onCommit]);
  return (
    <div className="eg-col">
      <button
        className="eg-action eg-hold"
        onClick={() => {
          setLeft((l) => Math.max(0, l - 0.4));
          setTaps((t) => t + 1);
        }}
      >
        {left > 0 ? `propagating · ${left.toFixed(1)}s` : "confirmed"}
      </button>
      <div className="eg-cap">
        <div className="fill" style={{ width: `${(1 - left / 10) * 100}%` }} />
      </div>
      <div className="eg-meta">
        <span>tap to nudge the network · {taps} nudges</span>
      </div>
    </div>
  );
}

/* 8 ── merkle: fold your first eight blocks into one root */
function Merkle({ blocks, onCommit }) {
  const leaves = useMemo(() => blocks.slice(0, 8).map((b) => b.hash), [blocks]);
  const [levels, setLevels] = useState(() => [leaves, Array(4).fill(null), Array(2).fill(null), [null]]);
  const compute = async (li, i) => {
    const below = levels[li - 1];
    const l = below[2 * i],
      r = below[2 * i + 1];
    if (!l || !r || levels[li][i]) return;
    const h = await sha256(l + r);
    setLevels((lv) => lv.map((row, ri) => (ri === li ? row.map((v, vi) => (vi === i ? h : v)) : row)));
    if (li === 3) setTimeout(() => onCommit("merkle", `root ${h}`), 900);
  };
  return (
    <div className="eg-col">
      <div className="eg-tree">
        {levels
          .slice()
          .reverse()
          .map((row, ri) => {
            const li = 3 - ri;
            return (
              <div key={li} className="eg-row">
                {row.map((v, i) => {
                  const below = levels[li - 1];
                  const ready = li > 0 && !v && !!below?.[2 * i] && !!below?.[2 * i + 1];
                  return (
                    <button
                      key={i}
                      className={`eg-node ${v ? "on" : ""} ${ready ? "ready" : ""}`}
                      disabled={!ready}
                      onClick={() => compute(li, i)}
                      title={v || ""}
                    >
                      {v ? v.slice(0, 6) : li === 0 ? "" : "·"}
                    </button>
                  );
                })}
              </div>
            );
          })}
      </div>
      <div className="eg-meta">
        <span>{levels[3][0] ? "root sealed" : "tap a node to hash the pair beneath it"}</span>
      </div>
    </div>
  );
}

/* 9 ── trace: leave something for the next visitor */
function Trace({ onCommit }) {
  const [v, setV] = useState("");
  const submit = (text = v) => onCommit("trace", (typeof text === "string" ? text : v).trim() || "silence");
  return (
    <div className="eg-col">
      <TextEntry value={v} onChange={setV} onSubmit={submit} autoFocus maxLength={NOTE_MAX} placeholder={`up to ${NOTE_MAX} characters`} />
      <div className="eg-meta">
        <span>this will be visible to future visitors.</span>
        <button className="eg-link-btn" onClick={() => onCommit("trace", "silence")}>
          pass in silence →
        </button>
      </div>
    </div>
  );
}

/* 10 ── anchor: link your chain to everyone who came before */
function Anchor({ blocks, remnants, online, onCommit }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const tip = blocks[blocks.length - 1].hash;
  const prev = remnants[0]?.tip ?? null;
  const note = blocks.find((b) => b.label === "trace")?.data;
  const sig = compressSignature(blocks.find((b) => b.label === "ghosts")?.data);

  async function anchor() {
    setBusy(true);
    setErr("");
    const res = await leaveRemnant({ tip, note: note === "silence" ? "" : note, sig });
    const where = res.online ? "" : " · stored locally";
    onCommit("anchor", `visitor #${res.n}${res.prevTip ? ` · after ${short(res.prevTip)}` : " · genesis visitor"}${where}`);
    setBusy(false);
  }

  return (
    <div className="eg-col">
      <div className="eg-ledger">
        <div>{prev ? `previous visitor · ${short(prev)}` : "no previous visitor"}</div>
        <div className="accent">your chain · {short(tip)}</div>
      </div>
      <div className="eg-meta">
        <span>shares: your tip hash, your trace, your signature outline. nothing else.{online ? "" : " (offline: stays in this browser)"}</span>
      </div>
      <button className="eg-action" onClick={anchor} disabled={busy}>
        {busy ? "anchoring…" : "anchor to the visitor chain"}
      </button>
      {err && <div className="eg-status">{err}</div>}
    </div>
  );
}

export const STEPS2 = [
  { name: "handshake", prompt: "another node is listening. echo its greeting.", component: Handshake },
  { name: "keypair", prompt: "every node needs an identity. gather entropy.", component: Keypair },
  { name: "cipher", prompt: "a message arrived encrypted. find the key.", component: Cipher },
  { name: "ghosts", prompt: "sign again. you are not the first here.", component: Ghosts },
  { name: "mempool", prompt: "transactions are waiting. fill the block.", component: Mempool },
  { name: "echoes", prompt: "traces left by other visitors.", component: Echoes },
  { name: "timelock", prompt: "blocks take time. or a little encouragement.", component: Timelock },
  { name: "merkle", prompt: "fold your first eight blocks into one root.", component: Merkle },
  { name: "trace", prompt: "leave something for whoever comes next.", component: Trace },
  { name: "anchor", prompt: "link your chain to everyone who came before.", component: Anchor },
];
