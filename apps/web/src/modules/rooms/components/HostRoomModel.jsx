import { useRef, useState } from "react";
import { X, Check } from "lucide-react";
import { ROOM_TYPES, MOVIE_SUGGESTIONS, PRIVACY_OPTS } from "../data/rooms";
import axios from "axios";
import { privateAxios, publicAxios } from "../../../utils/AxiosInstance";
const RED = "#e84545";
const baseURL = (import.meta.env.VITE_BASE_URL || "https://filmyfrolic-api.onrender.com").replace(/\/+$/, "");

export default function HostRoomModel({ onClose }) {
  const [roomType, setRoomType] = useState("watch_party"); // ✅ FIX ENUM
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState(""); // ✅ NEW
  const [movie, setMovie] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [maxPeople, setMaxPeople] = useState(50);
  const [schedule, setSchedule] = useState("now");
  const [image, setImage] = useState(null); // ✅ NEW
  const [submitted, setSubmitted] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const overlayRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit() {
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      const formData = new FormData();

      // ✅ FIX: correct room_type mapping
      const formattedRoomType =
        roomType === "watchparty"
          ? "watch_party"
          : roomType === "voiceroom"
            ? "voice_room"
            : roomType;

      // ✅ APPEND DATA
      formData.append("title", title);
      formData.append("subtitle", subtitle || title);
      formData.append("room_type", formattedRoomType);
      formData.append("media_title", movie || "");
      formData.append("privacy", privacy);
      formData.append("max_participants", Number(maxPeople));

      // ✅ schedule / status
      if (schedule === "later") {
        if (!scheduledAt) {
          alert("Please select date & time");
          return;
        }

        // ✅ convert to ISO (important)
        const isoTime = new Date(scheduledAt).toISOString();

        formData.append("scheduled_time", isoTime);
        formData.append("status", "draft");
      } else {
        formData.append("status", "live");
      }

      // ✅ IMAGE (safe)
      if (image) {
        formData.append("room_image", image);
      }

      // 🔍 DEBUG (VERY IMPORTANT)
      console.log("FORM DATA:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // ✅ API CALL
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Your session has expired. Please log in again to host a room.");
        window.dispatchEvent(new CustomEvent("auth-expired"));
        return;
      }

      const res = await privateAxios.post(`/api/rooms`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("SUCCESS:", res.data);

      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        onClose();
        window.location.reload();
      }, 1200);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to create room";
      console.error("Create Room Error:", errorMsg);
      alert(`Room Creation Error: ${errorMsg}`);
      if (err.response?.status === 401 || errorMsg.includes("Invalid Refresh Token") || errorMsg.includes("Unauthorized")) {
        window.dispatchEvent(new CustomEvent("auth-expired"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[9999] bg-[rgba(8,8,16,0.88)] backdrop-blur-[8px] flex items-center justify-center p-4"
    >
      <div className="w-full max-w-[520px] bg-[#12121e] border border-[rgba(255,255,255,0.1)] rounded-[20px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
        {/* Header */}
        <div className="p-[20px_24px_16px] border-b border-[rgba(255,255,255,0.07)] flex justify-between items-center bg-[linear-gradient(135deg,rgba(232,69,69,0.12),transparent)]">
          <div>
            <h2 className="font-['Bebas_Neue',cursive] text-[26px] tracking-[2px] text-[#f0f0f8] m-0">
              Host a Room
            </h2>
            <p className="font-['Outfit',sans-serif] text-[12px] text-[rgba(240,240,248,0.4)] mt-[3px]">
              Set up your space and invite the crowd
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-[34px] h-[34px] rounded-full bg-[rgba(255,255,255,0.06)] border-none flex items-center justify-center cursor-pointer"
          >
            <X size={15} color="rgba(240,240,248,0.6)" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[72vh] flex flex-col gap-5">
          {/* 🔥 ROOM IMAGE (TOP SECTION WITH PREVIEW) */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-[11px] text-white/40 tracking-[0.8px]">ROOM COVER</p>

            {/* Preview Box */}
            <div
              className="w-full h-[160px] rounded-[12px] overflow-hidden border border-white/10 flex items-center justify-center cursor-pointer relative group"
              style={{
                background: "rgba(255,255,255,0.04)",
              }}
              onClick={() => document.getElementById("roomImageInput").click()}
            >
              {image ? (
                <>
                  <img
                    src={URL.createObjectURL(image)}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[12px] font-semibold transition">
                    Change Image
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/50">
                  <span className="text-[22px]">📷</span>
                  <span className="text-[12px]">Click to upload cover</span>
                  <span className="text-[10px] text-white/30">JPG, PNG (Max 5MB)</span>
                </div>
              )}
            </div>

            {/* Hidden Input */}
            <input
              id="roomImageInput"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="hidden"
            />
          </div>
          {/* Room type */}
          <div>
            <p className="font-['Outfit',sans-serif] text-[11px] font-bold text-[rgba(240,240,248,0.45)] tracking-[0.8px] mb-[10px]">
              ROOM TYPE
            </p>

            <div className="flex flex-col gap-2">
              {ROOM_TYPES.map((rt) => (
                <button
                  key={rt.id}
                  onClick={() => setRoomType(rt.id)}
                  className="flex items-center gap-3 p-[12px_14px] rounded-[10px] cursor-pointer text-left"
                  style={{
                    background:
                      roomType === rt.id ? "rgba(232,69,69,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      roomType === rt.id ? RED + "50" : "rgba(255,255,255,0.08)"
                    }`,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      border: `2px solid ${roomType === rt.id ? RED : "rgba(255,255,255,0.3)"}`,
                      background: roomType === rt.id ? RED : "transparent",
                    }}
                  >
                    {roomType === rt.id && (
                      <div className="w-[6px] h-[6px] rounded-full bg-white" />
                    )}
                  </div>

                  <div>
                    <div className="font-['Outfit',sans-serif] text-[13px] font-semibold text-[#f0f0f8]">
                      {rt.label}
                    </div>
                    <div className="font-['Outfit',sans-serif] text-[11px] text-[rgba(240,240,248,0.4)]">
                      {rt.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <p className="font-['Outfit',sans-serif] text-[11px] font-bold text-[rgba(240,240,248,0.45)] tracking-[0.8px] mb-2">
              ROOM TITLE *
            </p>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sakura Protocol rewatch — bring tissues"
              className="w-full h-[46px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[10px] px-[14px] text-[14px] text-[#f0f0f8] outline-none"
              style={{ caretColor: RED }}
            />
          </div>

          <div>
            <p className="font-['Outfit',sans-serif] text-[11px] font-bold text-[rgba(240,240,248,0.45)] tracking-[0.8px] mb-2">
              SUBTITLE (optional)
            </p>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Short description..."
              className="w-full h-[42px] bg-white/5 border border-white/10 rounded px-3 text-white"
            />
          </div>

          {/* Movie */}
          <div>
            <p className="font-['Outfit',sans-serif] text-[11px] font-bold text-[rgba(240,240,248,0.45)] tracking-[0.8px] mb-2">
              MOVIE / SHOW
            </p>

            <input
              value={movie}
              onChange={(e) => setMovie(e.target.value)}
              placeholder="Search or type a film title…"
              className="w-full h-[46px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[10px] px-[14px] text-[14px] text-[#f0f0f8] outline-none mb-2"
              style={{ caretColor: RED }}
            />

            <div className="flex gap-[6px] flex-wrap">
              {MOVIE_SUGGESTIONS.filter(
                (m) => !movie || m.toLowerCase().includes(movie.toLowerCase())
              )
                .slice(0, 4)
                .map((m) => (
                  <button
                    key={m}
                    onClick={() => setMovie(m)}
                    className="px-[10px] py-[4px] rounded-full text-[11px] cursor-pointer font-['Outfit',sans-serif]"
                    style={{
                      background: movie === m ? `${RED}18` : "rgba(255,255,255,0.04)",
                      border: `1px solid ${movie === m ? RED + "50" : "rgba(255,255,255,0.09)"}`,
                      color: movie === m ? RED : "rgba(240,240,248,0.55)",
                    }}
                  >
                    {m}
                  </button>
                ))}
            </div>
          </div>

          {/* Max participants */}
          <div>
            <div className="flex justify-between mb-2">
              <p className="font-['Outfit',sans-serif] text-[11px] font-bold text-[rgba(240,240,248,0.45)] tracking-[0.8px]">
                MAX PARTICIPANTS
              </p>
              <span
                className="font-['Bebas_Neue',cursive] text-[18px] tracking-[1px]"
                style={{ color: RED }}
              >
                {maxPeople}
              </span>
            </div>

            <input
              type="range"
              min={2}
              max={500}
              value={maxPeople}
              onChange={(e) => setMaxPeople(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: RED }}
            />

            <div className="flex justify-between mt-[2px]">
              <span className="text-[10px] text-[rgba(240,240,248,0.3)] font-['Outfit',sans-serif]">
                2
              </span>
              <span className="text-[10px] text-[rgba(240,240,248,0.3)] font-['Outfit',sans-serif]">
                500
              </span>
            </div>
          </div>

          {/* Privacy */}
          <div>
            <p className="font-['Outfit',sans-serif] text-[11px] font-bold text-[rgba(240,240,248,0.45)] tracking-[0.8px] mb-[10px]">
              PRIVACY
            </p>

            <div className="flex gap-2">
              {PRIVACY_OPTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPrivacy(p.id)}
                  className="flex-1 p-[10px_8px] rounded-[10px] text-center cursor-pointer"
                  style={{
                    background: privacy === p.id ? "rgba(232,69,69,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${privacy === p.id ? RED + "50" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  <div
                    className="font-['Outfit',sans-serif] text-[12px] font-semibold"
                    style={{
                      color: privacy === p.id ? RED : "#f0f0f8",
                    }}
                  >
                    {p.label}
                  </div>

                  <div className="font-['Outfit',sans-serif] text-[10px] text-[rgba(240,240,248,0.35)] mt-[2px]">
                    {p.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <p className="font-['Outfit',sans-serif] text-[11px] font-bold text-[rgba(240,240,248,0.45)] tracking-[0.8px] mb-[10px]">
              WHEN
            </p>

            <div className="flex gap-2">
              {[
                { id: "now", label: "🔴 Start Now" },
                { id: "later", label: "📅 Schedule" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSchedule(s.id)}
                  className="flex-1 h-[44px] rounded-[10px] font-['Outfit',sans-serif] text-[13px] font-semibold cursor-pointer"
                  style={{
                    background:
                      schedule === s.id ? "rgba(232,69,69,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      schedule === s.id ? RED + "50" : "rgba(255,255,255,0.08)"
                    }`,
                    color: schedule === s.id ? RED : "rgba(240,240,248,0.6)",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {schedule === "later" && (
            <div>
              <p className="font-['Outfit',sans-serif] text-[11px] font-bold text-[rgba(240,240,248,0.45)] tracking-[0.8px] mb-2">
                SELECT DATE & TIME
              </p>

              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full h-[46px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[10px] px-[14px] text-[14px] text-[#f0f0f8] outline-none"
                style={{ colorScheme: "dark" }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-[16px_24px] border-t border-[rgba(255,255,255,0.07)] flex gap-[10px]">
          <button
            onClick={onClose}
            className="flex-1 h-[48px] rounded-[12px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] font-['Outfit',sans-serif] text-[14px] font-semibold text-[rgba(240,240,248,0.6)] cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="flex-[2] h-[48px] rounded-[12px] font-['Outfit',sans-serif] text-[14px] font-extrabold flex items-center justify-center gap-2 transition-all"
            style={{
              background: submitted
                ? "rgba(46,204,113,0.2)"
                : title.trim()
                  ? RED
                  : "rgba(255,255,255,0.06)",
              border: submitted ? "1px solid rgba(46,204,113,0.5)" : "none",
              color: submitted ? "#2ecc71" : title.trim() ? "#fff" : "rgba(240,240,248,0.3)",
              cursor: title.trim() ? "pointer" : "default",
              boxShadow: title.trim() && !submitted ? `0 4px 16px ${RED}40` : "none",
            }}
          >
            {submitting ? (
              <>
                <span className="w-[14px] h-[14px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : submitted ? (
              <>
                <Check size={16} /> Room Created!
              </>
            ) : schedule === "now" ? (
              "🔴 Go Live Now"
            ) : (
              "📅 Schedule Room"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
