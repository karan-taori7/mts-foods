import { useState } from "react";

export default function AuthModal({ onClose, onLogin }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function switchTab(t) {
    setTab(t);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(tab === "login" ? "/auth/login" : "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Something went wrong.");
        return;
      }

      if (tab === "register") {
        setSuccess("Account created! You can now sign in.");
        setTab("login");
        setPassword("");
        return;
      }

      localStorage.setItem("mts_token", data.access_token);

      const meRes = await fetch("/auth/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const user = await meRes.json();
      onLogin(user, data.access_token);
      onClose();
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="auth-modal" role="dialog" aria-modal="true">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">×</button>

        <div className="auth-brand">
          <span className="auth-brand-logo">MT</span>
          <span className="auth-brand-name">MT's Foods</span>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === "login" ? " active" : ""}`}
            onClick={() => switchTab("login")}
          >
            Sign In
          </button>
          <button
            className={`auth-tab${tab === "register" ? " active" : ""}`}
            onClick={() => switchTab("register")}
          >
            Create Account
          </button>
        </div>

        <h2 className="auth-heading">
          {tab === "login" ? "Welcome back!" : "Join MT's Foods"}
        </h2>
        <p className="auth-sub">
          {tab === "login"
            ? "Sign in to track and manage your orders."
            : "Create a free account to get started."}
        </p>

        {success && <div className="auth-success-msg">{success}</div>}
        {error && <div className="auth-error-msg">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="auth-pass">Password</label>
            <input
              id="auth-pass"
              type="password"
              placeholder={tab === "register" ? "Min 6 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === "login" ? "current-password" : "new-password"}
              required
            />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? "Please wait…"
              : tab === "login"
              ? "Sign In →"
              : "Create Account →"}
          </button>
        </form>

        <p className="auth-switch">
          {tab === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            className="auth-switch-link"
            onClick={() => switchTab(tab === "login" ? "register" : "login")}
          >
            {tab === "login" ? "Create a free account" : "Sign in"}
          </button>
        </p>
      </div>
    </>
  );
}
