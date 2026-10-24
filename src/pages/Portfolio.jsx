import React, { useEffect, useRef, useState } from "react";
import { projects } from "../content";
import { Link } from "../router";
import "./Pages.css";

const NOISE = "0123456789abcdef";
const scrambleLine = (line, keep) =>
  [...line].map((c, i) => (c === " " || c === "-" || i < keep ? c : NOISE[(Math.random() * NOISE.length) | 0])).join("");

/* A project that is only a hash. Hovering flickers it; nothing more. */
function SealedCard({ p }) {
  const [lines, setLines] = useState(p.cipher);
  const timer = useRef(null);

  const flicker = () => {
    clearInterval(timer.current);
    let frame = 0;
    timer.current = setInterval(() => {
      frame++;
      const keep = Math.max(0, frame - 6) * 3;
      setLines(p.cipher.map((l) => scrambleLine(l, keep)));
      if (frame > 14) {
        clearInterval(timer.current);
        setLines(p.cipher);
      }
    }, 45);
  };
  useEffect(() => () => clearInterval(timer.current), []);

  return (
    <div className="card sealed" onMouseEnter={flicker} onTouchStart={flicker}>
      <div className="card-top">
        <h3>{p.title}</h3>
      </div>
      <pre className="cipher">{lines.join("\n")}</pre>
    </div>
  );
}

function Card({ p }) {
  if (p.sealed) return <SealedCard p={p} />;
  const body = (
    <>
      <div className="card-top">
        <h3>{p.title}</h3>
        <span className={`status ${p.status}`}>{p.status === "concept" ? "concept" : p.year}</span>
      </div>
      <p>{p.blurb}</p>
      <div className="tags">
        {p.tags.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </>
  );
  if (p.href?.startsWith("/")) {
    return (
      <Link to={p.href} className="card">
        {body}
      </Link>
    );
  }
  if (p.href) {
    return (
      <a className="card" href={p.href} target="_blank" rel="noreferrer">
        {body}
      </a>
    );
  }
  return <div className="card">{body}</div>;
}

export default function Portfolio() {
  const concept = projects.filter((p) => p.status === "concept").length;
  const live = projects.filter((p) => !p.sealed && p.status !== "concept").length;
  return (
    <main className="page">
      <div className="page-inner">
        <header className="page-head">
          <p className="page-kicker">
            portfolio · {live} shipped · {concept} on the bench
          </p>
          <h1 className="page-title">Things I've built</h1>
          <p className="page-tagline">and a few I'm circling.</p>
        </header>
        <div className="grid">
          {projects.map((p) => (
            <Card key={p.title} p={p} />
          ))}
        </div>
      </div>
    </main>
  );
}
