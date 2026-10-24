import React from "react";
import NavBar from "./NavBar";
import ChainExperience, { useChain } from "./easter/ChainExperience";
import Terminal from "./easter/Terminal";
import bgGif from "./assets/background/parallax-bg.gif";
import "./App.css";

function App() {
  const chain = useChain();

  const toggle = () => chain.setOpen((o) => !o);
  // mailto still fires (default not prevented); the panel opens alongside it
  const openChain = () => chain.setOpen(true);

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
          <a className="hero-sub" href="mailto:info@jordwan.com" onClick={openChain}>
            info@jordwan.com
          </a>
          <ChainExperience chain={chain} />
        </main>
      </div>
      <Terminal chain={chain} />
    </div>
  );
}

export default App;
