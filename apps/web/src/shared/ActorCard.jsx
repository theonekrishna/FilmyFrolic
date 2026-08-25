import { useState } from "react";
import { UserPlus, Check } from "lucide-react";

const GRAD = [
  "linear-gradient(135deg,#f5c518,#e84545)",
  "linear-gradient(135deg,#3b82f6,#7c5cfc)",
  "linear-gradient(135deg,#1fd1a8,#3b82f6)",
  "linear-gradient(135deg,#e84545,#7c5cfc)",
];

function getGrad(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return GRAD[Math.abs(h) % GRAD.length];
}
// ─── Vertical ────────────────────────────────────────────────────────────────
function VerticalActorCard({ name, role, imageUrl, initials, accentColor = "#f5c518" }) {
  const [hovered, setHovered] = useState(false);
  const ini = initials ?? name.slice(0, 2).toUpperCase();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex flex-col items-center gap-2.5 cursor-pointer p-3 rounded-xl transition-colors duration-200`}
      style={{ background: hovered ? "rgba(255,255,255,0.04)" : "transparent", width: 96 }}
    >
      {/* Photo */}
      <div
        className={`w-20 h-20 rounded-full overflow-hidden flex-shrink-0 transition-colors duration-200`}
        style={{
          border: hovered ? `2px solid ${accentColor}` : "2px solid transparent",
          boxSizing: "border-box",
        }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-outfit font-bold text-lg"
            style={{ background: getGrad(name), color: "#080810" }}
          >
            {ini}
          </div>
        )}
      </div>

      {/* Name & Role */}
      <div className="text-center min-w-0 w-full">
        <div className="font-outfit text-[13px] font-semibold text-[#f0f0f8] truncate">{name}</div>
        {role && (
          <div className="font-outfit text-[11px] text-[rgba(240,240,248,0.4)] mt-0.5 truncate">
            {role}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Horizontal ───────────────────────────────────────────────────────────────
function HorizontalActorCard({
  name,
  role,
  imageUrl,
  initials,
  accentColor = "#f5c518",
  onFollow,
  following = false,
}) {
  const [hovered, setHovered] = useState(false);
  const [isFollowing, setIsFollowing] = useState(following);
  const ini = initials ?? name.slice(0, 2).toUpperCase();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors duration-200`}
      style={{
        background: hovered ? "rgba(255,255,255,0.04)" : "#12121e",
        border: "1px solid rgba(255,255,255,0.07)",
        borderColor: hovered ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      {/* Photo */}
      <div
        className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 transition-colors duration-200"
        style={{
          border: hovered ? `2px solid ${accentColor}` : "2px solid transparent",
          boxSizing: "border-box",
        }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-outfit font-bold text-sm"
            style={{ background: getGrad(name), color: "#080810" }}
          >
            {ini}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-outfit text-[13px] font-semibold text-[#f0f0f8] truncate">{name}</div>
        {role && (
          <div className="font-outfit text-[11px] text-[rgba(240,240,248,0.4)] mt-0.5">{role}</div>
        )}
      </div>

      {/* Follow button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsFollowing((p) => !p);
          onFollow?.();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0 transition-all duration-200"
        style={{
          border: isFollowing ? `1px solid ${accentColor}40` : `1px solid ${accentColor}`,
          background: isFollowing ? `${accentColor}14` : "transparent",
          cursor: "pointer",
        }}
      >
        {isFollowing ? (
          <Check size={12} color={accentColor} strokeWidth={2.5} />
        ) : (
          <UserPlus size={12} color={accentColor} />
        )}
        <span className="font-outfit text-[11px] font-semibold" style={{ color: accentColor }}>
          {isFollowing ? "Following" : "Follow"}
        </span>
      </button>
    </div>
  );
}

// ─── Exported wrapper ─────────────────────────────────────────────────────────
export default function ActorCard({ orientation = "vertical", ...props }) {
  if (orientation === "horizontal") return <HorizontalActorCard {...props} />;
  return <VerticalActorCard {...props} />;
}
