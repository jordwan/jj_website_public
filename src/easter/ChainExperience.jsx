import React, { useCallback, useEffect, useRef, useState } from "react";
import { ZERO, hashBlock, randomHex, short, sleep } from "./hash";
import { STEPS } from "./steps";
import { STEPS2 } from "./steps2";
import { loadRemnants } from "./remnants";
import "./Easter.css";

export const LEVELS = [STEPS, STEPS2];
export const PER_LEVEL = 10;
export const TOTAL = LEVELS.length * PER_LEVEL;
const SAVE_KEY = "jordwan.chain";

function loadSaved() {
  try {
    const b = JSON.parse(localStorage.getItem(SAVE_KEY) || "[]");
    return Array.isArray(b) ? b.slice(0, TOTAL) : [];
  } catch {
    return [];
  }
}

/* All chain state lives here so the terminal can read it too. */
export function useChain() {
  const [blocks, setBlocks] = useState(loadSaved);
  const [mining, setMining] = useState(false);
  const [display, setDisplay] = useState("");
  const [open, setOpen] = useState(false);
  const blocksRef = useRef(blocks);
  const miningRef = useRef(false);
  blocksRef.current = blocks;

  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(blocks));
    } catch {
      /* ignore */
    }
  }, [blocks]);

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

  const level = Math.min(LEVELS.length - 1, Math.floor(blocks.length / PER_LEVEL));
  return { blocks, mining, display, commit, reset, open, setOpen, level };
}

function ChainBar({ blocks, level }) {
  const base = level * PER_LEVEL;
  const n = blocks.length - base;
  return (
    <div className="eg-bar">
      {Array.from({ length: PER_LEVEL }, (_, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className={`eg-link ${i < n ? "on" : ""}`} />}
          <span
            className={`eg-block ${i < n ? "on" : ""} ${i === n ? "now" : ""}`}
            title={i < n ? `block ${base + i} · ${short(blocks[base + i].hash)}` : `block ${base + i}`}
          />
        </React.Fragment>
      ))}
    </div>
  );
}

function Explorer({ blocks, onReset, onContinue }) {
  const [status, setStatus] = useState("");
  const complete = blocks.length >= TOTAL;
  const level = Math.floor(blocks.length / PER_LEVEL);
  const anchor = blocks.find((b) => b.label === "anchor");

  async function verify() {
    for (const b of blocks) {
      const h = await hashBlock(b);
      const prevOk = b.index === 0 ? b.prevHash === ZERO : b.prevHash === blocks[b.index - 1].hash;
      if (h !== b.hash || !prevOk) {
        setStatus(`✕ block ${b.index} invalid`);
        return;
      }
      setStatus(`✓ block ${b.index} ok`);
      await sleep(60);
    }
    setStatus(complete ? `✓ chain valid · ${TOTAL} / ${TOTAL} blocks` : `✓ level ${level} valid · ${blocks.length} blocks`);
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
      {anchor && <div className="eg-status">{anchor.data}</div>}
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
      {!complete && (
        <button className="eg-action eg-continue" onClick={onContinue}>
          level {level + 1} unlocked · continue →
        </button>
      )}
    </div>
  );
}

export default function ChainExperience({ chain }) {
  const { blocks, mining, display, commit, reset, open, setOpen, level } = chain;
  const n = blocks.length;
  const complete = n >= TOTAL;
  const atBoundary = n > 0 && n % PER_LEVEL === 0;
  const [resumed, setResumed] = useState(-1);
  const showExplorer = complete || (atBoundary && resumed !== n);
  const steps = LEVELS[level];
  const step = steps[n % PER_LEVEL];
  const last = blocks[n - 1];

  const [rem, setRem] = useState({ remnants: [], count: 0, online: false, loaded: false });
  useEffect(() => {
    if (!open || level < 1 || rem.loaded) return;
    let live = true;
    loadRemnants().then((r) => live && setRem({ ...r, loaded: true }));
    return () => {
      live = false;
    };
  }, [open, level, rem.loaded]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !e.defaultPrevented) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (!confirm) return;
    const t = setTimeout(() => setConfirm(false), 3000);
    return () => clearTimeout(t);
  }, [confirm]);
  const restart = () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setConfirm(false);
    reset();
    setResumed(-1);
  };

  if (!open) return null;

  const Step = step?.component;
  const title = complete
    ? "chain complete"
    : showExplorer
      ? `level ${level} sealed`
      : `L${level + 1} · block ${(n % PER_LEVEL) + 1} / ${PER_LEVEL} · ${step.name}`;

  return (
    <section className={`eg ${level > 0 ? "l2" : ""}`} aria-live="polite">
      <div className="eg-head">
        <span>{title}</span>
        <span className="eg-head-actions">
          {n > 0 && (
            <button className={`eg-x ${confirm ? "warn" : ""}`} onClick={restart}>
              {confirm ? "sure? tap again" : "restart"}
            </button>
          )}
          <button className="eg-x" onClick={() => setOpen(false)}>
            esc
          </button>
        </span>
      </div>
      {!showExplorer && <p className="eg-prompt">{mining ? "mining…" : step.prompt}</p>}
      <div className="eg-body">
        {mining ? (
          <div className="eg-hash">{display}</div>
        ) : showExplorer ? (
          <Explorer
            blocks={blocks}
            onReset={() => {
              reset();
              setResumed(-1);
            }}
            onContinue={() => setResumed(n)}
          />
        ) : (
          <Step
            key={n}
            index={n}
            prevHash={last?.hash ?? ZERO}
            blocks={blocks}
            remnants={rem.remnants}
            online={rem.online}
            onCommit={commit}
          />
        )}
      </div>
      {last && !mining && !showExplorer && (
        <p className="eg-last">
          ✓ block {last.index} sealed · {short(last.hash)}
        </p>
      )}
      {!complete && <ChainBar blocks={blocks} level={showExplorer ? level - 1 : level} />}
    </section>
  );
}
