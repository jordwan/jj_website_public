import React, { useEffect, useRef, useState } from "react";
import { recognizeWord } from "./recognizer";
import { svgPoint } from "./svg";

const WORD_PAUSE = 1500; // ms after the pen lifts before the word is read

export const isTouch = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

/* Desktop: a keyboard field with an "ent" button.
   Touch: a glyph pad. Write one block capital at a time; it becomes text.
   Candidates let you fix a miss; space / ⌫ / ent are buttons; "abc" falls
   back to the normal keyboard. */
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
        <GlyphPad
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

function GlyphPad({ value, onChange, onSubmit, placeholder, onKeyboard }) {
  const [strokes, setStrokes] = useState([]);
  const [cands, setCands] = useState([]);
  const [flash, setFlash] = useState(false);
  const [pending, setPending] = useState(false);
  const drawing = useRef(false);
  const box = useRef(null);
  const timer = useRef(null);
  const strokesRef = useRef(strokes);
  const valueRef = useRef(value);
  strokesRef.current = strokes;
  valueRef.current = value;

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
    setPending(true); // keep drawing: the word is read after a pause
    timer.current = setTimeout(finish, WORD_PAUSE);
  };

  /* read everything drawn so far as one word */
  const finish = () => {
    const s = strokesRef.current;
    setPending(false);
    if (!s.length) return;
    const { text, last } = recognizeWord(s);
    if (text) onChange(valueRef.current + text);
    setCands(last);
    setFlash(true);
    setTimeout(() => {
      setStrokes([]);
      setFlash(false);
    }, 180);
  };

  /* space / ent while ink is still on the pad: read it first */
  const flushThen = (fn) => {
    clearTimeout(timer.current);
    if (strokesRef.current.length) {
      const { text, last } = recognizeWord(strokesRef.current);
      const next = valueRef.current + text;
      setStrokes([]);
      setPending(false);
      setCands(last);
      fn(next);
    } else fn(valueRef.current);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const pick = (c) => {
    onChange(value.slice(0, -1) + c);
    setCands([]);
  };

  const path = (s) => s.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="te te-pad">
      <div className="te-out">
        {value ? <span>{value}</span> : <span className="ph">{placeholder}</span>}
        <span className="te-caret">_</span>
      </div>
      <svg
        ref={box}
        className={`eg-pad te-canvas ${flash ? "flash" : ""}`}
        viewBox="0 0 300 120"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <line className="guide" x1="0" y1="60" x2="300" y2="60" />
        {strokes.map((s, i) => (
          <path key={i} d={path(s)} />
        ))}
        {!strokes.length && !value && (
          <text x="150" y="112" className="te-tip">
            write a word in capitals · tap for . · pause to convert
          </text>
        )}
      </svg>
      <div className="te-wait">
        <div className={`fill ${pending ? "run" : ""}`} style={{ transitionDuration: `${WORD_PAUSE}ms` }} />
      </div>
      <div className="te-row">
        <div className="te-cands">
          {cands.slice(1).map((c) => (
            <button key={c.char} type="button" onClick={() => pick(c.char)} title="replace last letter">
              {c.char}
            </button>
          ))}
        </div>
        <div className="te-keys">
          <button type="button" onClick={() => flushThen((v) => onChange(v + " "))}>
            space
          </button>
          <button type="button" className="te-mode te-kbd" onClick={onKeyboard} title="use the keyboard" aria-label="use the keyboard">
            ⌨
          </button>
          <button type="button" onClick={() => onChange(value.slice(0, -1))}>
            ⌫
          </button>
          {onSubmit && (
            <button
              type="button"
              className="te-ent"
              onClick={() =>
                flushThen((v) => {
                  onChange(v);
                  setTimeout(() => onSubmit(v), 0);
                })
              }
              disabled={!value.trim() && !strokes.length}
            >
              ent
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
