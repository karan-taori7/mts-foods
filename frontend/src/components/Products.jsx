import katran from "../assets/SpecialKatran.jpeg";
import garlic from "../assets/GarlicPapad.jpeg";
import mastani from "../assets/MastaniPapad.jpeg";
import masala from "../assets/RajasthaniMasalaPapad.jpeg";
import urad from "../assets/Rajasthani_Urad.jpeg";
import dhamaal from "../assets/Masala_Dhamal.jpeg";
import mungwadi from "../assets/MoongWadi.jpeg";

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

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton-line wide" />
        <div className="skeleton-line narrow" />
        <div className="skeleton-price-row" />
        <div className="skeleton-btn-row" />
      </div>
    </div>
  );
}

export default function Products({ products, loading, onQuickOrder }) {
  return (
    <section className="section" id="products">
      <div className="section-heading">
        <p>Our Collection</p>
        <h2>Premium Papad & Snacks</h2>
      </div>
      <div className="product-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
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
                  <button className="order-now-btn" onClick={() => onQuickOrder(product.name)}>
                    Order Now →
                  </button>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
