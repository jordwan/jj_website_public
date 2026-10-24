import React, { useEffect, useMemo, useState } from "react";
import { loadRemnants, sigToPath, timeAgo } from "../easter/remnants";
import { short } from "../easter/hash";
import { TOTAL } from "../easter/ChainExperience";
import { Link, useRoute } from "../router";
import "./Pages.css";

/* The ending: every visitor who finished the chain and anchored, as a
   small gallery of signatures, notes and tip hashes. */
export default function Archive({ chain }) {
  const [state, setState] = useState({ remnants: [], count: 0, online: false, loaded: false });
  const complete = chain.blocks.length >= TOTAL;
  const myTip = useMemo(() => chain.blocks[TOTAL - 2]?.hash, [chain.blocks]);
  const { navigate } = useRoute();
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
    chain.reset();
    chain.setOpen(true);
    navigate("/");
  };

  useEffect(() => {
    let live = true;
    loadRemnants().then((r) => live && setState({ ...r, loaded: true }));
    return () => {
      live = false;
    };
  }, []);

  if (!complete) {
    return (
      <main className="page">
        <div className="page-inner">
          <header className="page-head">
            <p className="page-kicker">the archive</p>
            <h1 className="page-title">Sealed</h1>
            <p className="page-tagline">the archive opens when your chain is complete.</p>
          </header>
          <p className="archive-hint">
            <Link to="/">home</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-inner">
        <header className="page-head">
          <p className="page-kicker">
            the archive · {state.loaded ? `${state.count} visitor${state.count === 1 ? "" : "s"} anchored` : "loading…"}
            {state.loaded && !state.online ? " · local echo" : ""}
          </p>
          <div className="page-title-row">
            <h1 className="page-title">Artifacts</h1>
            <button className={`eg-x page-restart ${confirm ? "warn" : ""}`} onClick={restart}>
              {confirm ? "sure? tap again" : "restart"}
            </button>
          </div>
          <p className="page-tagline">what the people before you left behind.</p>
        </header>

        {state.loaded && state.remnants.length === 0 && (
          <section className="panel">
            <p>nothing here yet. you are the first.</p>
          </section>
        )}

        <div className="grid archive">
          {state.remnants.map((r) => {
            const mine = r.tip === myTip;
            return (
              <article key={`${r.n}-${r.tip}`} className={`card artifact ${mine ? "mine" : ""}`}>
                <div className="card-top">
                  <h3>#{r.n}</h3>
                  <span className="status">{mine ? "you" : timeAgo(r.ts)}</span>
                </div>
                <svg className="artifact-sig" viewBox="0 0 300 100" aria-hidden="true">
                  <path d={sigToPath(r.sig)} />
                </svg>
                <p className="artifact-note">{r.note ? r.note : <span className="silent">passed in silence</span>}</p>
                <div className="artifact-tip">{short(r.tip)}</div>
              </article>
            );
          })}
        </div>

        <p className="archive-hint">
          <Link to="/">home</Link>
        </p>
      </div>
    </main>
  );
}
