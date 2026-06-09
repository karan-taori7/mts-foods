import katran from "../assets/SpecialKatran.jpeg";
import masala from "../assets/RajasthaniMasalaPapad.jpeg";
import garlic from "../assets/GarlicPapad.jpeg";
import mastani from "../assets/MastaniPapad.jpeg";

const CATEGORIES = [
  { name: "Special Papads", desc: "Katran, Mastani & more", image: katran },
  { name: "Masala Papads", desc: "Rajasthani varieties", image: masala },
  { name: "Small Packs", desc: "30g & 60g trial sizes", image: garlic },
  { name: "Family Packs", desc: "200g & 400g value packs", image: mastani },
];

export default function Categories() {
  return (
    <section className="categories">
      <div className="section-heading">
        <p>Browse by Type</p>
        <h2>Shop by Category</h2>
      </div>
      <div className="category-grid">
        {CATEGORIES.map((cat) => (
          <a href="#products" className="category-card" key={cat.name}>
            <img src={cat.image} alt={cat.name} />
            <div className="category-overlay">
              <strong>{cat.name}</strong>
              <span>{cat.desc}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
