// frontend/src/components/common/Toast.jsx
import { useEffect } from "react";

export default function Toast({ type = "success", message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const base =
    "fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm flex items-center gap-2";
  const styles =
    type === "error"
      ? "bg-red-600 text-white"
      : "bg-emerald-600 text-white";

  return (
    <div className={`${base} ${styles}`}>
      <span>{message}</span>
      <button
        className="ml-3 text-xs underline decoration-white/50"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
}
