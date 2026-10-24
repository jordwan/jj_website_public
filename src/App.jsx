import React from "react";
import NavBar from "./NavBar";
import bgGif from "./assets/background/parallax-bg.gif";
import "./App.css";

function App() {
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
          <p className="hero-sub">Blockchain</p>
        </main>
      </div>
    </div>
  );
}

export default App;
