import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Flag, Loader2, AlertCircle, CheckCircle2, LogIn } from "lucide-react";
import { getReportCategories, submitReport } from "../services/reportService";

// ─── Premade fallback categories (used when API fails or returns empty) ────────
// These match the typical report category set from the backend.
// "Others" is always last so user can describe a custom issue.
const FALLBACK_CATEGORIES = [
  { id: "__spam", name: "Spam", description: "Repetitive, unwanted, or promotional content" },
  { id: "__nsfw", name: "NSFW", description: "Adult or sexually explicit content" },
  { id: "__violence", name: "Violence", description: "Graphic violence or threats" },
  {
    id: "__copyright",
    name: "Copyright",
    description: "Uses copyrighted material without permission",
  },
  {
    id: "__offensive",
    name: "Offensive Content",
    description: "Hateful, abusive, or discriminatory material",
  },
  { id: "__misinform", name: "Misinformation", description: "False or misleading information" },
  {
    id: "__privacy",
    name: "Privacy Violation",
    description: "Exposes personal or private information",
  },
  { id: "__others", name: "Others", description: "Other issue not listed above" },
];

/** Deduplicate by name (case-insensitive) — fixes backend returning each item twice */
function deduplicateByName(list) {
  const seen = new Set();
  return list.filter((cat) => {
    const key = (cat.name || "").toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * ReportModal — full report submission flow
 *
 * Props:
 *   isOpen          {boolean}
 *   onClose         {() => void}
 *   moduleType      {string}   e.g. "feed" | "feed_comment" | "meme" | ...
 *   targetId        {string}   ID of the reported object
 *   targetUserId    {string=}  Owner's user ID (optional)
 *   contentPreview  {string=}  Short excerpt shown inside the modal
 */
export default function ReportModal({
  isOpen,
  onClose,
  onSuccess,
  moduleType,
  targetId,
  targetUserId,
  contentPreview,
  isLoggedIn = false,
  onRequireAuth,
}) {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customIssue, setCustomIssue] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error" | "already"
  const [statusMsg, setStatusMsg] = useState("");
  const overlayRef = useRef(null);

  // Load categories when modal opens — only for logged-in users
  useEffect(() => {
    if (!isOpen || !moduleType || !isLoggedIn) return;
    setStatus(null);
    setStatusMsg("");
    setSelectedCategory(null);
    setCustomIssue("");
    setDescription("");
    setCategories([]); // reset before fetching — prevents stale data

    let cancelled = false; // prevent stale updates from StrictMode double-fire

    const load = async () => {
      setLoadingCats(true);
      try {
        const data = await getReportCategories(moduleType);
        if (cancelled) return; // discard result if effect was re-run
        const raw = Array.isArray(data) ? data : [];
        // Deduplicate by name (safety net in case backend returns duplicates)
        const deduped = deduplicateByName(raw);
        setCategories(deduped.length > 0 ? deduped : FALLBACK_CATEGORIES);
      } catch {
        if (!cancelled) setCategories(FALLBACK_CATEGORIES);
      } finally {
        if (!cancelled) setLoadingCats(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    }; // cleanup cancels any in-flight call
  }, [isOpen, moduleType, isLoggedIn]);

  if (!isOpen) return null;

  const isOthers = selectedCategory?.name?.toLowerCase() === "others";

  const canSubmit =
    selectedCategory &&
    (!isOthers || customIssue.trim().length > 0) &&
    !submitting &&
    status !== "success";

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setStatus(null);
    try {
      // Fallback categories have IDs like "__spam" — treat them as "Others"
      const isFallbackCat = selectedCategory.id?.startsWith("__");
      const payload = {
        module_type: moduleType,
        target_id: targetId,
        // Only send a real UUID; for fallback cats we skip category_id
        ...(isFallbackCat ? {} : { category_id: selectedCategory.id }),
      };
      if (targetUserId) payload.target_user_id = targetUserId;
      // For fallback categories, embed the category name as custom_issue
      if (isFallbackCat) {
        payload.custom_issue =
          isOthers && customIssue.trim() ? customIssue.trim() : selectedCategory.name;
      } else if (isOthers && customIssue.trim()) {
        payload.custom_issue = customIssue.trim();
      }
      if (description.trim()) payload.description = description.trim();

      await submitReport(payload);
      setStatus("success");
      setStatusMsg("Report submitted successfully. Our team will review it.");
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
        setStatus(null);
      }, 2200);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit report. Try again.";
      if (
        msg.toLowerCase().includes("already reported") ||
        msg.toLowerCase().includes("already report")
      ) {
        setStatus("already");
        setStatusMsg("You've already reported this content.");
        if (onSuccess) onSuccess();
      } else if (msg.toLowerCase().includes("own content")) {
        setStatus("error");
        setStatusMsg("You cannot report your own content.");
      } else {
        setStatus("error");
        setStatusMsg(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(8,8,16,0.85)", backdropFilter: "blur(10px)" }}
    >
      <div
        className="relative w-full max-w-md flex flex-col rounded-[20px] overflow-hidden shadow-2xl"
        style={{
          background: "#0d0d18",
          border: "1px solid rgba(255,255,255,0.09)",
          maxHeight: "88vh",
        }}
      >
        {/* Red accent bar */}
        <div
          style={{
            height: 3,
            background: "linear-gradient(90deg, #e84545, #e8454588, transparent)",
            flexShrink: 0,
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(232,69,69,0.15)",
                border: "1px solid rgba(232,69,69,0.3)",
              }}
            >
              <Flag size={30} color="#e84545" />
            </div>
            <div>
              <p
                className="font-bold text-[14px] text-white m-0"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Report Content
              </p>
              <p
                className="text-[11px] m-0 capitalize"
                style={{ fontFamily: "'Outfit', sans-serif", color: "rgba(240,240,248,0.35)" }}
              >
                {moduleType === "community_comment"
                  ? "community post"
                  : moduleType?.replace("_", " ")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(240,240,248,0.5)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* ── NOT LOGGED IN — show login prompt instead of the form ── */}
          {!isLoggedIn ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(232,69,69,0.12)",
                  border: "1px solid rgba(232,69,69,0.25)",
                }}
              >
                <LogIn size={24} color="#e84545" />
              </div>
              <div className="text-center">
                <p
                  className="text-[14px] font-semibold m-0 mb-1"
                  style={{ fontFamily: "'Outfit', sans-serif", color: "#f0f0f8" }}
                >
                  Login required
                </p>
                <p
                  className="text-[12px] m-0"
                  style={{ fontFamily: "'Outfit', sans-serif", color: "rgba(240,240,248,0.45)" }}
                >
                  You need to be logged in to report content.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onRequireAuth) {
                    onRequireAuth();
                  } else {
                    window.location.href = "/login";
                  }
                }}
                className="h-10 px-6 rounded-full text-[13px] font-bold flex items-center gap-2 transition-all"
                style={{
                  background: "linear-gradient(135deg, #e84545, #c73232)",
                  border: "1px solid rgba(232,69,69,0.5)",
                  fontFamily: "'Outfit', sans-serif",
                  color: "#fff",
                  boxShadow: "0 4px 20px rgba(232,69,69,0.25)",
                }}
              >
                <LogIn size={14} />
                Go to Login
              </button>
            </div>
          ) : (
            <>
              {/* Content preview */}
              {contentPreview && (
                <div
                  className="rounded-xl px-4 py-3 text-[13px] leading-relaxed"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    fontFamily: "'Outfit', sans-serif",
                    color: "rgba(240,240,248,0.55)",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {contentPreview}
                </div>
              )}

              {/* Status feedback */}
              {status === "success" && (
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: "rgba(46,204,113,0.1)",
                    border: "1px solid rgba(46,204,113,0.25)",
                  }}
                >
                  <CheckCircle2 size={18} color="#2ecc71" />
                  <p
                    className="text-[13px] font-medium m-0"
                    style={{ fontFamily: "'Outfit', sans-serif", color: "#2ecc71" }}
                  >
                    {statusMsg}
                  </p>
                </div>
              )}
              {(status === "error" || status === "already") && (
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: "rgba(232,69,69,0.1)",
                    border: "1px solid rgba(232,69,69,0.25)",
                  }}
                >
                  <AlertCircle size={18} color="#e84545" />
                  <p
                    className="text-[13px] font-medium m-0"
                    style={{ fontFamily: "'Outfit', sans-serif", color: "#e84545" }}
                  >
                    {statusMsg}
                  </p>
                </div>
              )}

              {/* Categories */}
              <div>
                <p
                  className="text-[12px] font-bold mb-2.5 uppercase tracking-wider"
                  style={{ fontFamily: "'Outfit', sans-serif", color: "rgba(240,240,248,0.4)" }}
                >
                  Why are you reporting this?
                </p>
                {loadingCats ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={22} color="#e84545" className="animate-spin" />
                  </div>
                ) : categories.length === 0 ? (
                  <p
                    className="text-center text-[13px] py-6"
                    style={{ fontFamily: "'Outfit', sans-serif", color: "rgba(240,240,248,0.3)" }}
                  >
                    No categories available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((cat) => {
                      const isSelected = selectedCategory?.id === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat)}
                          className="w-full text-left rounded-xl px-4 py-3 transition-all duration-150"
                          style={{
                            background: isSelected
                              ? "rgba(232,69,69,0.12)"
                              : "rgba(255,255,255,0.03)",
                            border: isSelected
                              ? "1px solid rgba(232,69,69,0.4)"
                              : "1px solid rgba(255,255,255,0.07)",
                            fontFamily: "'Outfit', sans-serif",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                              style={{
                                border: isSelected
                                  ? "2px solid #e84545"
                                  : "2px solid rgba(255,255,255,0.2)",
                              }}
                            >
                              {isSelected && (
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ background: "#e84545" }}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-[13px] font-semibold m-0"
                                style={{ color: isSelected ? "#f0f0f8" : "rgba(240,240,248,0.75)" }}
                              >
                                {cat.name}
                              </p>
                              {cat.description && (
                                <p
                                  className="text-[11px] mt-0.5 m-0"
                                  style={{ color: "rgba(240,240,248,0.35)" }}
                                >
                                  {cat.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Custom issue — only when "Others" is selected */}
              {isOthers && (
                <div>
                  <label
                    className="block text-[12px] font-bold mb-1.5 uppercase tracking-wider"
                    style={{ fontFamily: "'Outfit', sans-serif", color: "rgba(240,240,248,0.4)" }}
                  >
                    Describe the issue <span style={{ color: "#e84545" }}>*</span>
                  </label>
                  <input
                    autoFocus
                    value={customIssue}
                    onChange={(e) => setCustomIssue(e.target.value)}
                    maxLength={200}
                    placeholder="Briefly describe the issue..."
                    className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontFamily: "'Outfit', sans-serif",
                      color: "#f0f0f8",
                      caretColor: "#e84545",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(232,69,69,0.45)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                    }}
                  />
                </div>
              )}

              {/* Optional additional description */}
              {selectedCategory && (
                <div>
                  <label
                    className="block text-[12px] font-bold mb-1.5 uppercase tracking-wider"
                    style={{ fontFamily: "'Outfit', sans-serif", color: "rgba(240,240,248,0.4)" }}
                  >
                    Additional details{" "}
                    <span style={{ color: "rgba(240,240,248,0.25)" }}>(optional)</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="Any extra context to help our review team..."
                    className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none resize-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontFamily: "'Outfit', sans-serif",
                      color: "#f0f0f8",
                      caretColor: "#e84545",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(232,69,69,0.45)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                    }}
                  />
                  <p
                    className="text-right text-[11px] mt-1"
                    style={{ fontFamily: "'Outfit', sans-serif", color: "rgba(240,240,248,0.25)" }}
                  >
                    {500 - description.length} left
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}
        >
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-full text-[13px] font-semibold transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "'Outfit', sans-serif",
              color: "rgba(240,240,248,0.6)",
            }}
          >
            Cancel
          </button>
          {isLoggedIn && (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 h-10 rounded-full text-[13px] font-bold flex items-center justify-center gap-2 transition-all"
              style={{
                background: canSubmit
                  ? "linear-gradient(135deg, #e84545, #c73232)"
                  : "rgba(255,255,255,0.06)",
                border: canSubmit
                  ? "1px solid rgba(232,69,69,0.5)"
                  : "1px solid rgba(255,255,255,0.06)",
                fontFamily: "'Outfit', sans-serif",
                color: canSubmit ? "#fff" : "rgba(240,240,248,0.25)",
                cursor: canSubmit ? "pointer" : "not-allowed",
                boxShadow: canSubmit ? "0 4px 20px rgba(232,69,69,0.25)" : "none",
              }}
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Flag size={10} />
                  Submit Report
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
