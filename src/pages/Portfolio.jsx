import React from "react";
import { projects } from "../content";
import { Link } from "../router";
import "./Pages.css";

function Card({ p }) {
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
  const live = projects.filter((p) => p.status !== "concept").length;
  return (
    <main className="page">
      <div className="page-inner">
        <header className="page-head">
          <p className="page-kicker">
            portfolio · {live} shipped · {projects.length - live} on the bench
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
