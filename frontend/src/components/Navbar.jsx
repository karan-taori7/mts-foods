import { useState, useRef, useEffect } from "react";
import logo from "../assets/Mt's logo.jpeg";

export default function Navbar({ onChatOpen, user, onLoginClick, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const dropRef = useRef(null);

  const links = [
    { label: "Home", href: "#home" },
    { label: "Products", href: "#products" },
    { label: "About", href: "#about" },
    { label: "Order", href: "#order" },
    { label: "Contact", href: "#contact" },
  ];

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setUserDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

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
        <button
          className="chat-nav-btn"
          onClick={() => { onChatOpen(); setMenuOpen(false); }}
        >
          Ask AI ✦
        </button>

        {user ? (
          <div className="user-menu" ref={dropRef}>
            <button
              className="user-avatar"
              onClick={() => setUserDropOpen((o) => !o)}
              aria-label="Account menu"
            >
              {initial}
            </button>
            {userDropOpen && (
              <div className="user-dropdown">
                <p className="user-email">{user.email}</p>
                <hr className="user-drop-divider" />
                <button
                  className="user-logout-btn"
                  onClick={() => { onLogout(); setUserDropOpen(false); setMenuOpen(false); }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="login-nav-btn"
            onClick={() => { onLoginClick(); setMenuOpen(false); }}
          >
            Login
          </button>
        )}
      </div>

      <div className="nav-right-mobile">
        {user ? (
          <button
            className="user-avatar"
            onClick={() => setUserDropOpen((o) => !o)}
            aria-label="Account menu"
          >
            {initial}
          </button>
        ) : (
          <button
            className="login-nav-btn"
            onClick={() => { onLoginClick(); setMenuOpen(false); }}
          >
            Login
          </button>
        )}
        <button
          className="hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {userDropOpen && user && (
        <div className="user-dropdown mobile-drop" ref={dropRef}>
          <p className="user-email">{user.email}</p>
          <hr className="user-drop-divider" />
          <button
            className="user-logout-btn"
            onClick={() => { onLogout(); setUserDropOpen(false); }}
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
