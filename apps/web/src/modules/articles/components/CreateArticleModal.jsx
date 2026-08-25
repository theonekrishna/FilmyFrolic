import { useState, useRef } from "react";
import { X, Bold, Italic, Quote, Image as ImageIcon } from "lucide-react";
import { ARTICLE_CATEGORIES, ARTICLE_TAGS_SUGGESTIONS } from "../data/articles";

const ACCENT = "#f5c518";
export default function CreateArticleModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("Analysis");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [step, setStep] = useState("write");
  const [saved, setSaved] = useState(false);
  const overlayRef = useRef(null);

  function submit() {
    if (!title.trim() || !body.trim()) return;

    onCreate({
      id: `a${Date.now()}`,
      title: title.trim(),
      excerpt: body.trim().slice(0, 160) + (body.length > 160 ? "…" : ""),
      category,
      image:
        "https://images.unsplash.com/photo-1761499930744-1d689014c9a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      author: {
        name: "You",
        initials: "YO",
        gradient: "linear-gradient(135deg,#f5c518,#e84545)",
      },
      timeAgo: "just now",
      readTime: `${Math.max(1, Math.ceil(body.split(" ").length / 200))} min read`,
      reactions: 0,
      comments: 0,
      bookmarked: false,
    });

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[9999] bg-[rgba(8,8,16,0.92)] backdrop-blur-[10px] flex items-center justify-center p-4"
    >
      <div className="w-full max-w-[680px] bg-[#12121e] border border-[rgba(255,255,255,0.1)] rounded-[20px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.7)] max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-[18px] border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-['Bebas_Neue',cursive] text-[24px] tracking-[2px] text-[#f0f0f8] m-0">
              Write Article
            </h2>
            <p className="font-['Outfit',sans-serif] text-[11px] text-[rgba(240,240,248,0.35)] mt-[3px] m-0">
              Long-form film journalism for the community
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Write / Preview toggle */}
            <div className="flex bg-[#1a1a2a] border border-[rgba(255,255,255,0.09)] rounded-[8px] p-[2px]">
              {["write", "preview"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  className="px-[12px] py-[5px] rounded-[6px] font-['Outfit',sans-serif] text-[11px] font-semibold cursor-pointer"
                  style={{
                    background: step === s ? `${ACCENT}18` : "transparent",
                    border: `1px solid ${step === s ? ACCENT + "50" : "transparent"}`,
                    color: step === s ? ACCENT : "rgba(240,240,248,0.45)",
                  }}
                >
                  {s === "write" ? "✏️ Write" : "👁 Preview"}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-[32px] h-[32px] rounded-full bg-[rgba(255,255,255,0.06)] border-none flex items-center justify-center cursor-pointer"
            >
              <X size={14} color="rgba(240,240,248,0.6)" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] p-6 flex flex-col gap-[18px]">
          {step === "write" ? (
            <>
              {/* Title */}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your article headline…"
                className="w-full bg-transparent border-none outline-none font-['Bebas_Neue',cursive] text-[28px] tracking-[1.5px] text-[#f0f0f8] border-b border-[rgba(255,255,255,0.08)] pb-3 box-border"
                style={{ caretColor: ACCENT }}
              />

              {/* Toolbar */}
              <div className="flex gap-[6px]">
                {[
                  { icon: <Bold size={14} />, tip: "Bold" },
                  { icon: <Italic size={14} />, tip: "Italic" },
                  { icon: <Quote size={14} />, tip: "Quote" },
                  { icon: <ImageIcon size={14} />, tip: "Image" },
                ].map((t) => (
                  <button
                    key={t.tip}
                    className="w-[32px] h-[32px] rounded-[7px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] flex items-center justify-center cursor-pointer text-[rgba(240,240,248,0.55)]"
                  >
                    {t.icon}
                  </button>
                ))}
              </div>

              {/* Body */}
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Start writing your article… Use paragraphs, bold for emphasis, and quotes to highlight key points."
                rows={12}
                className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[12px] px-[16px] py-[14px] font-['Outfit',sans-serif] text-[14px] text-[#f0f0f8] resize-none outline-none leading-[1.8] box-border font-light"
                style={{ caretColor: ACCENT }}
              />

              {/* Category */}
              <div>
                <p className="font-['Outfit',sans-serif] text-[11px] font-bold text-[rgba(240,240,248,0.4)] tracking-[0.8px] mb-2">
                  CATEGORY
                </p>

                <div className="flex gap-[7px] flex-wrap">
                  {ARTICLE_CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className="px-[14px] py-[5px] rounded-full font-['Outfit',sans-serif] text-[12px] cursor-pointer"
                      style={{
                        background: category === c ? `${ACCENT}18` : "rgba(255,255,255,0.04)",
                        border: `1px solid ${category === c ? ACCENT + "50" : "rgba(255,255,255,0.09)"}`,
                        fontWeight: category === c ? 700 : 400,
                        color: category === c ? ACCENT : "rgba(240,240,248,0.55)",
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className="font-['Outfit',sans-serif] text-[11px] font-bold text-[rgba(240,240,248,0.4)] tracking-[0.8px] mb-2">
                  TAGS (up to 5)
                </p>

                <div className="flex gap-[6px] flex-wrap mb-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-[4px] rounded-full px-[10px] py-[3px] font-['Outfit',sans-serif] text-[11px]"
                      style={{
                        background: `${ACCENT}12`,
                        border: `1px solid ${ACCENT}30`,
                        color: ACCENT,
                      }}
                    >
                      {t}

                      <button
                        onClick={() => setTags((p) => p.filter((x) => x !== t))}
                        className="bg-transparent border-none cursor-pointer flex p-0"
                        style={{ color: ACCENT }}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-[8px] flex-wrap">
                  {ARTICLE_TAGS_SUGGESTIONS.filter((t) => !tags.includes(t))
                    .slice(0, 6)
                    .map((t) => (
                      <button
                        key={t}
                        onClick={() => tags.length < 5 && setTags((p) => [...p, t])}
                        className="px-[10px] py-[4px] rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)] font-['Outfit',sans-serif] text-[11px] text-[rgba(240,240,248,0.45)] cursor-pointer"
                      >
                        + {t}
                      </button>
                    ))}
                </div>
              </div>
            </>
          ) : (
            /* Preview mode */

            <div>
              {title ? (
                <h1 className="font-['Bebas_Neue',cursive] text-[32px] tracking-[2px] text-[#f0f0f8] mb-3 leading-[1.1]">
                  {title}
                </h1>
              ) : (
                <p className="text-[rgba(240,240,248,0.3)] font-['Outfit',sans-serif] text-[14px]">
                  Add a title to preview it here…
                </p>
              )}

              <div className="flex items-center gap-[8px] mb-5">
                <span
                  className="rounded-full px-[12px] py-[3px] font-['Outfit',sans-serif] text-[11px] font-bold"
                  style={{
                    background: `${ACCENT}15`,
                    border: `1px solid ${ACCENT}35`,
                    color: ACCENT,
                  }}
                >
                  {category}
                </span>

                {tags.map((t) => (
                  <span
                    key={t}
                    className="font-['Outfit',sans-serif] text-[11px] text-[rgba(240,240,248,0.4)]"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {body ? (
                <p className="font-['Outfit',sans-serif] text-[14px] text-[rgba(240,240,248,0.75)] leading-[1.8] font-light whitespace-pre-wrap">
                  {body}
                </p>
              ) : (
                <p className="text-[rgba(240,240,248,0.3)] font-['Outfit',sans-serif] text-[14px]">
                  Start writing to preview your article…
                </p>
              )}
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.07)] flex gap-[10px] shrink-0">
          <button
            onClick={onClose}
            className="flex-1 h-[46px] rounded-[12px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] font-['Outfit',sans-serif] text-[13px] font-semibold text-[rgba(240,240,248,0.6)] cursor-pointer"
          >
            Discard
          </button>

          <button
            onClick={() => {}}
            disabled={!title.trim()}
            className="flex-1 h-[46px] rounded-[12px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] font-['Outfit',sans-serif] text-[13px] font-semibold"
            style={{
              color: title.trim() ? "rgba(240,240,248,0.6)" : "rgba(240,240,248,0.25)",
              cursor: title.trim() ? "pointer" : "default",
            }}
          >
            Save Draft
          </button>

          <button
            onClick={submit}
            disabled={!title.trim() || !body.trim()}
            className="flex-[2] h-[46px] rounded-[12px] font-['Outfit',sans-serif] text-[14px] font-extrabold flex items-center justify-center gap-[8px] transition-all duration-200"
            style={{
              background: saved
                ? "rgba(31,209,168,0.2)"
                : title.trim() && body.trim()
                  ? `linear-gradient(135deg, ${ACCENT}, #d4aa00)`
                  : "rgba(255,255,255,0.06)",

              border: saved ? "1px solid rgba(31,209,168,0.5)" : "none",

              color: saved
                ? "#1fd1a8"
                : title.trim() && body.trim()
                  ? "#080810"
                  : "rgba(240,240,248,0.3)",

              cursor: title.trim() && body.trim() ? "pointer" : "default",

              boxShadow: title.trim() && body.trim() && !saved ? `0 4px 16px ${ACCENT}45` : "none",
            }}
          >
            {saved ? (
              <>
                <Check size={15} />
                Published!
              </>
            ) : (
              "✍️ Publish Article"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
