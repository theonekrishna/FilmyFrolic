import { Check, Image as ImageIcon, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { MOVIES } from "../../Home/data/movies";
import { MEME_TEMPLATES } from "../data/memes";
import { memeService } from "../services/memeService";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT = "#7c5cfc";

const MEME_MOVIE_TAGS = MOVIES.slice(0, 8).map((m) => m.title);

export default function SubmitMemeModal({ onClose, onCreate, onEdit, editMeme }) {
  const isEditMode = !!editMeme;

  const [format, setFormat] = useState(editMeme?.format || "text");
  const [title, setTitle] = useState(editMeme?.title || "");
  const [content, setContent] = useState(editMeme?.textContent || "");
  const [movieTag, setMovieTag] = useState(editMeme?.movieRef || editMeme?.movie_tag || "");
  const [tags, setTags] = useState(editMeme?.tags || []);
  const [template, setTemplate] = useState("t6");
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(editMeme?.image || editMeme?.imageUrl || "");

  const overlayRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  async function submit() {
    if (!title.trim()) return;
    setIsSubmitting(true);

    try {
      let imageUrl = "";

      if (format === "image" && imageFile) {
        const uploadRes = await memeService.uploadImage(imageFile);
        console.log("Upload response:", uploadRes);

        // unwrap() returns the response directly when it has 'success' property
        // so uploadRes = {imageUrl: "...", success: true}
        imageUrl = uploadRes.imageUrl || "";

        console.log("Extracted imageUrl:", imageUrl);

        if (!imageUrl) {
          alert("Image upload failed - no URL returned");
          setIsSubmitting(false);
          return;
        }
      }

      const memeData = {
        title: title.trim(),
        format: format,
        textContent: format === "text" ? content : "",
        imageUrl: imageUrl, // Backend expects this field
        tags: tags || [],
        movieRef: movieTag || "",
      };

      console.log("Sending meme data:", memeData);

      if (isEditMode) {
        // Update existing meme
        const memeId = editMeme.id || editMeme._id;
        const updateData = {
          title: title.trim(),
          format: format,
          textContent: format === "text" ? content : "",
          imageUrl: imageUrl || editMeme?.image || editMeme?.imageUrl || "",
          tags: tags || [],
          movieRef: movieTag || "",
        };
        const updatedMeme = await memeService.updateMeme(memeId, updateData);
        const finalMeme = updatedMeme.data || { ...editMeme, ...updateData };
        onEdit(finalMeme);
      } else {
        // Create new meme
        const newMeme = await memeService.createMeme(memeData);
        const finalMeme = newMeme.data || { ...memeData, id: Date.now() };

        if (format === "image" && imagePreview) {
          finalMeme.image = imageUrl || imagePreview;
          finalMeme.imageUrl = imageUrl;
          finalMeme.format = "image";
        }

        onCreate(finalMeme);
      }

      setDone(true);
      setTimeout(() => {
        setDone(false);
        onClose();
      }, 900);
    } catch (error) {
      console.error("Failed to create meme", error.message || error);
      alert(`Failed to submit: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[9999] bg-[#000000cc] backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-[520px] max-h-[90vh] bg-[#14141e] border border-[#262635] rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header - Reduced padding */}
        <div className="flex justify-between items-center flex-shrink-0 px-4 sm:px-6 py-4 border-b border-[#262635] bg-[#14141e]">
          <div>
            <h2 className="font-['Bebas_Neue'] text-[26px] tracking-[1.5px] text-white m-0 leading-none">
              {isEditMode ? "EDIT MEME" : "SUBMIT MEME"}
            </h2>
            <p className="font-[Outfit] text-[13px] text-[#8a8a9e] mt-1 mb-0">
              {isEditMode ? "Update your meme" : "Make the community laugh"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1e1e2c] border border-transparent hover:border-[#333344] hover:bg-[#252535] transition-all flex items-center justify-center cursor-pointer active:scale-90"
          >
            <X size={16} color="#a0a0b0" strokeWidth={2.5} />
          </button>
        </div>

        {/* Body - Made scrollable for small height screens */}
        <div className="flex flex-col gap-4 px-4 sm:px-6 py-4 overflow-y-auto custom-scrollbar">
          {/* Format Toggle - Reduced height */}
          <div>
            <p className="font-[Outfit] text-[11px] font-bold text-[#6a6a7c] tracking-[1px] mb-2 uppercase">
              FORMAT
            </p>
            <div className="flex gap-3">
              {[
                {
                  id: "text",
                  icon: <span className="font-serif text-[20px] leading-none mb-1">T</span>,
                  label: "Text Meme",
                },
                {
                  id: "image",
                  icon: <ImageIcon size={20} className="mb-1" strokeWidth={1.5} />,
                  label: "Image Meme",
                },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`flex-1 h-[68px] flex flex-col items-center justify-center rounded-xl cursor-pointer font-[Outfit] text-[13px] font-semibold transition-all duration-200 active:scale-[0.98]
                    ${
                      format === f.id
                        ? "bg-[rgba(124,92,252,0.08)] border border-[#7c5cfc] text-[#7c5cfc] shadow-[0_0_15px_rgba(124,92,252,0.1)]"
                        : "bg-[#1a1a26] border border-[#262635] text-[#8a8a9e] hover:bg-[#20202e] hover:border-[#333344]"
                    }`}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Template (text memes only) */}
          {format === "text" && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
              <p className="font-[Outfit] text-[11px] font-bold text-[#6a6a7c] tracking-[1px] mb-2 uppercase">
                TEMPLATE
              </p>
              <div className="flex flex-wrap gap-2">
                {MEME_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer font-[Outfit] text-[12px] transition-all duration-200 active:scale-95
                      ${
                        template === t.id
                          ? "font-bold text-[#7c5cfc] bg-[rgba(124,92,252,0.08)] border border-[#7c5cfc]"
                          : "font-medium text-[#8a8a9e] bg-[#1a1a26] border border-[#262635] hover:bg-[#20202e] hover:text-[#d0d0e0]"
                      }`}
                  >
                    <span className="text-[13px]">{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload (image memes only) - Reduced height */}
          {format === "image" && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-[140px] bg-[#1a1a26] border-2 border-dashed border-[#333344] hover:border-[#7c5cfc]/50 hover:bg-[#1e1e2c] transition-all duration-200 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon
                      size={28}
                      className="text-[#5c5c6e] group-hover:text-[#7c5cfc]/70 transition-colors"
                      strokeWidth={1.5}
                    />
                    <div className="text-center">
                      <p className="font-[Outfit] text-[13px] text-[#8a8a9e] group-hover:text-[#a0a0b0] m-0 transition-colors">
                        Click to upload or drop your image here
                      </p>
                      <p className="font-[Outfit] text-[11px] text-[#5c5c6e] m-0 mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Title / Caption - Reduced height */}
          <div>
            <p className="font-[Outfit] text-[11px] font-bold text-[#6a6a7c] tracking-[1px] mb-2 uppercase">
              TITLE / CAPTION *
            </p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Me explaining why this film is a masterpiece..."
              className="w-full h-[40px] bg-[#1a1a26] border border-[#262635] focus:border-[#7c5cfc] focus:ring-1 focus:ring-[#7c5cfc]/20 transition-all rounded-xl px-4 text-[13px] font-[Outfit] text-white outline-none placeholder-[#5c5c6e] box-border"
            />
          </div>

          {/* Meme Text (text memes only) - Reduced rows */}
          {format === "text" && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
              <p className="font-[Outfit] text-[11px] font-bold text-[#6a6a7c] tracking-[1px] mb-2 uppercase">
                MEME TEXT
              </p>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the meme dialogue here..."
                rows={3}
                className="w-full bg-[#1a1a26] border border-[#262635] focus:border-[#7c5cfc] focus:ring-1 focus:ring-[#7c5cfc]/20 transition-all rounded-xl p-3 text-[13px] font-[Outfit] text-white resize-none outline-none placeholder-[#5c5c6e] leading-[1.5] box-border"
              />
            </div>
          )}

          {/* Movie Tag */}
          <div>
            <p className="font-[Outfit] text-[11px] font-bold text-[#6a6a7c] tracking-[1px] mb-2 uppercase">
              TAG A FILM
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MEME_MOVIE_TAGS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMovieTag(movieTag === m ? "" : m)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full cursor-pointer text-[11px] font-[Outfit] transition-all duration-200 active:scale-95
                    ${
                      movieTag === m
                        ? "font-bold text-[#7c5cfc] bg-[rgba(124,92,252,0.08)] border border-[#7c5cfc]"
                        : "font-medium text-[#8a8a9e] bg-[#1a1a26] border border-[#262635] hover:bg-[#20202e] hover:text-[#d0d0e0]"
                    }`}
                >
                  <span className="text-[12px] opacity-70">🎬</span> {m}
                </button>
              ))}
            </div>
          </div>

          {/* Community Tags */}
          <div>
            <p className="font-[Outfit] text-[11px] font-bold text-[#6a6a7c] tracking-[1px] mb-2 uppercase">
              COMMUNITY TAGS
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["Cinema", "Awards Season", "Hot Take", "Anime", "Sci-Fi", "Horror", "Spoilers"].map(
                (t) => {
                  const active = tags.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() =>
                        setTags((p) => (active ? p.filter((x) => x !== t) : [...p, t]))
                      }
                      className={`px-3 py-1 rounded-full cursor-pointer text-[11px] font-[Outfit] transition-all duration-200 active:scale-95
                      ${
                        active
                          ? "font-bold text-[#7c5cfc] bg-[rgba(124,92,252,0.08)] border border-[#7c5cfc]"
                          : "font-medium text-[#8a8a9e] bg-[#1a1a26] border border-[#262635] hover:bg-[#20202e] hover:text-[#d0d0e0]"
                      }`}
                    >
                      #{t}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* Footer - Reduced padding and button heights */}
        <div className="flex gap-2 sm:gap-3 px-4 sm:px-6 py-3 border-t border-[#262635] bg-[#14141e] flex-shrink-0">
          <button
            onClick={onClose}
            className="w-1/3 px-6 h-[42px] rounded-xl bg-transparent border border-[#333344] hover:bg-[#1e1e2c] hover:border-[#444455] font-[Outfit] text-[13px] font-bold text-[#8a8a9e] transition-all cursor-pointer active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!title.trim() || isSubmitting}
            className={`flex-1 h-[42px] rounded-xl flex items-center justify-center gap-2 font-[Outfit] text-[14px] font-bold transition-all duration-300
              ${
                done
                  ? "bg-[#1f2e24] border border-[#2ecc71]/50 text-[#2ecc71]"
                  : title.trim()
                    ? "bg-[#7c5cfc] hover:bg-[#6b4ce6] text-white shadow-[0_4px_14px_rgba(124,92,252,0.3)] hover:shadow-[0_6px_20px_rgba(124,92,252,0.4)] cursor-pointer active:scale-95 active:translate-y-0.5"
                    : "bg-[#1a1a26] border border-[#262635] text-[#5c5c6e] cursor-not-allowed"
              }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Submitting...
              </>
            ) : done ? (
              <>
                <Check size={15} strokeWidth={3} /> Submitted!
              </>
            ) : isEditMode ? (
              "✏️ Update Meme"
            ) : (
              "😂 Submit Meme"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
