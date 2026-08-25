const ACCENT = "#3b82f6";

import { useState, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { createCommunity, createCommunityWithBanner } from "../services/communityService";

export default function CreateCommunityModal({ onClose, onCreate }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [genres, setGenres] = useState([]);
  const [privacy, setPrivacy] = useState("public");
  const [emoji, setEmoji] = useState("🎬");
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const fileInputRef = useRef(null);
  const overlayRef = useRef(null);

  const EMOJIS = [
    "🎬",
    "🎭",
    "🚀",
    "👻",
    "⛩️",
    "🐉",
    "🎵",
    "🌌",
    "🔪",
    "💕",
    "😂",
    "🧠",
    "🏆",
    "🎥",
    "⚡",
  ];
  const ALL_GENRES_LIST = [
    "Anime",
    "Sci-Fi",
    "Horror",
    "Fantasy",
    "Drama",
    "Comedy",
    "Action",
    "Thriller",
    "Romance",
    "Documentary",
  ];
  const PRIVACY_OPTIONS = [
    { value: "public", label: "🌐 Public", desc: "Anyone can join and post" },
    { value: "private", label: "🔒 Private", desc: "Members must be approved" },
    {
      value: "invite",
      label: "📨 Invite Only",
      desc: "Only invited members can join",
    },
  ];

  async function submit() {
    if (!name.trim()) return;

    setIsCreating(true);
    setApiError(null);

    try {
      const payload = {
        name: name.trim(),
        description: desc.trim(),
        category: genres[0] || "General",
        genres: genres,
        avatar_emoji: emoji,
        avatar_gradient: "linear-gradient(135deg, #3b82f6, #9b59b6)",
      };

      // Use createCommunityWithBanner if banner file selected, otherwise regular create
      const responseData = bannerFile
        ? await createCommunityWithBanner(payload, bannerFile)
        : await createCommunity(payload);

      // Map response back to frontend internal community structure
      const newCommunity = {
        id: responseData?.community_id || responseData?.id || `c${Date.now()}`,
        name: name.trim(),
        description: desc.trim(),
        banner:
          responseData?.banner_url ||
          bannerPreview ||
          "https://images.unsplash.com/photo-1727672887892-875dd6e6534b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
        avatarEmoji: emoji,
        avatarGradient: "linear-gradient(135deg, #3b82f6, #9b59b6)",
        members: "1",
        postsToday: 0,
        genres,
        joined: true,
        category: genres[0] || "General",
        isNew: true,
        isCreator: true,
      };

      onCreate(newCommunity);
      onClose();
    } catch (err) {
      console.error("Error creating community:", err);
      setApiError(err.message || "Failed to create community.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[9999] bg-[rgba(8,8,16,0.88)] backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-[500px] bg-[#12121e] border border-white/[0.1] rounded-[20px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-white/[0.07] flex justify-between items-center">
          <div>
            <h2 className="font-[Bebas_Neue] text-2xl tracking-[2px] text-[#f0f0f8] m-0">
              Create Community
            </h2>
            <p className="font-[Outfit] text-xs text-[rgba(240,240,248,0.35)] mt-1">
              Step {step + 1} of 2
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.06] border-none flex items-center justify-center cursor-pointer"
          >
            <X size={14} color="rgba(240,240,248,0.6)" />
          </button>
        </div>
        {/* Step indicator */}
        <div className="flex h-[3px] bg-white/[0.06]">
          <div
            className="bg-[#3b82f6] transition-[width] duration-300"
            style={{ width: step === 0 ? "50%" : "100%" }}
          />
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] [scrollbar-width:none]">
          {step === 0 ? (
            <div className="flex flex-col gap-[18px]">
              {/* Emoji picker */}
              <div>
                <label className="font-[Outfit] text-[11px] font-bold text-[#f0f0f8]/40 tracking-[0.8px] block mb-[10px]">
                  COMMUNITY ICON
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: emoji === e ? `${ACCENT}18` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${
                          emoji === e ? ACCENT + "60" : "rgba(255,255,255,0.09)"
                        }`,
                        fontSize: 20,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              {/* Name */}
              <div>
                <label className="font-[Outfit] text-[11px] font-bold text-[#f0f0f8]/40 tracking-[0.8px] block mb-[8px]">
                  COMMUNITY NAME *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Void & Stars"
                  className="w-full h-[46px] bg-white/5 border border-white/10 rounded-[10px] px-[14px] font-[Outfit] text-[14px] text-[#f0f0f8] outline-none caret-[#3b82f6] box-border"
                />
              </div>
              {/* Description */}
              <div>
                <label className="font-[Outfit] text-[11px] font-bold text-[#f0f0f8]/40 tracking-[0.8px] block mb-[8px]">
                  DESCRIPTION
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="What is this community about?"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-[10px] py-[12px] px-[14px] font-[Outfit] text-[14px] text-[#f0f0f8] resize-none outline-none caret-[#3b82f6] box-border leading-[1.6]"
                />
              </div>
              {/* Genres */}
              <div>
                <label className="font-[Outfit] text-[11px] font-bold text-[#f0f0f8]/40 tracking-[0.8px] block mb-[8px]">
                  GENRES (pick up to 3)
                </label>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {ALL_GENRES_LIST.map((g) => {
                    const active = genres.includes(g);
                    return (
                      <button
                        key={g}
                        onClick={() =>
                          setGenres((prev) =>
                            active
                              ? prev.filter((x) => x !== g)
                              : prev.length < 3
                                ? [...prev, g]
                                : prev
                          )
                        }
                        style={{
                          padding: "5px 12px",
                          borderRadius: 100,
                          background: active ? `${ACCENT}18` : "rgba(255,255,255,0.04)",
                          border: `1px solid ${active ? ACCENT + "50" : "rgba(255,255,255,0.09)"}`,
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 11,
                          fontWeight: active ? 700 : 400,
                          color: active ? ACCENT : "rgba(240,240,248,0.55)",
                          cursor: "pointer",
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Banner Upload */}
              <div>
                <label className="font-[Outfit] text-[11px] font-bold text-[#f0f0f8]/40 tracking-[0.8px] block mb-[10px]">
                  BANNER IMAGE
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setBannerFile(file);
                      setBannerPreview(URL.createObjectURL(file));
                    }
                  }}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "100%",
                    height: bannerPreview ? 120 : 60,
                    background: bannerPreview
                      ? `url(${bannerPreview}) center/cover`
                      : "rgba(255,255,255,0.05)",
                    border: `2px dashed ${bannerPreview ? ACCENT + "50" : "rgba(255,255,255,0.15)"}`,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {!bannerPreview && (
                    <span className="font-[Outfit] text-[13px] text-[#f0f0f8]/50">
                      📁 Click to upload banner image
                    </span>
                  )}
                </div>
                {bannerPreview && (
                  <button
                    onClick={() => {
                      setBannerFile(null);
                      setBannerPreview(null);
                    }}
                    style={{
                      marginTop: 8,
                      padding: "4px 10px",
                      background: "rgba(232,69,69,0.1)",
                      border: "1px solid rgba(232,69,69,0.2)",
                      borderRadius: 6,
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 11,
                      color: "#e84545",
                      cursor: "pointer",
                    }}
                  >
                    Remove banner
                  </button>
                )}
              </div>

              <button
                onClick={() => name.trim() && setStep(1)}
                disabled={!name.trim()}
                style={{
                  height: 48,
                  background: name.trim() ? ACCENT : "rgba(255,255,255,0.06)",
                  border: "none",
                  borderRadius: 12,
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: name.trim() ? "#fff" : "rgba(240,240,248,0.3)",
                  cursor: name.trim() ? "pointer" : "default",
                  boxShadow: name.trim() ? `0 4px 16px ${ACCENT}40` : "none",
                }}
              >
                Next →
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Privacy */}
              <div>
                <label className="font-[Outfit] text-[11px] font-bold text-[#f0f0f8]/40 tracking-[0.8px] block mb-[10px]">
                  PRIVACY
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {PRIVACY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPrivacy(opt.value)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        borderRadius: 10,
                        background:
                          privacy === opt.value ? `${ACCENT}10` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${
                          privacy === opt.value ? ACCENT + "50" : "rgba(255,255,255,0.08)"
                        }`,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          border: `2px solid ${
                            privacy === opt.value ? ACCENT : "rgba(255,255,255,0.3)"
                          }`,
                          background: privacy === opt.value ? ACCENT : "transparent",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {privacy === opt.value && (
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#fff",
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#f0f0f8",
                          }}
                        >
                          {opt.label}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 11,
                            color: "rgba(240,240,248,0.4)",
                          }}
                        >
                          {opt.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Preview card */}
              <div
                style={{
                  background: "#1a1a2a",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: 60,
                    background: "linear-gradient(135deg, #3b82f6, #9b59b6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 28 }}>{emoji}</span>
                </div>
                <div style={{ padding: "10px 14px" }}>
                  <p
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#f0f0f8",
                      margin: "0 0 4px",
                    }}
                  >
                    {name || "Community Name"}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 12,
                      color: "rgba(240,240,248,0.45)",
                      margin: 0,
                    }}
                  >
                    {desc || "Your community description"}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setStep(0)}
                  style={{
                    flex: 1,
                    height: 46,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(240,240,248,0.6)",
                    cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={submit}
                  disabled={isCreating}
                  style={{
                    flex: 2,
                    height: 46,
                    background: isCreating ? "rgba(255,255,255,0.06)" : ACCENT,
                    border: "none",
                    borderRadius: 12,
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 14,
                    fontWeight: 800,
                    color: isCreating ? "rgba(240,240,248,0.3)" : "#fff",
                    cursor: isCreating ? "default" : "pointer",
                    boxShadow: isCreating ? "none" : `0 4px 16px ${ACCENT}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Community 🚀"
                  )}
                </button>
              </div>
              {apiError && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(232, 69, 69, 0.1)",
                    border: "1px solid rgba(232, 69, 69, 0.2)",
                    color: "#e84545",
                    fontSize: 12,
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {apiError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
