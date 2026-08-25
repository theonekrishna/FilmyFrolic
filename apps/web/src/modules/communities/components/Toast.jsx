import { useEffect } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle size={20} color="#22c55e" />,
    error: <XCircle size={20} color="#e84545" />,
    info: <Info size={20} color="#3b82f6" />,
  };

  const bgColors = {
    success: "bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.25)]",
    error: "bg-[rgba(232,69,69,0.1)] border-[rgba(232,69,69,0.25)]",
    info: "bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.25)]",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border ${bgColors[type]} shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-sm animate-[slideIn_0.3s_ease-out]`}
    >
      {icons[type]}
      <span className="font-[Outfit] text-[14px] text-[#f0f0f8]">{message}</span>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-white/[0.1] transition-colors">
        <X size={16} color="rgba(240,240,248,0.5)" />
      </button>
    </div>
  );
}
