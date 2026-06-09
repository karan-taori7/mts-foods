export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type}`}>
      <span className="toast-icon">{toast.type === "success" ? "✓" : "✕"}</span>
      <p>{toast.message}</p>
      <button onClick={onClose} aria-label="Dismiss">✕</button>
    </div>
  );
}
