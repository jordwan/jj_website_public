import React from "react";
import "./NavBar.css";

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="nav-links">
        <a href="/">About Me</a>
        <a href="/">Portfolio</a>
      </div>
      <button className="connect-btn">Connect</button>
    </nav>
  );
};

export default NavBar;
