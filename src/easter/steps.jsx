import React, { useEffect, useMemo, useRef, useState } from "react";
import { hashBlock, randomHex, sha256, short } from "./hash";

/* 1 ── genesis: a single tap */
function Genesis({ onCommit }) {
  return (
    <button className="eg-action" onClick={() => onCommit("genesis", "genesis")}>
      tap to mine the genesis block
    </button>
  );
}

/* 2 ── proof of work: hold to grind nonces until the hash starts with 000 */
function ProofOfWork({ index, prevHash, onCommit }) {
  const [nonce, setNonce] = useState(0);
  const [hash, setHash] = useState("");
  const holding = useRef(false);
  const nonceRef = useRef(0);
  const finished = useRef(false);
  const data = "proof-of-work";

  async function grind() {
    while (holding.current && !finished.current) {
      let n = nonceRef.current;
      let h = "";
      for (let i = 0; i < 25; i++) {
        h = await hashBlock({ index, prevHash, data, nonce: n });
        const target = n > 6000 ? "00" : "000";
        if (h.startsWith(target)) {
          finished.current = true;
          nonceRef.current = n;
          setNonce(n);
          setHash(h);
          onCommit("proof of work", data, { nonce: n, hash: h });
          return;
        }
        n++;
      }
      nonceRef.current = n;
      setNonce(n);
      setHash(h);
      await new Promise(requestAnimationFrame);
    }
  }

  const start = (e) => {
    e.preventDefault();
    if (holding.current) return;
    holding.current = true;
    grind();
  };
  const stop = () => {
    holding.current = false;
  };

  return (
    <div className="eg-col">
      <button
        className={`eg-action eg-hold ${holding.current ? "is-holding" : ""}`}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onContextMenu={(e) => e.preventDefault()}
      >
        hold to mine
      </button>
      <div className="eg-meta">
        <span>nonce {nonce}</span>
        <span className="eg-hash-inline">{hash || "—"}</span>
      </div>
    </div>
  );
}

/* 3 ── signature: draw a gesture, the stroke becomes the block data */
function Signature({ onCommit }) {
  const [pts, setPts] = useState([]);
  const drawing = useRef(false);
  const box = useRef(null);

  const pos = (e) => {
    const r = box.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 300, y: ((e.clientY - r.top) / r.height) * 100 };
  };
  const down = (e) => {
    drawing.current = true;
    box.current.setPointerCapture(e.pointerId);
    setPts([pos(e)]);
  };
  const move = (e) => {
    if (!drawing.current) return;
    setPts((p) => [...p, pos(e)]);
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (pts.length >= 15) {
      const data = pts.map((p) => `${p.x | 0},${p.y | 0}`).join(";");
      onCommit("signature", data);
    } else {
      setPts([]);
    }
  };

  const d = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  return (
    <div className="eg-col">
      <svg
        ref={box}
        className="eg-pad"
        viewBox="0 0 300 100"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <path d={d} />
      </svg>
      <div className="eg-meta">
        <span>{pts.length ? `${pts.length} points` : "draw anything in the box"}</span>
      </div>
    </div>
  );
}

/* 4 ── message: a line of text written into the chain */
function Message({ onCommit }) {
  const [v, setV] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (v.trim()) onCommit("message", v.trim());
  };
  return (
    <form className="eg-col" onSubmit={submit}>
      <input
        className="eg-input"
        autoFocus
        maxLength={64}
        placeholder="type something, press enter"
        value={v}
        onChange={(e) => setV(e.target.value)}
      />
    </form>
  );
}

/* 5 ── peers: tap each node to bring it online and link the network */
function Peers({ onCommit }) {
  const nodes = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: 20 + Math.random() * 260,
        y: 15 + Math.random() * 70,
      })),
    []
  );
  const [order, setOrder] = useState([]);

  const tap = (id) => {
    if (order.includes(id)) return;
    const next = [...order, id];
    setOrder(next);
    if (next.length === nodes.length) {
      setTimeout(() => onCommit("peers", next.join(">")), 500);
    }
  };

  const linked = order.map((id) => nodes[id]);
  return (
    <div className="eg-col">
      <svg className="eg-pad eg-peers" viewBox="0 0 300 100">
        {linked.slice(1).map((n, i) => (
          <line key={i} x1={linked[i].x} y1={linked[i].y} x2={n.x} y2={n.y} />
        ))}
        {nodes.map((n) => (
          <circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            r={5}
            className={order.includes(n.id) ? "on" : ""}
            onPointerDown={() => tap(n.id)}
          />
        ))}
      </svg>
      <div className="eg-meta">
        <span>
          {order.length} / {nodes.length} peers online
        </span>
      </div>
    </div>
  );
}

/* 6 ── tamper: edit an old block and watch everything after it break */
function Tamper({ blocks, onCommit }) {
  const target = blocks.find((b) => b.label === "message") ?? blocks[blocks.length - 1];
  const [v, setV] = useState(target.data);
  const [newHash, setNewHash] = useState(target.hash);
  const touched = v !== target.data;

  useEffect(() => {
    let live = true;
    hashBlock({ ...target, data: v }).then((h) => live && setNewHash(h));
    return () => {
      live = false;
    };
  }, [v, target]);

  const after = blocks.filter((b) => b.index > target.index);
  return (
    <div className="eg-col">
      <input className="eg-input" value={v} onChange={(e) => setV(e.target.value)} />
      <div className="eg-ledger">
        <div className={touched ? "bad" : ""}>
          block {target.index} · {short(target.hash)} → {short(newHash)}
        </div>
        {after.map((b) => (
          <div key={b.index} className={touched ? "bad" : ""}>
            block {b.index} · {touched ? "✕ prev hash mismatch" : `✓ ${short(b.hash)}`}
          </div>
        ))}
      </div>
      {touched && (
        <button className="eg-action" onClick={() => onCommit("tamper rejected", "immutability verified")}>
          chain rejected the edit · restore
        </button>
      )}
    </div>
  );
}

/* 7 ── consensus: two forks, pick one */
function Consensus({ onCommit }) {
  const forks = useMemo(
    () => [
      { id: "a", hash: randomHex(64), peers: 7 },
      { id: "b", hash: randomHex(64), peers: 5 },
    ],
    []
  );
  const [pick, setPick] = useState(null);
  const choose = (f) => {
    setPick(f.id);
    const note = f.peers >= 7 ? "longest chain" : "minority fork · reorg to longest";
    setTimeout(() => onCommit("consensus", `fork ${f.id} · ${note}`), 700);
  };
  return (
    <div className="eg-forks">
      {forks.map((f) => (
        <button
          key={f.id}
          className={`eg-fork ${pick && pick !== f.id ? "out" : ""} ${pick === f.id ? "in" : ""}`}
          onClick={() => !pick && choose(f)}
        >
          <span>fork {f.id}</span>
          <span>{f.peers} peers</span>
          <span className="eg-hash-inline">{short(f.hash)}</span>
        </button>
      ))}
    </div>
  );
}

/* 8 ── sync: slide the phase until the two waves lock */
function Sync({ onCommit }) {
  const target = useMemo(() => 30 + Math.floor(Math.random() * 300), []);
  const [phase, setPhase] = useState(0);
  const diff = Math.min(Math.abs(phase - target), 360 - Math.abs(phase - target));
  const locked = diff <= 6;

  useEffect(() => {
    if (!locked) return;
    const t = setTimeout(() => onCommit("sync", `phase ${phase}°`), 900);
    return () => clearTimeout(t);
  }, [locked, phase, onCommit]);

  const wave = (deg) =>
    Array.from({ length: 61 }, (_, i) => {
      const x = i * 5;
      const y = 50 - 30 * Math.sin((x / 300) * Math.PI * 4 + (deg * Math.PI) / 180);
      return `${i ? "L" : "M"}${x} ${y.toFixed(1)}`;
    }).join(" ");

  return (
    <div className="eg-col">
      <svg className={`eg-pad eg-wave ${locked ? "locked" : ""}`} viewBox="0 0 300 100">
        <path className="ref" d={wave(target)} />
        <path className="you" d={wave(phase)} />
      </svg>
      <input
        className="eg-range"
        type="range"
        min={0}
        max={360}
        value={phase}
        onChange={(e) => setPhase(Number(e.target.value))}
      />
      <div className="eg-meta">
        <span>{locked ? "locked · holding…" : `drift ${diff}°`}</span>
      </div>
    </div>
  );
}

/* 9 ── oracle: ask a question, the chain answers deterministically */
const ANSWERS = [
  "yes.",
  "no.",
  "not yet.",
  "ask again after the next block.",
  "almost certainly.",
  "unlikely.",
  "consensus: yes.",
  "the nodes disagree.",
];
function Oracle({ prevHash, onCommit }) {
  const [q, setQ] = useState("");
  const [asked, setAsked] = useState("");
  const [shown, setShown] = useState("");
  const [full, setFull] = useState("");

  const ask = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    const h = await sha256(q.trim() + prevHash);
    setAsked(q.trim());
    setFull(ANSWERS[parseInt(h.slice(0, 2), 16) % ANSWERS.length]);
  };

  useEffect(() => {
    if (!full) return;
    let i = 0;
    setShown("");
    const t = setInterval(() => {
      i++;
      setShown(full.slice(0, i));
      if (i >= full.length) clearInterval(t);
    }, 45);
    return () => clearInterval(t);
  }, [full]);

  return (
    <div className="eg-col">
      {!asked ? (
        <form onSubmit={ask}>
          <input
            className="eg-input"
            autoFocus
            maxLength={80}
            placeholder="ask the chain a yes / no question"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>
      ) : (
        <>
          <div className="eg-meta">
            <span>{asked}</span>
          </div>
          <div className="eg-oracle">{shown}</div>
          {shown === full && (
            <button className="eg-action" onClick={() => onCommit("oracle", asked)}>
              accept
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* 10 ── seal */
function Seal({ onCommit }) {
  return (
    <button className="eg-action" onClick={() => onCommit("seal", "sealed")}>
      tap to seal the chain
    </button>
  );
}

export const STEPS = [
  { name: "genesis", prompt: "every chain starts with one block.", component: Genesis },
  { name: "proof of work", prompt: "find a hash that starts with 000. hold.", component: ProofOfWork },
  { name: "signature", prompt: "sign the block with a gesture.", component: Signature },
  { name: "message", prompt: "write something into the chain. it stays.", component: Message },
  { name: "peers", prompt: "bring the network online.", component: Peers },
  { name: "tamper", prompt: "try to change what you wrote earlier.", component: Tamper },
  { name: "consensus", prompt: "two forks. choose one.", component: Consensus },
  { name: "sync", prompt: "tune your node to the network.", component: Sync },
  { name: "oracle", prompt: "the chain will answer. deterministically.", component: Oracle },
  { name: "seal", prompt: "ten blocks. one last tap.", component: Seal },
];
