import { useEffect, useRef, useState } from "react";
import "./App.css";

import logo from "./assets/Mt's logo.jpeg";
import katran from "./assets/SpecialKatran.jpeg";
import garlic from "./assets/GarlicPapad.jpeg";
import mastani from "./assets/MastaniPapad.jpeg";
import masala from "./assets/RajasthaniMasalaPapad.jpeg";
import urad from "./assets/Rajasthani_Urad.jpeg";
import dhamaal from "./assets/Masala_Dhamal.jpeg";
import mungwadi from "./assets/MoongWadi.jpeg";

const API = "http://127.0.0.1:8000";

function getProductImage(name) {
  const n = name.toLowerCase();
  if (n.includes("katran")) return katran;
  if (n.includes("garlic")) return garlic;
  if (n.includes("mastani")) return mastani;
  if (n.includes("masala")) return masala;
  if (n.includes("urad")) return urad;
  if (n.includes("dhamaal")) return dhamaal;
  if (n.includes("moong wadi") || n.includes("mung wadi")) return mungwadi;
  return katran;
}

export default function App() {
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    customer_name: "",
    phone_number: "",
    product_name: "",
    quantity: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm MT's Foods assistant. Ask me anything about our products, pricing, or how to place an order!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/business-info`).then((r) => r.json()),
      fetch(`${API}/products`).then((r) => r.json()),
    ]).then(([biz, prods]) => {
      setBusiness(biz);
      setProducts(prods);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!chatOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    chatInputRef.current?.focus();
  }, [chatOpen, messages]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(id);
  }, [toast]);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function adjustQty(delta) {
    setForm((f) => ({ ...f, quantity: Math.max(1, Number(f.quantity) + delta) }));
  }

  function quickOrder(productName) {
    setForm((f) => ({ ...f, product_name: productName, quantity: 1 }));
    document.getElementById("order").scrollIntoView({ behavior: "smooth" });
  }

  async function placeOrder(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
      });
      const data = await res.json();
      if (data.error) {
        setToast({ type: "error", message: data.error });
      } else {
        setToast({
          type: "success",
          message: `Order placed! We'll call ${form.phone_number} to confirm.`,
        });
        setForm({ customer_name: "", phone_number: "", product_name: "", quantity: 1 });
      }
    } catch {
      setToast({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  async function sendChat() {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now." },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  const selectedProduct = products.find((p) => p.name === form.product_name);
  const orderTotal = selectedProduct ? selectedProduct.mrp * Number(form.quantity) : null;

  return (
    <div className="site">
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-icon">{toast.type === "success" ? "✓" : "✕"}</span>
          <p>{toast.message}</p>
          <button onClick={() => setToast(null)} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <img src={logo} alt="MT's Foods" />
          <span>MT's Foods</span>
        </div>
        <div className="nav-links">
          <a href="#products">Products</a>
          <a href="#order">Order</a>
          <button className="chat-nav-btn" onClick={() => setChatOpen(true)}>
            Ask AI ✦
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Nagpur's Homemade Taste</p>
          <h1>
            स्वाद ऐसा,
            <br />
            घर जैसा
          </h1>
          <p className="hero-text">
            Traditional papad, katran and homemade snacks crafted with authentic Indian flavours.
          </p>
          <div className="hero-ctas">
            <a href="#order" className="primary-btn">
              Place an Order
            </a>
            <button className="secondary-btn" onClick={() => setChatOpen(true)}>
              Ask our AI ✦
            </button>
          </div>
        </div>
        <div className="hero-product">
          <img src={katran} alt="Special Katran Papad" />
        </div>
      </section>

      {/* Trust bar */}
      <section className="trust-bar">
        <div>
          <strong>100%</strong>
          <span>Homemade</span>
        </div>
        <div>
          <strong>17+</strong>
          <span>Products</span>
        </div>
        <div>
          <strong>Nagpur</strong>
          <span>Local delivery</span>
        </div>
      </section>

      {/* Products */}
      <section className="section" id="products">
        <div className="section-heading">
          <p>Our Collection</p>
          <h2>Premium Papad & Snacks</h2>
        </div>
        <div className="product-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div className="skeleton-card" key={i}>
                  <div className="skeleton-img" />
                  <div className="skeleton-body">
                    <div className="skeleton-line wide" />
                    <div className="skeleton-line narrow" />
                    <div className="skeleton-price-row" />
                    <div className="skeleton-btn-row" />
                  </div>
                </div>
              ))
            : products.map((product) => (
                <div className="product-card" key={product.id}>
                  <div className="image-wrap">
                    <img src={getProductImage(product.name)} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <div className="price-row">
                      <span>MRP</span>
                      <strong>₹{product.mrp}</strong>
                    </div>
                    <button className="order-now-btn" onClick={() => quickOrder(product.name)}>
                      Order Now →
                    </button>
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* Order */}
      <section className="order-section" id="order">
        <div className="order-copy">
          <p>Quick Order</p>
          <h2>Bring MT's Foods home</h2>
          <span>
            Select your favourite product, enter quantity, and we'll confirm your order by phone.
          </span>
          {orderTotal !== null && (
            <div className="order-preview">
              <span>Estimated Total</span>
              <strong>₹{orderTotal}</strong>
            </div>
          )}
        </div>

        <form onSubmit={placeOrder} className="order-form">
          <div className="form-field">
            <label htmlFor="customer_name">Your name</label>
            <input
              id="customer_name"
              name="customer_name"
              placeholder="e.g. Priya Sharma"
              value={form.customer_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="phone_number">Phone number</label>
            <input
              id="phone_number"
              name="phone_number"
              placeholder="10-digit number"
              value={form.phone_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="product_name">Product</label>
            <select
              id="product_name"
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              required
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Quantity</label>
            <div className="qty-row">
              <button type="button" className="qty-btn" onClick={() => adjustQty(-1)}>
                −
              </button>
              <input
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                required
              />
              <button type="button" className="qty-btn" onClick={() => adjustQty(1)}>
                +
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Placing order…" : "Confirm Order →"}
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer>
        <img src={logo} alt="MT's Foods" />
        <p>{business?.name || "MT's Foods"} · Nagpur</p>
        <p className="footer-phone">{business?.phone || "9326455333"}</p>
      </footer>

      {/* Chat FAB */}
      {!chatOpen && (
        <button className="chat-fab" onClick={() => setChatOpen(true)} aria-label="Open chat">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Ask AI</span>
        </button>
      )}

      {/* Chat backdrop */}
      {chatOpen && <div className="chat-backdrop" onClick={() => setChatOpen(false)} />}

      {/* Chat panel */}
      <div className={`chat-panel${chatOpen ? " open" : ""}`}>
        <div className="chat-header">
          <div className="chat-header-info">
            <img src={logo} alt="" />
            <div>
              <strong>MT's Assistant</strong>
              <span>Powered by Claude AI</span>
            </div>
          </div>
          <button className="chat-close" onClick={() => setChatOpen(false)} aria-label="Close chat">
            ✕
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role}`}>
              {msg.content}
            </div>
          ))}
          {chatLoading && (
            <div className="chat-bubble assistant chat-typing">
              <span />
              <span />
              <span />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-row">
          <input
            ref={chatInputRef}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
            placeholder="Ask about our products…"
          />
          <button
            className="chat-send-btn"
            onClick={sendChat}
            disabled={chatLoading || !chatInput.trim()}
            aria-label="Send message"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
