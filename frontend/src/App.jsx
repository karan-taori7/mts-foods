import { useEffect, useState } from "react";
import "./App.css";

import AnnouncementBar from "./components/AnnouncementBar";
import AuthModal from "./components/AuthModal";
import Toast from "./components/Toast";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import WhyUs from "./components/WhyUs";
import Categories from "./components/Categories";
import Products from "./components/Products";
import About from "./components/About";
import QualitySection from "./components/QualitySection";
import OrderSection from "./components/OrderSection";
import Footer from "./components/Footer";
import Chat from "./components/Chat";

const API = "";

export default function App() {
  // ── Auth ────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("mts_token");
    if (!token) return;
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => { if (u) setUser(u); })
      .catch(() => {});
  }, []);

  function handleLogin(userData) {
    setUser(userData);
    setToast({ type: "success", message: `Welcome back, ${userData.email}!` });
  }

  function handleLogout() {
    localStorage.removeItem("mts_token");
    setUser(null);
    setToast({ type: "success", message: "You've been signed out." });
  }

  // ── Announcement bar ─────────────────────────────
  const [annDismissed, setAnnDismissed] = useState(
    () => sessionStorage.getItem("ann_dismissed") === "1"
  );

  function dismissAnn() {
    sessionStorage.setItem("ann_dismissed", "1");
    setAnnDismissed(true);
  }

  // ── Data ─────────────────────────────────────────
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    customer_name: "",
    phone_number: "",
    product_name: "",
    quantity: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  // ── Chat ─────────────────────────────────────────
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
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(id);
  }, [toast]);

  function quickOrder(productName) {
    setForm((f) => ({ ...f, product_name: productName, quantity: 1 }));
    document.getElementById("order").scrollIntoView({ behavior: "smooth" });
  }

  function loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function placeOrder(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setToast({
          type: "error",
          message: "Failed to load payment gateway. Please try again.",
        });
        return;
      }

      // One key per checkout attempt — if this request gets retried
      // (flaky network, accidental double submit) the backend returns the
      // same Razorpay order instead of creating a duplicate one.
      const idempotencyKey = crypto.randomUUID();

      const res = await fetch(`${API}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          idempotency_key: idempotencyKey,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setToast({ type: "error", message: data.detail || "Something went wrong." });
        return;
      }

      const orderData = await res.json();

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "MT's Foods",
        description: form.product_name,
        order_id: orderData.razorpay_order_id,
        prefill: {
          name: form.customer_name,
          contact: form.phone_number,
        },
        theme: { color: "#e85d04" },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API}/payment/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                customer_name: form.customer_name,
                phone_number: form.phone_number,
                product_name: form.product_name,
                quantity: Number(form.quantity),
              }),
            });

            if (verifyRes.ok) {
              setToast({
                type: "success",
                message: "Payment successful! Your order has been placed.",
              });
              setForm({ customer_name: "", phone_number: "", product_name: "", quantity: 1 });
            } else {
              setToast({
                type: "error",
                message: "Payment verification failed. Please contact us.",
              });
            }
          } finally {
            setSubmitting(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setToast({ type: "error", message: "Something went wrong. Please try again." });
      setSubmitting(false);
    }
  }

  async function sendChat() {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const history = messages.slice(1);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: text }],
          // Lets the assistant answer order/payment-status questions when
          // the customer has entered their number in the order form.
          phone_number: form.phone_number || null,
        }),
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
      {!annDismissed && <AnnouncementBar onDismiss={dismissAnn} />}

      <Toast toast={toast} onClose={() => setToast(null)} />

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onLogin={(userData) => { handleLogin(userData); setAuthOpen(false); }}
        />
      )}

      <Navbar
        onChatOpen={() => setChatOpen(true)}
        user={user}
        onLoginClick={() => setAuthOpen(true)}
        onLogout={handleLogout}
      />
      <Hero onChatOpen={() => setChatOpen(true)} />
      <TrustBar />
      <WhyUs />
      <Categories />
      <Products products={products} loading={loading} onQuickOrder={quickOrder} />
      <About />
      <QualitySection />
      <OrderSection
        products={products}
        form={form}
        setForm={setForm}
        submitting={submitting}
        onSubmit={placeOrder}
        orderTotal={orderTotal}
      />
      <Footer business={business} />

      <Chat
        isOpen={chatOpen}
        onOpen={() => setChatOpen(true)}
        onClose={() => setChatOpen(false)}
        messages={messages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        chatLoading={chatLoading}
        onSend={sendChat}
      />
    </div>
  );
}
