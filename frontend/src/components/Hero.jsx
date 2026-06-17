import { useState, useEffect } from "react";
import katran from "../assets/SpecialKatran.jpeg";
import garlic from "../assets/GarlicPapad.jpeg";
import hungama from "../assets/Hungama_papad.jpeg";
import masala from "../assets/Masala_Dhamal.jpeg";
import mastani from "../assets/MastaniPapad.jpeg";
import moong from "../assets/MoongWadi.jpeg";
import rajUrad from "../assets/Rajasthani_Urad.jpeg";
import rajMasala from "../assets/RajasthaniMasalaPapad.jpeg";

const products = [
  { img: katran,    name: "Special Katran" },
  { img: garlic,    name: "Garlic Papad" },
  { img: hungama,   name: "Hungama Papad" },
  { img: masala,    name: "Masala Dhamal" },
  { img: mastani,   name: "Mastani Papad" },
  { img: moong,     name: "Moong Wadi" },
  { img: rajUrad,   name: "Rajasthani Urad" },
  { img: rajMasala, name: "Rajasthani Masala Papad" },
];

export default function Hero({ onChatOpen }) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  const goTo = (i) => {
    setVisible(false);
    setTimeout(() => {
      setCurrent(i);
      setVisible(true);
    }, 300);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % products.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <p className="eyebrow">India's Authentic Taste</p>
        <h1>
          स्वाद ऐसा,<br />घर जैसा
        </h1>
        <p className="hero-text">
          Specialists in handcrafted papads — made with traditional recipes
          passed down through generations, in our own factory.
        </p>
        <div className="hero-ctas">
          <a href="#products" className="primary-btn">View Products</a>
          <a href="#order" className="secondary-btn">Place an Order</a>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-num">⭐ 4.9</span>
            <span className="hero-stat-label">Customer Rating</span>
          </div>
          <div className="hero-stat-sep" />
          <div className="hero-stat">
            <span className="hero-stat-num">10000+</span>
            <span className="hero-stat-label">Happy Families</span>
          </div>
          <div className="hero-stat-sep" />
          <div className="hero-stat">
            <span className="hero-stat-num">15+</span>
            <span className="hero-stat-label">Products</span>
          </div>
        </div>
      </div>

      <div className="hero-product">
        <div className="hero-fresh-tag">
          <span className="fresh-pulse" />
          Fresh Batch Today
        </div>
        <img
          src={products[current].img}
          alt={products[current].name}
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
        />
        <div className="hero-product-label" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}>
          {products[current].name}
        </div>
        <div className="hero-badge">
          <strong>Our</strong>
          <span>Own Factory</span>
        </div>
        <div className="hero-dots">
          {products.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === current ? " hero-dot-active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={products[i].name}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
