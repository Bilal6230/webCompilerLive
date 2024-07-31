import React from "react";
import "./Navbar.css";
import { TbRefreshDot } from "react-icons/tb";
import { FaReact, FaUser } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <FaReact
          size={"2rem"}
          color="lightblue"
          style={{ marginRight: "10px" }}
        />
        <span className="navbar-title">Web Compiler</span>
      </div>
      <div className="navbar-right">
        <TbRefreshDot color="white" size={"2rem"} />
        <button className="navbar-button">Get a hint</button>
        <button
          style={{ color: "#65c8ff" }}
          className="navbar-button trial-button"
        >
          {" "}
          <FaUser color="#65c8ff" /> Trial
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
