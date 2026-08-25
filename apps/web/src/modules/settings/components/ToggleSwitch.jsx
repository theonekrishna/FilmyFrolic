export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  activeColor = "cyan",
}) {
  // Map standard string inputs to tailwind classes so they can be bundled properly
  const bgColors = {
    cyan: "bg-[#00C896]",
    yellow: "bg-[#eab308]",
    white: "bg-white",
    red: "bg-red-500",
    blue: "bg-blue-500",
    purple: "bg-indigo-500", // actually indigo looks closer in some themes, or purple-500
    emerald: "bg-emerald-500",
  };

  const ringColors = {
    cyan: "focus:ring-[#00C896]",
    yellow: "focus:ring-[#eab308]",
    white: "focus:ring-white",
    red: "focus:ring-red-500",
    blue: "focus:ring-blue-500",
    purple: "focus:ring-indigo-500",
    emerald: "focus:ring-emerald-500",
  };

  const activeBgClass = bgColors[activeColor] || bgColors.cyan;
  const activeRingClass = ringColors[activeColor] || ringColors.cyan;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 ${activeRingClass} focus:ring-offset-2 focus:ring-offset-[#080810] disabled:cursor-not-allowed disabled:opacity-50 transition-colors`}
    >
      <span className="sr-only">Toggle</span>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute mx-auto h-5 w-9 rounded-full transition-colors duration-200 ease-in-out ${
          checked ? activeBgClass : "bg-[#2a2d36]"
        }`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
