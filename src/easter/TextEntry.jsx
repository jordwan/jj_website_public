import React, { useEffect, useRef, useState } from "react";
import { sha256, randomHex } from "./hash";
import { svgPoint } from "./svg";

export const isTouch = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

const INK_PAUSE = 1500; // ms after the pen lifts before the ink is hashed
const HASH_LEN = 16;

/* Desktop: a keyboard field with an "ent" button.
   Touch: an ink pad. Draw anything; after a pause the ink becomes a hash,
   and that hash is the input. ⌨ switches to the real keyboard. */
export default function TextEntry({ value, onChange, onSubmit, placeholder, maxLength = 64, autoFocus }) {
  const touch = isTouch();
  const [mode, setMode] = useState(() => (touch ? "pad" : "keys"));
  const inputRef = useRef(null);

  const submit = (e) => {
    if (e && typeof e === "object" && "preventDefault" in e) e.preventDefault();
    onSubmit?.(typeof e === "string" ? e : value);
  };

  // iOS only opens the keyboard for a focus() made inside the tap itself, so
  // the input is always mounted; the pad just hides it.
  const toKeyboard = () => {
    inputRef.current?.focus();
    setMode("keys");
  };

  return (
    <div className="te-wrap">
      <form className={`te ${mode === "pad" ? "te-off" : ""}`} onSubmit={submit} aria-hidden={mode === "pad"}>
        <input
          ref={inputRef}
          className="eg-input"
          autoFocus={autoFocus && !touch}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          tabIndex={mode === "pad" ? -1 : 0}
        />
        {onSubmit && mode === "keys" && (
          <button type="submit" className="te-ent" disabled={!value.trim()}>
            ent
          </button>
        )}
        {touch && mode === "keys" && (
          <button type="button" className="te-mode" onClick={() => setMode("pad")} title="draw instead">
            ✎
          </button>
        )}
      </form>
      {mode === "pad" && (
        <InkPad
          value={value}
          onChange={(v) => onChange(v.slice(0, maxLength))}
          onSubmit={onSubmit ? submit : undefined}
          placeholder={placeholder}
          onKeyboard={toKeyboard}
        />
      )}
    </div>
  );
}

function InkPad({ value, onChange, onSubmit, placeholder, onKeyboard }) {
  const [strokes, setStrokes] = useState([]);
  const [pending, setPending] = useState(false);
  const [reading, setReading] = useState(false);
  const [display, setDisplay] = useState(value);
  const drawing = useRef(false);
  const box = useRef(null);
  const timer = useRef(null);
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;

  const pos = (e) => svgPoint(box.current, e);
  const down = (e) => {
    e.preventDefault();
    clearTimeout(timer.current);
    setPending(false);
    drawing.current = true;
    box.current.setPointerCapture(e.pointerId);
    setStrokes((s) => [...s, [pos(e)]]);
  };
  const move = (e) => {
    if (!drawing.current) return;
    setStrokes((s) => {
      const last = s[s.length - 1];
      return [...s.slice(0, -1), [...last, pos(e)]];
    });
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    clearTimeout(timer.current);
    setPending(true);
    timer.current = setTimeout(hashInk, INK_PAUSE);
  };

  /* all ink on the pad → one hash */
  const inkHash = async () => {
    const s = strokesRef.current;
    if (!s.length) return "";
    const data = s.map((st) => st.map((p) => `${p.x | 0},${p.y | 0}`).join(";")).join("|");
    return (await sha256(data)).slice(0, HASH_LEN);
  };
  /* looks like it's reading the handwriting, then commits to a hash */
  const LETTERS = "abcdefghijklmnopqrstuvwxyz";
  const guess = (n) => Array.from({ length: n }, () => LETTERS[(Math.random() * 26) | 0]).join("");
  const hashInk = async () => {
    setPending(false);
    const h = await inkHash();
    if (!h) return;
    setReading(true);
    const n = Math.max(3, Math.min(HASH_LEN, Math.round(strokesRef.current.length * 1.4)));
    for (let i = 0; i < 12; i++) {
      setDisplay(guess(n));
      await new Promise((r) => setTimeout(r, 55));
    }
    for (let i = 0; i <= HASH_LEN; i += 2) {
      setDisplay(h.slice(0, i) + guess(HASH_LEN - i));
      await new Promise((r) => setTimeout(r, 40));
    }
    setDisplay(h);
    onChange(h);
    setReading(false);
  };

  /* ent while ink is still pending: hash it first */
  const submitNow = async () => {
    clearTimeout(timer.current);
    setPending(false);
    const h = strokesRef.current.length ? await inkHash() : value;
    if (!h) return;
    onChange(h);
    setTimeout(() => onSubmit(h), 0);
  };
  const clear = () => {
    clearTimeout(timer.current);
    setPending(false);
    setStrokes([]);
    setDisplay("");
    onChange("");
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const path = (s) => s.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="te te-pad">
      <div className="te-out">
        {display ? <span className="te-hash">{display}</span> : <span className="ph">{placeholder}</span>}
        <span className="te-caret">_</span>
      </div>
      <svg
        ref={box}
        className={`eg-pad te-canvas ${pending ? "pending" : ""} ${reading ? "reading" : ""}`}
        viewBox="0 0 300 120"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        {strokes.map((s, i) => (
          <path key={i} d={path(s)} />
        ))}
        {reading && <line className="scan" x1="0" y1="0" x2="0" y2="120" />}
        {!strokes.length && !value && (
          <text x="150" y="112" className="te-tip">
            draw anything · your ink becomes a hash
          </text>
        )}
      </svg>
      <div className="te-wait">
        <div className={`fill ${pending ? "run" : ""}`} style={{ transitionDuration: `${INK_PAUSE}ms` }} />
      </div>
      <div className="te-row">
        <div className="eg-meta">
          <span>{reading ? "reading ink…" : pending ? "…" : strokes.length ? "keep drawing or press ent" : ""}</span>
        </div>
        <div className="te-keys">
          <button type="button" className="te-mode te-kbd" onClick={onKeyboard} title="use the keyboard" aria-label="use the keyboard">
            ⌨
          </button>
          <button type="button" onClick={clear} title="clear">
            ⌫
          </button>
          {onSubmit && (
            <button type="button" className="te-ent" onClick={submitNow} disabled={!value && !strokes.length}>
              ent
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
