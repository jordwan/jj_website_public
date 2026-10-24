import React from "react";
import { about } from "../content";
import "./Pages.css";

export default function About() {
  return (
    <main className="page">
      <div className="page-inner">
        <header className="page-head">
          <p className="page-kicker">node profile · {about.location}</p>
          <h1 className="page-title">{about.name} · {about.handle}</h1>
          <p className="page-tagline">{about.tagline}</p>
        </header>

        <section className="panel">
          <h2>about</h2>
          {about.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        <section className="panel">
          <h2>stack</h2>
          <dl className="stack">
            {about.stack.map((s) => (
              <React.Fragment key={s.group}>
                <dt>{s.group}</dt>
                <dd>{s.items.join(" · ")}</dd>
              </React.Fragment>
            ))}
          </dl>
        </section>

        <section className="panel">
          <h2>how i work</h2>
          <ol className="principles">
            {about.principles.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </section>

        <section className="panel">
          <h2>elsewhere</h2>
          <div className="links">
            {about.links.map((l) => (
              <a key={l.href} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {l.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
