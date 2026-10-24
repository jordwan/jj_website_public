import React, { useEffect, useRef, useState } from "react";
import { Link, useRoute } from "./router";
import { EMAIL, MAILTO, useEmail } from "./email";
import "./NavBar.css";

const NavBar = ({ chain }) => {
  const { path, navigate } = useRoute();
  const home = path === "/";

  // The page links are almost invisible on the home page. One click on
  // that spot reveals them faintly; the next click follows a link.
  const [revealed, setRevealed] = useState(!home);
  const fade = useRef(null);
  useEffect(() => {
    if (!home) setRevealed(true);
  }, [home]);
  useEffect(() => {
    clearTimeout(fade.current);
    if (home && revealed) fade.current = setTimeout(() => setRevealed(false), 12000);
    return () => clearTimeout(fade.current);
  }, [home, revealed]);

  const onLinksClick = (e) => {
    if (revealed) return;
    e.preventDefault();
    e.stopPropagation();
    setRevealed(true);
  };

  // the email is also the easter-egg trigger: go home and open the chain
  const { hint, onEmail } = useEmail(() => {
    navigate("/");
    chain.setOpen(true);
  });

  return (
    <nav className="navbar">
      <div
        className={`nav-links ${revealed ? "revealed" : ""}`}
        onClickCapture={onLinksClick}
        aria-label="pages"
      >
        <Link to="/">Home</Link>
        <Link to="/about">About Me</Link>
        <Link to="/portfolio">Portfolio</Link>
      </div>
      <div className="nav-email">
        <a href={MAILTO} onClick={onEmail}>
          {EMAIL}
        </a>
        <span className={`nav-hint ${hint ? "show" : ""}`}>{hint}</span>
      </div>
    </nav>
  );
};

export default NavBar;
