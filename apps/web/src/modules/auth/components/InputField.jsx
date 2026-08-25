import { useState } from "react";

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon,
  rightSlot,
  error,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold tracking-widest text-gray-400">
        {label.toUpperCase()}
      </label>

      <div
        className={`flex items-center gap-3 bg-white/5 border rounded-xl px-4 h-12 transition 
        ${error ? "border-red-500" : focused ? "border-yellow-400" : "border-white/10"}`}
      >
        <span
          className={`${error ? "text-red-500" : focused ? "text-yellow-400" : "text-gray-500"}`}
        >
          {icon}
        </span>

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent outline-none text-white text-sm"
        />

        {rightSlot}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default InputField;
