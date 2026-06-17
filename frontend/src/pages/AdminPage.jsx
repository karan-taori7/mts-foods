import { useState, useEffect } from "react";
import "../admin.css";

const API = "";

const STATUSES = ["pending", "confirmed", "delivered"];

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem("admin_token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  async function login(e) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      setLoginError("Invalid email or password.");
      return;
    }
    const data = await res.json();
    localStorage.setItem("admin_token", data.access_token);
    setToken(data.access_token);
  }

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      const data = await res.json();
      setOrders(data);
    } catch {
      // backend unreachable — stay on the page, just stop the spinner
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId, status) {
    await fetch(`${API}/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  }

  function logout() {
    localStorage.removeItem("admin_token");
    setToken(null);
    setOrders([]);
  }

  if (!token) {
    return (
      <div className="al-wrap">
        <div className="al-card">
          <h1>MT's Foods</h1>
          <p className="al-subtitle">Admin Panel</p>
          {loginError && <p className="al-error">{loginError}</p>}
          <form onSubmit={login} className="al-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-wrap">
      <header className="ad-header">
        <h1>MT's Foods — Orders</h1>
        <div className="ad-header-actions">
          <button className="ad-btn-refresh" onClick={fetchOrders}>Refresh</button>
          <button className="ad-btn-logout" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="ad-main">
        {loading ? (
          <p className="ad-state">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="ad-state">No orders yet.</p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="ad-id">{o.id}</td>
                    <td>{o.customer_name}</td>
                    <td>
                      <a className="ad-phone" href={`tel:${o.phone_number}`}>
                        {o.phone_number}
                      </a>
                    </td>
                    <td>{o.product_name}</td>
                    <td>{o.quantity}</td>
                    <td className="ad-total">₹{o.total_mrp}</td>
                    <td className="ad-date">
                      {o.created_at
                        ? new Date(o.created_at).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td>
                      <select
                        className={`ad-status ad-status-${o.status}`}
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
