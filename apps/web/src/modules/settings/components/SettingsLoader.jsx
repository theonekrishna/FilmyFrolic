import { memo } from "react";

const SettingsLoader = memo(function SettingsLoader({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-gray-700 border-t-[#1fd1a8] rounded-full animate-spin mb-4" />
      <span
        className="text-gray-400 text-sm font-light"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {text}
      </span>
    </div>
  );
});

export default SettingsLoader;
