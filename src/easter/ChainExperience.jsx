import React, { useCallback, useEffect, useRef, useState } from "react";
import { ZERO, hashBlock, randomHex, short, sleep } from "./hash";
import { STEPS } from "./steps";
import "./Easter.css";

export const TOTAL = STEPS.length;

/* All chain state lives here so the terminal can read it too. */
export function useChain() {
  const [blocks, setBlocks] = useState([]);
  const [mining, setMining] = useState(false);
  const [display, setDisplay] = useState("");
  const [open, setOpen] = useState(false);
  const blocksRef = useRef(blocks);
  const miningRef = useRef(false);
  blocksRef.current = blocks;

  const commit = useCallback(async (label, data, extra = {}) => {
    const cur = blocksRef.current;
    const index = cur.length;
    if (index >= TOTAL || miningRef.current) return;
    const prevHash = index ? cur[index - 1].hash : ZERO;
    const nonce = extra.nonce ?? 0;
    miningRef.current = true;
    setMining(true);
    const hash = extra.hash ?? (await hashBlock({ index, prevHash, data, nonce }));
    for (let i = 0; i <= 16; i++) {
      setDisplay(hash.slice(0, i * 4) + randomHex(64 - i * 4));
      await sleep(35);
    }
    setBlocks((b) => [...b, { index, label, data, prevHash, nonce, hash, time: Date.now() }]);
    miningRef.current = false;
    setMining(false);
  }, []);

  const reset = useCallback(() => {
    setBlocks([]);
    setDisplay("");
  }, []);

  return { blocks, mining, display, commit, reset, open, setOpen };
}

function ChainBar({ blocks }) {
  const n = blocks.length;
  return (
    <div className="eg-bar">
      {Array.from({ length: TOTAL }, (_, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className={`eg-link ${i < n ? "on" : ""}`} />}
          <span
            className={`eg-block ${i < n ? "on" : ""} ${i === n ? "now" : ""}`}
            title={i < n ? `block ${i} · ${short(blocks[i].hash)}` : `block ${i}`}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

function Explorer({ blocks, onReset }) {
  const [status, setStatus] = useState("");

  async function verify() {
    for (const b of blocks) {
      const h = await hashBlock(b);
      const prevOk = b.index === 0 ? b.prevHash === ZERO : b.prevHash === blocks[b.index - 1].hash;
      if (h !== b.hash || !prevOk) {
        setStatus(`✕ block ${b.index} invalid`);
        return;
      }
      setStatus(`✓ block ${b.index} ok`);
      await sleep(90);
    }
    setStatus(`✓ chain valid · ${blocks.length} / ${TOTAL} blocks`);
  }

  function exportChain() {
    const blob = new Blob([JSON.stringify(blocks, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "jordwan-chain.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="eg-explorer">
      <div className="eg-list">
        {blocks.map((b) => (
          <div key={b.index} title={b.hash}>
            <span>{b.index}</span>
            <span>{short(b.hash)}</span>
            <span>
              {b.label} · {b.data}
            </span>
          </div>
        ))}
      </div>
      <div className="eg-actions">
        <button onClick={verify}>verify</button>
        <button onClick={exportChain}>export</button>
        <button onClick={onReset}>reset</button>
      </div>
      <div className="eg-status">{status}</div>
    </div>
  );
}

export default function ChainExperience({ chain }) {
  const { blocks, mining, display, commit, reset, open, setOpen } = chain;
  const n = blocks.length;
  const done = n >= TOTAL;
  const step = STEPS[n];
  const last = blocks[n - 1];

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !e.defaultPrevented) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const Step = step?.component;
  return (
    <section className="eg" aria-live="polite">
      <div className="eg-head">
        <span>{done ? "chain sealed" : `block ${n + 1} / ${TOTAL} · ${step.name}`}</span>
        <button className="eg-x" onClick={() => setOpen(false)}>
          esc
        </button>
      </div>
      {!done && <p className="eg-prompt">{mining ? "mining…" : step.prompt}</p>}
      <div className="eg-body">
        {mining ? (
          <div className="eg-hash">{display}</div>
        ) : done ? (
          <Explorer blocks={blocks} onReset={reset} />
        ) : (
          <Step key={n} index={n} prevHash={last?.hash ?? ZERO} blocks={blocks} onCommit={commit} />
        )}
      </div>
      {last && !mining && !done && (
        <p className="eg-last">
          ✓ block {last.index} sealed · {short(last.hash)}
        </p>
      )}
      <ChainBar blocks={blocks} />
    </section>
  );
}
