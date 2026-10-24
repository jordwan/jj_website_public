import React, { useEffect, useRef, useState } from "react";
import NavBar from "./NavBar";
import ChainExperience, { useChain } from "./easter/ChainExperience";
import Terminal from "./easter/Terminal";
import bgGif from "./assets/background/parallax-bg.gif";
import "./App.css";

const EMAIL = "info@jordwan.com";
const MAILTO = `mailto:${EMAIL}`;

/* Open the mail client without navigating the page (desktop browsers hand
   the mailto: to the OS handler and the tab stays put). */
function openMailInBackground() {
  const f = document.createElement("iframe");
  f.style.display = "none";
  f.src = MAILTO;
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 4000);
}

function App() {
  const chain = useChain();
  const [hint, setHint] = useState("");
  const armed = useRef(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const toggle = () => chain.setOpen((o) => !o);

  const onEmail = async (e) => {
    e.preventDefault();
    chain.setOpen(true);

    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (!touch) {
      openMailInBackground();
      return;
    }

    // Touch devices: a mailto would switch apps. First tap copies the
    // address and arms a second tap that actually opens mail.
    if (armed.current) {
      armed.current = false;
      setHint("");
      window.location.href = MAILTO;
      return;
    }
    try {
      await navigator.clipboard.writeText(EMAIL);
      setHint("copied · tap again to open mail");
    } catch {
      setHint("tap again to open mail");
    }
    armed.current = true;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      armed.current = false;
      setHint("");
    }, 6000);
  };

  return (
    <div className="app">
      <div
        className="moving-background"
        style={{ backgroundImage: `url(${bgGif})` }}
      />
      <div className="overlay">
        <NavBar />
        <main className="hero">
          <p
            className="hero-title is-trigger"
            role="button"
            tabIndex={0}
            onClick={toggle}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle()}
          >
            Jordwan.com<span className="cursor">_</span>
          </p>
          <a className="hero-sub" href={MAILTO} onClick={onEmail}>
            {EMAIL}
          </a>
          <span className={`hero-hint ${hint ? "show" : ""}`}>{hint}</span>
          <ChainExperience chain={chain} />
        </main>
      </div>
      <Terminal chain={chain} />
    </div>
  );
}

export default App;
