import { useState, useEffect, useRef } from "react";
import { X, Camera, Globe, User, AtSign, FileText, Check, ChevronRight } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useProfile } from "../../../context/Profilecontext.jsx";
import { GRADIENT_OPTIONS, ALL_GENRES } from "../data/userprofile";
const ACCENT = "#1fd1a8";
const GOLD = "#f5c518";
import axios from "axios";
import { privateAxios } from "../../../utils/AxiosInstance.jsx";
const BASE_URL = (import.meta.env.VITE_BASE_URL || "https://filmyfrolic-api.onrender.com").replace(
  /\/+$/,
  ""
);

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: 10,
        fontWeight: 700,
        color: "rgba(240,240,248,0.38)",
        letterSpacing: 1.2,
        marginBottom: 10,
      }}
    >
      {String(children).toUpperCase()}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, icon, multiline = false, maxLen }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <SectionLabel>{label}</SectionLabel>

      <div
        className={`flex gap-2.5 rounded-xl transition-colors
        bg-white/5 border-[1.5px]
        ${focused ? "border-[#e84545]" : "border-white/10"}
        ${multiline ? "items-start p-3.5" : "items-center h-12 px-3.5"}`}
      >
        <span
          className={`flex flex-shrink-0 transition-colors
          ${focused ? "text-[#e84545]" : "text-white/30"}
          ${multiline ? "pt-[2px]" : ""}`}
        >
          {icon}
        </span>

        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            rows={3}
            maxLength={maxLen}
            className="flex-1 bg-transparent outline-none border-none
            font-outfit text-sm text-[#f0f0f8] resize-none leading-[1.6]
            caret-[#e84545]"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            maxLength={maxLen}
            className="flex-1 bg-transparent outline-none border-none
            font-outfit text-sm text-[#f0f0f8] caret-[#e84545] h-full"
          />
        )}

        {maxLen && (
          <span
            className={`text-[10px] text-white/25 flex-shrink-0 font-outfit
            ${multiline ? "self-end" : "self-center"}`}
          >
            {value.length}/{maxLen}
          </span>
        )}
      </div>
    </div>
  );
}

export default function EditProfileModal({ open, onClose }) {
  const { user, updateProfile } = useAuth();
  const { updateSharedProfile } = useProfile();
  const overlayRef = useRef(null);

  const [displayName, setDisplayName] = useState("Film Enthusiast");
  const [username, setUsername] = useState("film_enthusiast");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [gradient, setGradient] = useState(GRADIENT_OPTIONS[0]);
  const [genres, setGenres] = useState([]);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [errors, setErrors] = useState("");

  useEffect(() => {
    if (!open) return;

    setSaved(false);
    setActiveTab("info");

    const fetchAllData = async () => {
      setLoading(true);

      try {
        const [profileRes, genreRes] = await Promise.all([
          privateAxios.get(`/api/profile/me`),
          privateAxios.get(`/api/profile/me/genres`),
        ]);

        const data = profileRes.data.data;
        setDisplayName(data.display_name || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
        setWebsite(data.website || "");
        setGradient(data.avatar_color || GRADIENT_OPTIONS[0]);
        setAvatarUrl(data.avatar_url || null);
        const mapped = genreRes.data.data.map((g) => g.genre_id);
        setGenres(mapped.length ? mapped : []);
      } catch (error) {
        const msg =
          error.response?.data?.message || error.response?.data?.error || "Something went wrong";
        setErrors({ general: msg });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [open]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Only JPG, PNG, WEBP allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Max file size is 2MB");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return await privateAxios.patch(`/api/profile/me/avatar/upload`, formData);
  };

  if (!open) return null;
  if (loading) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-white/20 border-t-[#1fd1a8] rounded-full animate-spin"></div>
          <p className="text-white/70 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  const initials = displayName
    ? displayName
        .trim()
        .split(" ")
        .map((w) => (w[0] ? w[0] : ""))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "FF";

  function toggleGenre(id) {
    setGenres((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  const handleSave = async () => {
    setSaving(true);
    setErrors({});

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("User not authenticated");
      }

      const isValidWebsite = (url) => {
        if (!url) return true;
        return /^https?:\/\/.+/.test(url);
      };

      if (!isValidWebsite(website.trim())) {
        throw new Error("Invalid website URL");
      }

      // Step 1: Upload avatar if changed
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        const uploadRes = await uploadAvatar(avatarFile);
        finalAvatarUrl = uploadRes.data?.data?.avatar_url || avatarPreview; // optimistic fallback while re-fetch happens
        console.log("Uploaded avatar:", finalAvatarUrl);
      }

      // Step 2: Update profile info
      await privateAxios.patch(`/api/profile/me/info`, {
        display_name: displayName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        website: website.trim(),
      });

      // Step 3: Update avatar color
      const normalizedColor = gradient.replace(/\s+/g, " ").trim().toLowerCase();

      await privateAxios.patch(
        `/api/profile/me/avatar/color`,
        { avatar_color: normalizedColor },
        { headers: { "Content-Type": "application/json" } }
      );

      // Step 4: Update genres
      await privateAxios.put(
        `/api/profile/me/genres`,
        { genres: genres },
        { headers: { "Content-Type": "application/json" } }
      );

      // Step 5: Update local auth context
      updateProfile({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        website: website.trim(),
        gradient,
        genres,
      });

      // Step 6: Push changes into ProfileContext so Sidebar updates instantly
      updateSharedProfile({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        avatar_url: finalAvatarUrl,
        gradient,
      });

      // Step 7: Also fire the global event so any other listeners can re-fetch
      window.dispatchEvent(new CustomEvent("ff-profile-updated"));

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 900);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong";

      console.error("Update profile error:", msg);
      setErrors({ general: msg });
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: "info", label: "Info" },
    { id: "avatar", label: "Avatar" },
    { id: "genres", label: "Genres" },
  ];

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[99999] bg-[rgba(8,8,16,0.88)] backdrop-blur-[10px] flex items-center justify-center p-5"
    >
      <div className="w-full max-w-[500px] bg-[#0d0d18] border border-[rgba(255,255,255,0.1)] rounded-[24px] flex flex-col shadow-[0_32px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden max-h-[calc(100vh-40px)]">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-[22px] pb-[18px] border-b border-[rgba(255,255,255,0.07)] flex-shrink-0">
          <div>
            <h2
              className="text-[26px] tracking-[2.5px] text-[#f0f0f8] leading-none m-0"
              style={{ fontFamily: "'Bebas Neue', cursive" }}
            >
              Edit Profile
            </h2>
            <p
              className="text-[12px] text-[rgba(240,240,248,0.35)] mt-[5px] font-light"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Changes are saved immediately
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-[38px] h-[38px] rounded-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center cursor-pointer flex-shrink-0"
          >
            <X size={16} color="rgba(240,240,248,0.6)" />
          </button>
        </div>

        {/* ── Live avatar preview ── */}
        <div className="flex flex-col items-center px-6 pt-6 pb-4 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.05)] flex-shrink-0">
          <div className="relative mb-3">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current.click()}
              className="w-[80px] h-[80px] rounded-full flex items-center justify-center text-[28px] tracking-[2px] text-white overflow-hidden cursor-pointer"
              style={{
                background: gradient,
                fontFamily: "'Bebas Neue', cursive",
                border: `3px solid ${ACCENT}`,
                boxShadow: `0 0 0 4px ${ACCENT}18, 0 8px 24px rgba(0,0,0,0.5)`,
              }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>

            <div
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-[2px] right-[2px] w-[26px] h-[26px] rounded-full flex items-center justify-center border-[2px] border-[#0d0d18] cursor-pointer"
              style={{ background: ACCENT }}
            >
              <Camera size={12} color="#080810" />
            </div>
          </div>

          <div
            className="text-[20px] tracking-[2px] text-[#f0f0f8] leading-none mb-[2px]"
            style={{ fontFamily: "'Bebas Neue', cursive" }}
          >
            {displayName || "Your Name"}
          </div>

          <div
            className="text-[12px] text-[rgba(240,240,248,0.4)] font-light"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            @{username || "username"}
          </div>
        </div>

        {/* ── Section Tabs ── */}
        <div className="flex gap-0 px-6 border-b border-[rgba(255,255,255,0.07)] flex-shrink-0">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex-1 bg-transparent border-none py-[14px] pb-[12px] text-[13px] cursor-pointer transition-all mb-[-1px]"
              style={{
                borderBottom: `2px solid ${activeTab === id ? ACCENT : "transparent"}`,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: activeTab === id ? 700 : 400,
                color: activeTab === id ? ACCENT : "rgba(240,240,248,0.4)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto px-6 py-[22px] flex flex-col gap-[18px] flex-1 [scrollbar-width:none]">
          {/* INFO TAB */}
          {activeTab === "info" && (
            <>
              <Field
                label="Display Name"
                value={displayName}
                onChange={setDisplayName}
                placeholder="Your full name"
                icon={<User size={16} />}
                maxLen={50}
              />
              <Field
                label="Username"
                value={username}
                onChange={setUsername}
                placeholder="your_username"
                icon={<AtSign size={16} />}
                maxLen={30}
              />
              <Field
                label="Bio"
                value={bio}
                onChange={setBio}
                placeholder="Tell the world about your film taste…"
                icon={<FileText size={16} />}
                multiline
                maxLen={160}
              />
              <Field
                label="Website"
                value={website}
                onChange={setWebsite}
                placeholder="https://yoursite.com"
                icon={<Globe size={16} />}
              />
            </>
          )}

          {/* AVATAR TAB */}
          {activeTab === "avatar" && (
            <>
              <SectionLabel>Choose Avatar Color</SectionLabel>

              <div className="grid grid-cols-4 gap-3">
                {GRADIENT_OPTIONS.map((g) => {
                  const isActive = gradient === g;
                  return (
                    <button
                      key={g}
                      onClick={() => setGradient(g)}
                      className="h-[64px] rounded-[14px] flex items-center justify-center cursor-pointer transition-all"
                      style={{
                        background: g,
                        border: `3px solid ${isActive ? ACCENT : "transparent"}`,
                        outline: isActive ? `1px solid ${ACCENT}40` : "none",
                        boxShadow: isActive ? `0 0 0 2px ${ACCENT}30` : "none",
                      }}
                    >
                      {isActive && (
                        <div className="w-[24px] h-[24px] rounded-full bg-[rgba(0,0,0,0.45)] flex items-center justify-center">
                          <Check size={14} color="#fff" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[14px] p-4 flex items-center gap-[14px]">
                <div
                  className="w-[80px] h-[80px] rounded-full flex items-center justify-center text-[28px] tracking-[2px] text-white overflow-hidden"
                  style={{
                    background: gradient,
                    fontFamily: "'Bebas Neue', cursive",
                    border: `3px solid ${ACCENT}`,
                    boxShadow: `0 0 0 4px ${ACCENT}18, 0 8px 24px rgba(0,0,0,0.5)`,
                  }}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>

                <div>
                  <div
                    className="text-[13px] font-semibold text-[#f0f0f8] mb-[3px]"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Preview
                  </div>
                  <div
                    className="text-[11px] text-[rgba(240,240,248,0.4)]"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    This is how your avatar will look across Filmy Frolic
                  </div>
                </div>
              </div>
            </>
          )}

          {/* GENRES TAB */}
          {activeTab === "genres" && (
            <>
              <SectionLabel>Favourite Genres ({genres.length} selected)</SectionLabel>

              <div className="flex flex-wrap gap-2">
                {ALL_GENRES.map((g) => {
                  const active = genres.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => toggleGenre(g.id)}
                      className="flex items-center gap-[6px] px-[14px] py-[9px] rounded-full cursor-pointer transition-all"
                      style={{
                        background: active ? `${ACCENT}15` : "rgba(255,255,255,0.05)",
                        border: `1.5px solid ${active ? ACCENT + "70" : "rgba(255,255,255,0.09)"}`,
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 13,
                        fontWeight: active ? 700 : 400,
                        color: active ? ACCENT : "rgba(240,240,248,0.6)",
                      }}
                    >
                      <span className="text-[16px]">{g.emoji}</span>
                      {g.label}
                      {active && <Check size={12} />}
                    </button>
                  );
                })}
              </div>

              {genres.length > 0 && (
                <div
                  className="rounded-[12px] px-[14px] py-[12px] flex items-center gap-2"
                  style={{
                    background: `${ACCENT}08`,
                    border: `1px solid ${ACCENT}25`,
                  }}
                >
                  <Check size={13} color={ACCENT} />
                  <span
                    className="text-[12px] font-medium"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      color: ACCENT,
                    }}
                  >
                    {genres.length} genre{genres.length !== 1 ? "s" : ""} selected
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.07)] flex flex-col gap-3 flex-shrink-0 bg-[#0d0d18]">
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-500">
              ⚠ {errors.general}
            </div>
          )}

          <div className="flex gap-[10px]">
            <button
              onClick={onClose}
              className="flex-1 h-[48px] rounded-[13px] border border-[rgba(255,255,255,0.1)] text-[14px] font-semibold cursor-pointer transition-colors"
              style={{
                background: "rgba(255,255,255,0.05)",
                fontFamily: "'Outfit', sans-serif",
                color: "rgba(240,240,248,0.6)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.09)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="flex-[2] h-[48px] rounded-[13px] text-[14px] font-extrabold flex items-center justify-center gap-2 transition-all"
              style={{
                background: saved ? `${ACCENT}20` : `linear-gradient(135deg, ${ACCENT}, #16a085)`,
                color: saved ? ACCENT : "#080810",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check size={16} />
                  Profile Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
