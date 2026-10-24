import React, { useEffect, useRef, useState } from "react";
import { projects } from "../content";
import { Link } from "../router";
import "./Pages.css";

const NOISE = "0123456789abcdef▇▓▒░⟁⟐⟒⟡Ξ∴◈";
const scrambleLine = (line, keep) =>
  [...line].map((c, i) => (c === " " || c === "-" || i < keep ? c : NOISE[(Math.random() * NOISE.length) | 0])).join("");

/* A project that is visibly encrypted. Hovering tries to decrypt it and
   fails; clicking asks for clearance. One of them is genuinely decodable. */
function SealedCard({ p }) {
  const [lines, setLines] = useState(p.cipher);
  const [note, setNote] = useState("");
  const timer = useRef(null);

  const decrypt = () => {
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

  const click = () => {
    setNote((n) => (n ? "" : "decryption failed · clearance required"));
    decrypt();
  };

  return (
    <button className="card sealed" onMouseEnter={decrypt} onClick={click} title="sealed">
      <div className="card-top">
        <h3>{p.title}</h3>
        <span className="status sealed">sealed</span>
      </div>
      <pre className="cipher">{lines.join("\n")}</pre>
      {note && <p className="cipher-note">{note}</p>}
      <div className="tags">
        {p.tags.map((t) => (
          <span key={t} className={t.startsWith("[") ? "redacted" : ""}>
            {t}
          </span>
        ))}
      </div>
    </button>
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
  const sealed = projects.filter((p) => p.sealed).length;
  const concept = projects.filter((p) => p.status === "concept").length;
  const live = projects.length - sealed - concept;
  return (
    <main className="page">
      <div className="page-inner">
        <header className="page-head">
          <p className="page-kicker">
            portfolio · {live} shipped · {concept} on the bench · {sealed} sealed
          </p>
          <h1 className="page-title">Things I've built</h1>
          <p className="page-tagline">and a few I can't talk about yet.</p>
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
