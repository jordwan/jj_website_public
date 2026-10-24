import React, { useEffect, useRef, useState } from "react";
import { isDot, recognize } from "./recognizer";

export const isTouch = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

/* Desktop: a keyboard field with an "ent" button.
   Touch: a glyph pad. Write one block capital at a time; it becomes text.
   Candidates let you fix a miss; space / ⌫ / ent are buttons; "abc" falls
   back to the normal keyboard. */
export default function TextEntry({ value, onChange, onSubmit, placeholder, maxLength = 64, autoFocus }) {
  const [useKeyboard, setUseKeyboard] = useState(() => !isTouch());

  const submit = (e) => {
    e?.preventDefault?.();
    onSubmit?.(value);
  };

  if (useKeyboard) {
    return (
      <form className="te" onSubmit={submit}>
        <input
          className="eg-input"
          autoFocus={autoFocus}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {onSubmit && (
          <button type="submit" className="te-ent" disabled={!value.trim()}>
            ent
          </button>
        )}
        {isTouch() && (
          <button type="button" className="te-mode" onClick={() => setUseKeyboard(false)}>
            draw
          </button>
        )}
      </form>
    );
  }

  return (
    <GlyphPad
      value={value}
      onChange={(v) => onChange(v.slice(0, maxLength))}
      onSubmit={onSubmit ? submit : undefined}
      placeholder={placeholder}
      onKeyboard={() => setUseKeyboard(true)}
    />
  );
}

function GlyphPad({ value, onChange, onSubmit, placeholder, onKeyboard }) {
  const [strokes, setStrokes] = useState([]);
  const [cands, setCands] = useState([]);
  const [flash, setFlash] = useState(false);
  const drawing = useRef(false);
  const box = useRef(null);
  const timer = useRef(null);
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;

  const pos = (e) => {
    const r = box.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 300, y: ((e.clientY - r.top) / r.height) * 120 };
  };
  const down = (e) => {
    e.preventDefault();
    clearTimeout(timer.current);
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
    timer.current = setTimeout(finish, 650); // pause = end of character
  };

  const finish = () => {
    const s = strokesRef.current;
    if (!s.length) return;
    let next = [];
    if (isDot(s)) {
      onChange(value + ".");
    } else {
      next = recognize(s);
      if (next[0]) onChange(value + next[0].char);
    }
    setCands(next);
    setFlash(true);
    setTimeout(() => {
      setStrokes([]);
      setFlash(false);
    }, 180);
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
            write one capital letter at a time · tap for .
          </text>
        )}
      </svg>
      <div className="te-row">
        <div className="te-cands">
          {cands.slice(1).map((c) => (
            <button key={c.char} type="button" onClick={() => pick(c.char)} title="replace last letter">
              {c.char}
            </button>
          ))}
        </div>
        <div className="te-keys">
          <button type="button" onClick={() => onChange(value + " ")}>
            space
          </button>
          <button type="button" onClick={() => onChange(value.slice(0, -1))}>
            ⌫
          </button>
          <button type="button" className="te-mode" onClick={onKeyboard}>
            abc
          </button>
          {onSubmit && (
            <button type="button" className="te-ent" onClick={onSubmit} disabled={!value.trim()}>
              ent
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
