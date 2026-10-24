import React from "react";
import NavBar from "./NavBar";
import ChainExperience, { useChain } from "./easter/ChainExperience";
import Terminal from "./easter/Terminal";
import bgGif from "./assets/background/parallax-bg.gif";
import "./App.css";

function App() {
  const chain = useChain();

  const toggle = () => chain.setOpen((o) => !o);

  return (
    <div className="app">
      <div
        className="moving-background"
        style={{ backgroundImage: `url(${bgGif})` }}
      />
      <div className="overlay">
        <NavBar />
        <main className="hero">
          <p className="hero-title">Jordwan.com</p>
          <p
            className="hero-sub is-trigger"
            role="button"
            tabIndex={0}
            onClick={toggle}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle()}
          >
            Blockchain<span className="cursor">_</span>
          </p>
          <ChainExperience chain={chain} />
        </main>
      </div>
      <Terminal chain={chain} />
    </div>
  );
}

export default App;
