import { useEffect, useState } from "react";
import "./App.css";

import Toast from "./components/Toast";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import WhyUs from "./components/WhyUs";
import Categories from "./components/Categories";
import Products from "./components/Products";
import About from "./components/About";
import OrderSection from "./components/OrderSection";
import Footer from "./components/Footer";
import Chat from "./components/Chat";

const API = "http://127.0.0.1:8000";

export default function App() {
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

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm MT's Foods assistant. Ask me anything about our products, pricing, or how to place an order!",
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
        setToast({ type: "success", message: `Order placed! We'll call ${form.phone_number} to confirm.` });
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
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setChatLoading(false);
    }
  }

  const selectedProduct = products.find((p) => p.name === form.product_name);
  const orderTotal = selectedProduct ? selectedProduct.mrp * Number(form.quantity) : null;

  return (
    <div className="site">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <Navbar onChatOpen={() => setChatOpen(true)} />
      <Hero onChatOpen={() => setChatOpen(true)} />
      <TrustBar />
      <WhyUs />
      <Categories />
      <Products products={products} loading={loading} onQuickOrder={quickOrder} />
      <About />
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
