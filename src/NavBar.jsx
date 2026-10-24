import React from "react";
import { Link, useRoute } from "./router";
import { EMAIL, MAILTO, useEmail } from "./email";
import "./NavBar.css";

const NavBar = ({ chain }) => {
  const { navigate } = useRoute();
  // the email is also the easter-egg trigger: go home and open the chain
  const { hint, onEmail } = useEmail(() => {
    navigate("/");
    chain.setOpen(true);
  });

  return (
    <nav className="navbar">
      <div className="nav-links">
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
