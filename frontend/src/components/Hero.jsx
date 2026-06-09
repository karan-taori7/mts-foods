import katran from "../assets/SpecialKatran.jpeg";

export default function Hero({ onChatOpen }) {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <p className="eyebrow">Nagpur's Authentic Taste</p>
        <h1>
          स्वाद ऐसा,<br />घर जैसा
        </h1>
        <p className="hero-text">
          Specialists in Garlic Papad and Rajasthani Masala Papad — made with
          traditional recipes in our own factory in Nagpur.
        </p>
        <div className="hero-ctas">
          <a href="#products" className="primary-btn">View Products</a>
          <a href="#order" className="secondary-btn">Place an Order</a>
        </div>
      </div>
      <div className="hero-product">
        <img src={katran} alt="Special Katran Papad" />
        <div className="hero-badge">
          <strong>Our</strong>
          <span>Own Factory</span>
        </div>
      </div>
    </section>
  );
}
