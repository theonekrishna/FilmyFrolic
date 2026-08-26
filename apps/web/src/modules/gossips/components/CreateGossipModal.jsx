import { useState, useRef } from "react";
import { CAT_CONFIG } from "../data/gossips";
import { X, Image, Edit2, CheckCircle } from "lucide-react";
import { privateAxios } from "../../../utils/AxiosInstance";

const ACCENT = "#f5c518";

/**
 * CreateGossipModal
 * - No gossipToEdit  → Create mode  (POST /api/gossips)
 * - gossipToEdit={…} → Edit mode    (PUT  /api/gossips/:id)
 *
 * Props:
 *   onClose()
 *   onCreate(newGossip)       – create mode callback
 *   onUpdate(updatedGossip)   – edit mode callback
 *   gossipToEdit              – gossip object to pre-fill (optional)
 */
function CreateGossipModal({ onClose, onCreate, onUpdate, gossipToEdit }) {
  const isEditMode = !!gossipToEdit;

  /* ── form state ── */
  const [headline, setHeadline] = useState(gossipToEdit?.headline || "");
  const [text, setText] = useState(gossipToEdit?.excerpt || gossipToEdit?.headline || "");
  const [category, setCategory] = useState(gossipToEdit?.category || "rumor");
  const [topicType, setTopicType] = useState(gossipToEdit?.topic_type || "movies");
  const [sourceUrl, setSourceUrl] = useState(gossipToEdit?.source_url || "");
  const [sourceType, setSourceType] = useState(gossipToEdit?.source_type || "user_reference");
  const [unverifiedConfirmed, setUnverifiedConfirmed] = useState(false);
  const [verified, setVerified] = useState(gossipToEdit?.verified || false);
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState(gossipToEdit?.tags || []);
  const [moderationWarning, setModerationWarning] = useState(null);

  /* image — keep the existing URL to show it; track new file separately */
  const existingImageUrl = gossipToEdit?.image_url || gossipToEdit?.image || null;
  const [imagePreview, setImagePreview] = useState(existingImageUrl);
  const [imageFile, setImageFile] = useState(null); // non-null = user chose a new file

  const overlayRef = useRef(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  /* ── helpers ── */
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addTag = () => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 10) setTags((p) => [...p, t]);
    setTag("");
  };

  /* ── submit ── */
  async function submit() {
    if (loading) return;
    if (!unverifiedConfirmed && category !== "confirmed_news") {
      alert("Please confirm the unverified content declaration before publishing.");
      return;
    }

    if (isEditMode) {
      if (!headline.trim() || !text.trim()) return;
      setLoading(true);
      setModerationWarning(null);
      try {
        let res;
        if (imageFile) {
          const formData = new FormData();
          formData.append("headline", headline.trim());
          formData.append("excerpt", text.trim());
          formData.append("category", category);
          formData.append("topic_type", topicType);
          formData.append("source_url", sourceUrl);
          formData.append("source_type", sourceType);
          formData.append("verified", verified);
          formData.append("tags", JSON.stringify(tags));
          formData.append("image", imageFile);
          res = await privateAxios.put(`/api/gossips/${gossipToEdit.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          res = await privateAxios.put(`/api/gossips/${gossipToEdit.id}`, {
            headline: headline.trim(),
            excerpt: text.trim(),
            category,
            topic_type: topicType,
            source_url: sourceUrl,
            source_type: sourceType,
            verified,
            tags,
          });
        }

        const updated = res.data?.data || res.data;
        onUpdate?.({
          ...gossipToEdit,
          ...updated,
          image_url: imageFile
            ? updated?.image_url || imagePreview
            : (updated?.image_url ?? existingImageUrl),
          tags: updated?.tags ?? tags,
          category: updated?.category ?? category,
          verified: updated?.verified ?? verified,
        });
        onClose();
      } catch (err) {
        console.error("Failed to update gossip:", err.response?.data || err.message);
        alert(err.response?.data?.message || "Failed to update gossip. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!text.trim()) return;
      setLoading(true);
      setModerationWarning(null);
      try {
        const formData = new FormData();
        formData.append("headline", headline.trim() || text.trim().slice(0, 100));
        formData.append("excerpt", text.trim());
        formData.append("category", category);
        formData.append("topic_type", topicType);
        formData.append("source_url", sourceUrl);
        formData.append("source_type", sourceType);
        formData.append("source", sourceUrl ? `Source: ${sourceType}` : "Community Reference");
        formData.append("verified", category === "confirmed_news");
        formData.append("tags", JSON.stringify(tags));
        if (imageFile) formData.append("image", imageFile);

        const res = await privateAxios.post("/api/gossips", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data?.warning) {
          setModerationWarning(res.data.warning);
        }

        onCreate?.(res.data?.data || res.data);
        onClose();
      } catch (err) {
        console.error("Failed to create gossip:", err.response?.data || err.message);
        alert(err.response?.data?.message || "Failed to publish. Please review content safety rules.");
      } finally {
        setLoading(false);
      }
    }
  }

  const cfg = CAT_CONFIG[category] || {
    color: ACCENT,
    emoji: "💬",
    label: "Gossip",
  };
  const CATS = Object.entries(CAT_CONFIG);
  const canSubmit = isEditMode
    ? headline.trim().length > 0 && text.trim().length > 0
    : text.trim().length > 0;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[9999] bg-[rgba(8,8,16,0.88)] backdrop-blur-[8px] flex items-center justify-center p-4"
    >
      <div className="w-full max-w-[540px] max-h-[90vh] overflow-y-auto bg-[#12121e] border border-[rgba(255,255,255,0.1)] rounded-[20px] shadow-[0_32px_80px_rgba(0,0,0,0.8)]">
        {/* Accent top strip */}
        <div
          style={{
            height: 4,
            borderRadius: "20px 20px 0 0",
            background: isEditMode
              ? "linear-gradient(90deg,#3b82f6,#3b82f640,transparent)"
              : `linear-gradient(90deg,${cfg.color},${cfg.color}44,transparent)`,
          }}
        />

        <div className="p-[20px_24px_28px]">
          {/* ── Header ── */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  background: isEditMode ? "rgba(59,130,246,0.12)" : `${cfg.color}15`,
                  border: `1px solid ${isEditMode ? "rgba(59,130,246,0.25)" : cfg.color + "30"}`,
                }}
              >
                {isEditMode ? (
                  <Edit2 size={16} className="text-blue-400" />
                ) : (
                  <span>{cfg.emoji}</span>
                )}
              </div>
              <div>
                <h2
                  className="font-['Bebas_Neue'] text-[20px] tracking-[2px] m-0 leading-none"
                  style={{ color: isEditMode ? "#60a5fa" : "#f0f0f8" }}
                >
                  {isEditMode ? "Edit Gossip" : "Drop Gossip"}
                </h2>
                <p className="text-[10px] text-white/25 m-0 mt-0.5 font-['Outfit']">
                  {isEditMode ? "Update your spilled tea" : "What's the buzz?"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-[rgba(255,255,255,0.06)] border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <X size={15} color="rgba(240,240,248,0.6)" />
            </button>
          </div>

          {/* ── Category chips ── */}
          <div className="mb-4">
            <label className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-2 block">
              Category
            </label>
            <div className="flex flex-wrap gap-[6px]">
              {CATS.map(([key, c]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className="px-[10px] py-[4px] rounded-full font-['Outfit'] text-[11px] font-semibold cursor-pointer transition-all"
                  style={{
                    border: `1px solid ${category === key ? c.color + "55" : "rgba(255,255,255,0.08)"}`,
                    background: category === key ? `${c.color}18` : "rgba(255,255,255,0.02)",
                    color: category === key ? c.color : "rgba(240,240,248,0.35)",
                    transform: category === key ? "scale(1.04)" : "scale(1)",
                  }}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Headline ── */}
          <div className="mb-3">
            <label className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1.5 block">
              Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={100}
              placeholder="Short punchy headline…"
              className="w-full rounded-[10px] px-[14px] py-[9px] font-['Outfit'] text-[14px] font-semibold text-[#f0f0f8] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] outline-none transition-colors"
              style={{ caretColor: ACCENT }}
              onFocus={(e) => (e.target.style.borderColor = `${cfg.color}50`)}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
            />
            <p className="text-[9px] text-white/20 mt-1 text-right">{headline.length}/100</p>
          </div>

          {/* ── Content ── */}
          <div className="mb-3">
            <label className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1.5 block">
              Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Keep it spicy, keep it real…"
              maxLength={500}
              rows={4}
              className="w-full rounded-[10px] p-[10px_14px] font-['Outfit'] text-[14px] text-[#f0f0f8] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] resize-none outline-none box-border leading-[1.6] transition-colors"
              style={{ caretColor: ACCENT }}
              onFocus={(e) => (e.target.style.borderColor = `${cfg.color}50`)}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.09)")}
            />
            <p className="text-[9px] text-white/20 mt-1 text-right">{text.length}/500</p>
          </div>

          {/* ── Image ── */}
          <div className="mb-4">
            <label className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-2">
              Photo
              {isEditMode && existingImageUrl && !imagePreview && (
                <span className="normal-case text-white/20 font-normal text-[9px]">(removed)</span>
              )}
            </label>
            {!imagePreview ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-[12px_16px] rounded-[10px] font-['Outfit'] text-[13px] font-semibold border border-dashed border-[rgba(240,240,248,0.12)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(245,197,24,0.3)] transition-all cursor-pointer group"
              >
                <Image
                  size={15}
                  className="text-[rgba(245,197,24,0.45)] group-hover:text-[#f5c518] transition-colors"
                />
                <span className="text-[rgba(240,240,248,0.35)] group-hover:text-[rgba(240,240,248,0.6)] transition-colors">
                  {isEditMode && existingImageUrl ? "Restore / Add Photo" : "Add Photo"}
                </span>
              </button>
            ) : (
              <div
                className="relative rounded-[10px] overflow-hidden border border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)]"
                style={{ maxHeight: 160 }}
              >
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-full object-cover block"
                  style={{ maxHeight: 160 }}
                  onError={(e) => {
                    e.currentTarget.parentElement.style.display = "none";
                  }}
                />
                {/* change overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-transparent hover:bg-[rgba(0,0,0,0.45)] transition-all cursor-pointer group"
                >
                  <span className="text-white font-['Outfit'] text-[12px] font-bold bg-[rgba(0,0,0,0.65)] px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                    <Image size={12} /> Change Photo
                  </span>
                </button>
                {/* remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  className="absolute top-2 right-2 bg-[rgba(220,38,38,0.75)] hover:bg-red-600 border-none rounded-full w-7 h-7 flex items-center justify-center cursor-pointer transition-colors z-10"
                >
                  <X size={13} color="white" />
                </button>
                {/* status badge */}
                <div className="absolute bottom-2 left-2">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${imageFile ? "bg-green-500/80 text-white" : "bg-black/40 text-white/60"}`}
                  >
                    {imageFile ? "✓ New photo selected" : "Current photo"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* ── Tags ── */}
          <div className="mb-4">
            <label className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-2">
              Tags
              <span
                className={`normal-case font-normal text-[9px] ${tags.length >= 10 ? "text-red-400/70" : "text-white/20"}`}
              >
                ({tags.length}/10)
              </span>
            </label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 px-[9px] py-[3px] rounded-full font-['Outfit'] text-[11px]"
                    style={{
                      background: `${ACCENT}12`,
                      border: `1px solid ${ACCENT}28`,
                      color: ACCENT,
                    }}
                  >
                    #{t}
                    <button
                      onClick={() => setTags((p) => p.filter((x) => x !== t))}
                      className="bg-transparent border-none p-0 flex items-center text-current cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <X size={9} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tag.trim()) {
                  e.preventDefault();
                  addTag();
                }
              }}
              disabled={tags.length >= 10}
              placeholder={
                tags.length >= 10 ? "Max 10 tags reached" : "Type a tag and press Enter…"
              }
              className="w-full rounded-[8px] p-[8px_12px] font-['Outfit'] text-[13px] text-[#f0f0f8] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ caretColor: ACCENT }}
              onFocus={(e) => (e.target.style.borderColor = `${ACCENT}40`)}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
            />
          </div>

          {/* ── Topic selection ── */}
          <div className="mb-4">
            <label className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1.5 block">
              Topic / Entity Type
            </label>
            <select
              value={topicType}
              onChange={(e) => setTopicType(e.target.value)}
              className="w-full rounded-[10px] px-3 py-2 font-['Outfit'] text-[13px] text-[#f0f0f8] bg-[#12121e] border border-white/10 outline-none focus:border-[#f5c518]"
            >
              <option value="movies">🎬 Movie / Series</option>
              <option value="actors">⭐ Actor / Actress</option>
              <option value="directors">🎥 Director / Producer</option>
              <option value="ott">📺 OTT & Streaming Release</option>
              <option value="casting">🎭 Casting & Announcements</option>
              <option value="box_office">💰 Box Office Expectations</option>
              <option value="fan_theories">🧩 Fan Theories & Predictions</option>
            </select>
          </div>

          {/* ── Optional Source Link & Reference ── */}
          <div className="mb-4">
            <label className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Source & Reference (Optional)</span>
              <span className="text-[9px] text-white/20">Display: "Source provided by user"</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full rounded-[8px] px-3 py-2 text-[12px] text-white/80 bg-[#12121e] border border-white/10 outline-none"
              >
                <option value="user_reference">Community Reference</option>
                <option value="official_announcement">Official Announcement</option>
                <option value="social_media">Public Social Post</option>
                <option value="interview">Actor/Director Interview</option>
                <option value="news_article">News Article</option>
              </select>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://source-link.com"
                className="w-full rounded-[8px] px-3 py-2 text-[12px] text-white bg-[#12121e] border border-white/10 outline-none focus:border-[#f5c518]"
              />
            </div>
          </div>

          {/* ── MANDATORY UNVERIFIED DECLARATION CHECKBOX ── */}
          <div className="mb-5 p-3.5 rounded-xl bg-yellow-400/10 border border-yellow-400/25 flex items-start gap-3">
            <input
              type="checkbox"
              id="unverifiedCheck"
              checked={unverifiedConfirmed}
              onChange={(e) => setUnverifiedConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 accent-[#f5c518] cursor-pointer"
            />
            <label htmlFor="unverifiedCheck" className="text-[11px] text-white/80 font-medium cursor-pointer leading-snug">
              <span className="font-bold text-[#f5c518] block mb-0.5">UNVERIFIED CONTENT DECLARATION</span>
              I confirm this post contains user speculation, rumors, or opinion and is not presented as confirmed factual news.
            </label>
          </div>

          {moderationWarning && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
              ⚠️ {moderationWarning}
            </div>
          )}

          {/* ── Submit ── */}
          <button
            onClick={submit}
            disabled={!canSubmit || loading}
            className="w-full h-[46px] rounded-[12px] font-['Outfit'] text-[14px] font-extrabold flex items-center justify-center gap-2 transition-all"
            style={{
              background: loading
                ? "rgba(255,255,255,0.07)"
                : canSubmit
                  ? isEditMode
                    ? "linear-gradient(135deg,#3b82f6,#1d4ed8)"
                    : `linear-gradient(135deg,${cfg.color},${cfg.color}bb)`
                  : "rgba(255,255,255,0.04)",
              color: loading
                ? "rgba(240,240,248,0.4)"
                : canSubmit
                  ? isEditMode
                    ? "#fff"
                    : "#080810"
                  : "rgba(240,240,248,0.2)",
              boxShadow:
                !loading && canSubmit
                  ? isEditMode
                    ? "0 4px 20px rgba(59,130,246,0.35)"
                    : `0 4px 20px ${cfg.color}40`
                  : "none",
              cursor: loading || !canSubmit ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-[rgba(240,240,248,0.25)] border-t-[rgba(240,240,248,0.8)] rounded-full animate-spin" />
                {isEditMode ? "Saving…" : "Dropping…"}
              </>
            ) : isEditMode ? (
              <>
                <Edit2 size={15} /> Save Changes
              </>
            ) : (
              <>{cfg.emoji} Drop Gossip</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGossipModal;
