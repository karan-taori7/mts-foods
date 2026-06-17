const STATS = [
  { value: "Own", label: "Factory" },
  { value: "17+", label: "Products" },
  { value: "Fresh", label: "Every Batch" },
  { value: "Trusted", label: "By Families" },
];

export default function TrustBar() {
  return (
    <section className="trust-bar">
      {STATS.map((s) => (
        <div key={s.label}>
          <strong>{s.value}</strong>
          <span>{s.label}</span>
        </div>
      ))}
    </section>
  );
}
