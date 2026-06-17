const ITEMS = [
  "✨ Fresh batch ready — order today",
  "🌿 100% natural ingredients",
  "🏭 Made in our own factory",
  "🚀 Delivers across India",
  "✨ Fresh batch ready — order today",
  "🌿 100% natural ingredients",
  "🏭 Made in our own factory",
  "🚀 Delivers across India",
];

export default function AnnouncementBar({ onDismiss }) {
  return (
    <div className="announcement-bar">
      <div className="ann-track">
        <div className="ann-ticker">
          {ITEMS.map((item, i) => (
            <span key={i} className="ann-item">
              {item}
              <span className="ann-sep">·</span>
            </span>
          ))}
        </div>
      </div>
      <button className="ann-close" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
