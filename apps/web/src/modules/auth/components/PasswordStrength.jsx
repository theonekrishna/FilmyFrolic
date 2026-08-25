import { Check } from "lucide-react";

function PasswordStrength({ password }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special char", pass: /[^a-zA-Z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.pass).length;
  const colors = ["#e84545", "#f97316", "#f5c518", "#2ecc71"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <div className="-mt-2">
      {/* Strength bars */}
      <div className="flex gap-1.5 mb-1.5">
        {checks.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors duration-200`}
            style={{ background: i < score ? colors[score] : "rgba(255,255,255,0.1)" }}
          />
        ))}
      </div>

      {/* Checkmarks and labels */}
      <div className="flex gap-3 items-center text-xs font-outfit">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1">
            <div
              className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors duration-200`}
              style={{ background: c.pass ? "#2ecc71" : "rgba(255,255,255,0.12)" }}
            >
              {c.pass && <Check size={7} color="#080810" strokeWidth={3} />}
            </div>
            <span className={`text-[10px] ${c.pass ? "text-gray-300" : "text-gray-400/50"}`}>
              {c.label}
            </span>
          </div>
        ))}

        {/* Strength label */}
        <span className="ml-auto font-bold text-[10px]" style={{ color: colors[score] }}>
          {labels[score]}
        </span>
      </div>
    </div>
  );
}

export default PasswordStrength;
