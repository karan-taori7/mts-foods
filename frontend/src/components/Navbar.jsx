import { useState } from "react";
import logo from "../assets/Mt's logo.jpeg";

export default function Navbar({ onChatOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { label: "Home", href: "#home" },
    { label: "Products", href: "#products" },
    { label: "About", href: "#about" },
    { label: "Order", href: "#order" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <img src={logo} alt="MT's Foods" />
        <span>MT's Foods</span>
      </div>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {links.map((l) => (
          <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}>
            {l.label}
          </a>
        ))}
        <button className="chat-nav-btn" onClick={() => { onChatOpen(); setMenuOpen(false); }}>
          Ask AI ✦
        </button>
      </div>

      <button
        className="hamburger"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>
    </nav>
  );
}
