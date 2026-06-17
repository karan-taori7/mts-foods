import katran from "../assets/SpecialKatran.jpeg";

export default function Hero({ onChatOpen }) {
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
            <span className="hero-stat-num">500+</span>
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
        <img src={katran} alt="Special Katran Papad" />
        <div className="hero-badge">
          <strong>Our</strong>
          <span>Own Factory</span>
        </div>
      </div>
    </section>
  );
}
