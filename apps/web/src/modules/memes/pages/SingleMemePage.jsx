import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { memeService } from "../services/memeService";
import { useToast } from "../../../shared/Toast";
import { useAuth } from "../../../context/AuthContext";
import MemeCard from "../components/MemeCard";
import SubmitMemeModal from "../components/SubmitMemeModal";

const ACCENT = "#7c5cfc";

export default function SingleMemePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [meme, setMeme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upvoted, setUpvoted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reaction, setReaction] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  const isLoggedIn = !!user;

  // Validate UUID format
  const isValidId =
    id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  useEffect(() => {
    if (!isValidId) {
      setError("Invalid meme ID");
      setLoading(false);
      return;
    }
    fetchMeme();
  }, [id]);

  async function fetchMeme() {
    if (!isValidId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await memeService.getMemeById(id);
      const memeData = res.data || res;

      if (memeData) {
        setMeme(memeData);
        setUpvoted(!!memeData.isUpvoted);
        setSaved(!!memeData.isSaved);
        setReaction(memeData.userReaction || "");
      } else {
        setError("Meme not found");
      }
    } catch (err) {
      console.error("Failed to fetch meme:", err);
      setError("Failed to load meme. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpvote() {
    if (!isValidId) {
      toast.error("Invalid meme ID");
      return;
    }
    const wasUpvoted = upvoted;
    setUpvoted(!wasUpvoted);

    try {
      await memeService.toggleUpvote(id);
    } catch (err) {
      console.error("Failed to upvote:", err);
      setUpvoted(wasUpvoted);
      toast.error("Failed to upvote");
    }
  }

  async function handleSave() {
    if (!isValidId) {
      toast.error("Invalid meme ID");
      return;
    }
    const wasSaved = saved;
    setSaved(!wasSaved);

    try {
      await memeService.toggleSave(id);
    } catch (err) {
      console.error("Failed to save:", err);
      setSaved(wasSaved);
      toast.error("Failed to save");
    }
  }

  async function handleReact(emoji) {
    if (!isValidId) {
      toast.error("Invalid meme ID");
      return;
    }
    const prevReaction = reaction;
    const newReaction = prevReaction === emoji ? "" : emoji;
    setReaction(newReaction);

    try {
      await memeService.reactToMeme(id, newReaction);
    } catch (err) {
      console.error("Failed to react:", err);
      setReaction(prevReaction);
      toast.error("Failed to react");
    }
  }

  async function handleShare() {
    if (!isValidId) {
      toast.error("Invalid meme ID");
      return;
    }
    const shareUrl = `${window.location.origin}/entertain/memes/${id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      await memeService.shareMeme(id);
      toast.success("Link copied to clipboard");
    } catch (err) {
      console.error("Share failed", err);
      toast.error("Failed to copy link");
    }
  }

  async function handleEditMeme() {
    setEditOpen(true);
  }

  async function handleEditComplete(updatedMeme) {
    setEditOpen(false);
    await fetchMeme();
    toast.success("Meme updated");
  }

  async function handleDeleteMeme() {
    if (!confirm("Are you sure you want to delete this meme?")) return;

    try {
      const res = await memeService.deleteMeme(id);
      if (res.success) {
        toast.success("Meme deleted");
        navigate("/entertain/memes");
      } else {
        toast.error(res.message || "Failed to delete meme");
      }
    } catch (err) {
      console.error("Failed to delete meme:", err);
      toast.error("Failed to delete meme");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-[#7c5cfc] animate-spin" />
          <span className="font-['Outfit'] text-[#f0f0f8]/50 tracking-widest text-sm">
            LOADING MEME...
          </span>
        </div>
      </div>
    );
  }

  if (error || !meme) {
    return (
      <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center p-4">
        <p className="text-[#e84545] text-sm font-medium mb-3 text-center">
          {error || "Meme not found"}
        </p>
        <button
          onClick={() => navigate("/entertain/memes")}
          className="px-4 py-2 bg-[#7c5cfc]/10 border border-[#7c5cfc]/30 text-[#7c5cfc] rounded-full text-sm font-medium hover:bg-[#7c5cfc]/20 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Memes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080810]">
      {editOpen && (
        <SubmitMemeModal
          onClose={() => setEditOpen(false)}
          onCreate={() => {}}
          onEdit={handleEditComplete}
          editMeme={meme}
        />
      )}
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#080810]/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/entertain/memes")}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} className="text-[#f0f0f8]/70" />
          </button>
          <h1 className="font-['Bebas_Neue'] text-[22px] tracking-[1.5px] text-[#f0f0f8]">Meme</h1>
        </div>
      </div>

      {/* Meme */}
      <div className="pb-20 px-4 sm:px-7 pt-6 max-w-2xl mx-auto">
        <MemeCard
          meme={meme}
          upvoted={upvoted}
          saved={saved}
          reaction={reaction}
          onUpvote={handleUpvote}
          onSave={handleSave}
          onReact={handleReact}
          onShare={handleShare}
          onEdit={handleEditMeme}
          onDelete={handleDeleteMeme}
          currentUser={user}
        />
      </div>
    </div>
  );
}
