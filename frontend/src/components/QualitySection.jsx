const HIGHLIGHTS = [
  {
    label: "Protein",
    value: "19.25",
    unit: "g",
    badge: "High Protein",
    note: "More protein than most papad and namkeen snacks.",
  },
  {
    label: "Sodium",
    value: "379",
    unit: "mg",
    badge: "Low Sodium",
    note: "Far less salt than regular fried namkeen, which often runs 800mg+ per 100g.",
  },
];

const OTHER_NUTRIENTS = [
  { label: "Energy", value: "353.08", unit: "Kcal" },
  { label: "Carbohydrate", value: "65.69", unit: "g" },
  { label: "Dietary Fiber", value: "14.56", unit: "g" },
  { label: "Fat", value: "1.48", unit: "g" },
  { label: "Sugar", value: "0", unit: "g" },
  { label: "Cholesterol", value: "0", unit: "mg" },
  { label: "Iron", value: "5.9", unit: "mg" },
  { label: "Calcium", value: "94", unit: "mg" },
  { label: "Potassium", value: "735", unit: "mg" },
];

export default function QualitySection() {
  return (
    <section className="quality-section">
      <div className="section-heading">
        <p>Lab Tested Quality</p>
        <h2>Every Claim, Backed by Data</h2>
      </div>

      <div className="quality-card">
        <div className="quality-meta">
          <div>
            <strong>Sample Tested</strong>
            <span>Katran Papad, 100g</span>
          </div>
          <div>
            <strong>Report No.</strong>
            <span>EETRL20-260305-01</span>
          </div>
          <div>
            <strong>Tested By</strong>
            <span>EETRL (Independent Lab)</span>
          </div>
        </div>

        <div className="quality-highlights">
          {HIGHLIGHTS.map((h) => (
            <div className="quality-highlight-card" key={h.label}>
              <span className="quality-badge">{h.badge}</span>
              <strong>
                {h.value}<small>{h.unit} / 100g</small>
              </strong>
              <span className="quality-highlight-label">{h.label}</span>
              <p>{h.note}</p>
            </div>
          ))}
        </div>

        <div className="quality-grid">
          {OTHER_NUTRIENTS.map((n) => (
            <div className="quality-pill" key={n.label}>
              <span>{n.label}</span>
              <strong>{n.value} <small>{n.unit}/100g</small></strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
