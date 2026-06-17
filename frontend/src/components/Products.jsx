import { useState } from "react";
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

function groupProducts(products) {
  // Pass 1 — group by weight suffix e.g. "Special Garlic Papad (5 inch) - 200 Gms"
  const weightMap = new Map();
  const afterWeightPass = [];

  for (const p of products) {
    const match = p.name.match(/^(.+?) - (\d+ Gms)$/);
    if (match) {
      const base = match[1];
      if (!weightMap.has(base)) weightMap.set(base, []);
      weightMap.get(base).push({ ...p, variantLabel: match[2] });
    } else {
      afterWeightPass.push(p);
    }
  }

  // Pass 2 — group remaining by size suffix e.g. "Rajasthani Masala Papad (8 inch)"
  const sizeMap = new Map();
  const standalones = [];

  for (const p of afterWeightPass) {
    const match = p.name.match(/^(.+?) \((\d+ inch)\)$/);
    if (match) {
      const base = match[1];
      if (!sizeMap.has(base)) sizeMap.set(base, []);
      sizeMap.get(base).push({ ...p, variantLabel: match[2] });
    } else {
      standalones.push(p);
    }
  }

  const result = [...standalones];

  // Size groups — only collapse if there are multiple sizes
  for (const [base, variants] of sizeMap) {
    if (variants.length === 1) {
      result.push(variants[0]);
    } else {
      variants.sort((a, b) => parseInt(a.variantLabel) - parseInt(b.variantLabel));
      result.push({ id: variants[0].id, name: base, variants });
    }
  }

  // Weight groups — always collapsed (30g / 60g / 200g)
  for (const [base, variants] of weightMap) {
    variants.sort((a, b) => parseInt(a.variantLabel) - parseInt(b.variantLabel));
    result.push({ id: variants[0].id, name: base, variants });
  }

  return result;
}

const BEST_SELLERS = ["garlic", "masala", "katran"];
const NEW_ARRIVALS = ["moong wadi", "wadi"];

function getBadge(name) {
  const n = name.toLowerCase();
  if (BEST_SELLERS.some((k) => n.includes(k))) return "Best Seller";
  if (NEW_ARRIVALS.some((k) => n.includes(k))) return "New";
  return null;
}

function ProductCard({ product, onQuickOrder }) {
  const hasVariants = !!product.variants;
  const [selectedIdx, setSelectedIdx] = useState(0);

  const selected = hasVariants ? product.variants[selectedIdx] : null;
  const displayPrice = hasVariants ? selected.mrp : product.mrp;
  const orderName = hasVariants ? selected.name : product.name;
  const badge = getBadge(product.name);

  return (
    <div className="product-card">
      <div className="image-wrap">
        {badge && (
          <span className={`product-badge ${badge === "Best Seller" ? "badge-best" : "badge-new"}`}>
            {badge}
          </span>
        )}
        <img src={getProductImage(product.name)} alt={product.name} />
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        {hasVariants && (
          <select
            className="variant-select"
            value={selectedIdx}
            onChange={(e) => setSelectedIdx(Number(e.target.value))}
          >
            {product.variants.map((v, i) => (
              <option key={v.id} value={i}>{v.variantLabel}</option>
            ))}
          </select>
        )}
        <div className="price-row">
          <span>MRP</span>
          <strong>₹{displayPrice}</strong>
        </div>
        <button className="order-now-btn" onClick={() => onQuickOrder(orderName)}>
          Order Now →
        </button>
      </div>
    </div>
  );
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
  const grouped = groupProducts(products);

  return (
    <section className="section" id="products">
      <div className="section-heading">
        <p>Our Collection</p>
        <h2>Our Products</h2>
      </div>
      <div className="product-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : grouped.map((product) => (
              <ProductCard key={product.id} product={product} onQuickOrder={onQuickOrder} />
            ))}
      </div>
    </section>
  );
}
