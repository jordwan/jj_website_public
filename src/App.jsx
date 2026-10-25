import React from "react";
import NavBar from "./NavBar";
import ChainExperience, { useChain } from "./easter/ChainExperience";
import Terminal from "./easter/Terminal";
import { Router, useRoute } from "./router";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import Archive from "./pages/Archive";
import Background from "./Background";
import "./App.css";

function Home({ chain }) {
  const toggle = () => chain.setOpen((o) => !o);
  return (
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
      <ChainExperience chain={chain} />
    </main>
  );
}

function Routes({ chain }) {
  const { path } = useRoute();
  if (path === "/about") return <About />;
  if (path === "/portfolio") return <Portfolio />;
  if (path === "/archive") return <Archive chain={chain} />;
  return <Home chain={chain} />;
}

function App() {
  const chain = useChain();
  return (
    <Router>
      <div className="app">
        <Background />
        <div className="overlay">
          <NavBar chain={chain} />
          <Routes chain={chain} />
        </div>
        <Terminal chain={chain} />
      </div>
    </Router>
  );
}

export default App;
