import { Clock, Flame, Loader2, LogIn, Plus, Star, TrendingUp } from "lucide-react";
import { useEffect, useState, useCallback, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../../layout/TopBar";
import MemeCard from "../components/MemeCard";
import { memeService } from "../services/memeService";
import { useAuth } from "../../../context/AuthContext";

// Lazy-load the modal — only downloaded when a logged-in user opens it
const SubmitMemeModal = lazy(() => import("../components/SubmitMemeModal"));

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT = "#7c5cfc";

export default function Memes() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [feedTab, setFeedTab] = useState("hot"); // "hot" | "new" | "top" | "saved"
  const [allMemes, setAllMemes] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [memeOfTheWeek, setMemeOfTheWeek] = useState(null);
  const [topMemers, setTopMemers] = useState([]);
  const [loadingMemes, setLoadingMemes] = useState(true);

  const [savedIds, setSavedIds] = useState(new Set());
  const [upvotedIds, setUpvotedIds] = useState(new Set());
  const [reactionMap, setReactionMap] = useState({});

  const [submitOpen, setSubmitOpen] = useState(false);
  const [editMeme, setEditMeme] = useState(null);

  useEffect(() => {
    async function fetchSidebarData() {
      try {
        const [tagsRes, weekMemeRes, memersRes] = await Promise.all([
          memeService.getTrendingTags(),
          memeService.getMemeOfTheWeek(),
          memeService.getTopMemers(),
        ]);

        setTrendingTags(tagsRes.data || []);
        setMemeOfTheWeek(weekMemeRes.data?.[0] || weekMemeRes.data || null);
        setTopMemers(memersRes.data || []);
      } catch (error) {
        console.error("Failed to fetch sidebar data", error);
      }
    }
    fetchSidebarData();
  }, []);

  async function fetchMemes() {
    setLoadingMemes(true);
    try {
      const res = await memeService.getMemes(feedTab);
      const newMemes = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setAllMemes(newMemes);

      // Sync user interaction state from backend
      setReactionMap((prev) => {
        const next = { ...prev };
        newMemes.forEach((m) => {
          if (m.userReaction) next[m.id || m._id] = m.userReaction;
        });
        return next;
      });
      setUpvotedIds((prev) => {
        const next = new Set(prev);
        newMemes.forEach((m) => {
          if (m.isUpvoted) next.add(m.id || m._id);
        });
        return next;
      });
      setSavedIds((prev) => {
        const next = new Set(prev);
        newMemes.forEach((m) => {
          if (m.isSaved) next.add(m.id || m._id);
        });
        return next;
      });
    } catch (error) {
      console.error("Failed to fetch memes", error);
    } finally {
      setLoadingMemes(false);
    }
  }

  useEffect(() => {
    fetchMemes();
  }, [feedTab]);

  const toggleSave = useCallback(async (id) => {
    setSavedIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
    try {
      await memeService.toggleSave(id);
    } catch (e) {
      console.error(e);
      setSavedIds((prev) => {
        const s = new Set(prev);
        s.has(id) ? s.delete(id) : s.add(id);
        return s;
      });
    }
  }, []);

  const toggleUpvote = useCallback(async (id) => {
    setUpvotedIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
    try {
      await memeService.toggleUpvote(id);
    } catch (e) {
      console.error(e);
      setUpvotedIds((prev) => {
        const s = new Set(prev);
        s.has(id) ? s.delete(id) : s.add(id);
        return s;
      });
    }
  }, []);

  const setReaction = useCallback(
    async (id, emoji) => {
      const prevReaction = reactionMap[id] || "";
      const newReaction = prevReaction === emoji ? "" : emoji;
      setReactionMap((prev) => ({ ...prev, [id]: newReaction }));

      try {
        await memeService.reactToMeme(id, newReaction);
      } catch (e) {
        console.error(e);
        setReactionMap((prev) => ({ ...prev, [id]: prevReaction }));
      }
    },
    [reactionMap]
  );

  const handleEditMeme = useCallback(async (meme) => {
    setEditMeme(meme);
    setSubmitOpen(true);
  }, []);

  const handleEditComplete = useCallback(
    async (updatedMeme) => {
      setEditMeme(null);
      await fetchMemes();
    },
    [feedTab]
  );

  const handleDeleteMeme = useCallback(async (meme) => {
    const memeId = meme.id || meme._id;
    if (!confirm("Are you sure you want to delete this meme?")) return;

    try {
      const res = await memeService.deleteMeme(memeId);
      if (res.success) {
        setAllMemes((prev) => prev.filter((m) => (m.id || m._id) !== memeId));
      } else {
        console.error("Failed to delete meme:", res.message);
      }
    } catch (e) {
      console.error("Failed to delete meme:", e);
    }
  }, []);

  const TABS = [
    { value: "hot", label: "Hot", icon: Flame },
    { value: "new", label: "New", icon: Clock },
    { value: "top", label: "Top", icon: TrendingUp },
    { value: "saved", label: "Saved", icon: Star },
  ];

  const renderSidebarContent = () => (
    <>
      {/* Trending tags */}
      <div className="bg-[#13131c] border border-[#232333] rounded-2xl p-6 shadow-sm">
        <h4 className="font-bebas text-[18px] tracking-[0.08em] font-bold text-[#f4f4f5] mb-6 uppercase">
          Trending Tags
        </h4>
        {!trendingTags || trendingTags.length === 0 ? (
          <p className="text-[14px] text-[#7a7a8c]">No trending tags</p>
        ) : (
          <div className="flex flex-col gap-4">
            {trendingTags.map((tagObj, i) => {
              const tagName = typeof tagObj === "string" ? tagObj : tagObj.tag || tagObj.name || "";
              const tagKey = typeof tagObj === "string" ? tagObj : tagObj.tag || tagObj.name || i;
              return (
                <div
                  key={tagKey}
                  className="flex items-center gap-4 cursor-pointer hover:bg-[rgba(255,255,255,0.02)] rounded-md transition-colors"
                >
                  <span
                    className={`font-bebas text-[17px] font-bold w-5 text-center ${
                      i < 3 ? "text-[#f5c518]" : "text-[#424254]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`font-outfit text-[15px] font-medium text-[${ACCENT}] flex-1`}>
                    {tagName}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Meme of the week */}
      <div className="bg-[#13131c] border border-[#232333] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[22px] leading-none">🥇</span>
          <h4 className="font-bebas text-[18px] tracking-[0.08em] font-bold text-[#f4f4f5] m-0 uppercase mt-1">
            Meme of the Week
          </h4>
        </div>
        {!memeOfTheWeek ? (
          <p className="text-[14px] text-[#7a7a8c]">No meme this week</p>
        ) : (
          <>
            <div className="rounded-xl overflow-hidden mb-4 border border-[rgba(255,255,255,0.04)] bg-[#0f0f1c]">
              {memeOfTheWeek.imageUrl || memeOfTheWeek.image ? (
                <img
                  src={memeOfTheWeek.imageUrl || memeOfTheWeek.image}
                  alt={memeOfTheWeek.title}
                  className="w-full h-[160px] object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-[160px] flex items-center justify-center p-4">
                  <span className="text-[13px] text-[#7a7a8c] text-center line-clamp-3">
                    {memeOfTheWeek.textContent || "Text Meme"}
                  </span>
                </div>
              )}
            </div>

            <p className="font-outfit text-[14px] text-[#d1d1d6] font-medium leading-[1.5] mb-5 pr-2">
              {memeOfTheWeek.title}
            </p>

            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-['Outfit'] font-bold text-[12px] text-[#111] overflow-hidden"
                style={{
                  background: memeOfTheWeek.author?.avatar
                    ? "transparent"
                    : memeOfTheWeek.author?.gradient || "#f5c518",
                }}
              >
                {memeOfTheWeek.author?.avatar ? (
                  <img
                    src={memeOfTheWeek.author.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  memeOfTheWeek.author?.initials ||
                  (memeOfTheWeek.author?.name || "U").slice(0, 2).toUpperCase()
                )}
              </div>
              <span className="font-['Outfit'] text-[13px] font-medium text-[#7a7a8c]">
                {memeOfTheWeek.author?.username || memeOfTheWeek.author?.name || "User"}
              </span>
              <span className="font-bebas text-[16px] font-bold text-[#f5c518] tracking-wide ml-auto flex items-center gap-1.5">
                {(() => {
                  const score = memeOfTheWeek.stats?.score ?? memeOfTheWeek.upvotes ?? 0;
                  return score / 1000 >= 1 ? (score / 1000).toFixed(1) + "K" : score;
                })()}{" "}
                <span className="text-[10px]">★</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* Top contributors */}
      <div className="bg-[#13131c] border border-[#232333] rounded-2xl p-6 shadow-sm">
        <h4 className="font-bebas text-[18px] tracking-[0.08em] font-bold text-[#f4f4f5] mb-5 uppercase">
          Top Memers
        </h4>
        {!topMemers || topMemers.length === 0 ? (
          <p className="text-[14px] text-[#7a7a8c]">No top memers</p>
        ) : (
          <div className="flex flex-col">
            {topMemers.map((u, i) => (
              <div
                key={u.id || u.name || i}
                className={`flex items-center gap-4 ${i < topMemers.length - 1 ? "py-3.5 border-b border-[#232333]" : "pt-3.5"}`}
              >
                <span
                  className={`font-bebas text-[17px] font-bold w-4 text-center ${i === 0 ? "text-[#f5c518]" : "text-[#424254]"}`}
                >
                  {i + 1}
                </span>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-['Outfit'] font-bold text-[13px] text-[#111] overflow-hidden"
                  style={{ background: u.avatar ? "transparent" : u.gradient || "#f5c518" }}
                >
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    u.initials || (u.name || u.username || "U").slice(0, 2).toUpperCase()
                  )}
                </div>
                <span className="font-['Outfit'] text-[15px] font-bold text-[#f0f0f8] flex-1">
                  {u.username || u.name || `User ${i}`}
                </span>
                <div className="flex flex-col items-end leading-tight">
                  <span className="font-['Outfit'] text-[12px] font-medium text-[#7a7a8c]">
                    {u.stats?.totalMemes ?? u.memeCount ?? u.memes ?? 0}
                  </span>
                  <span className="font-['Outfit'] text-[11px] text-[#636374]">memes</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#080810]">
      {submitOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-[#7c5cfc]/30 border-t-[#7c5cfc] animate-spin" />
            </div>
          }
        >
          <SubmitMemeModal
            onClose={() => {
              setSubmitOpen(false);
              setEditMeme(null);
            }}
            onCreate={async () => {
              if (feedTab !== "new") {
                setFeedTab("new");
              } else {
                await fetchMemes();
              }
            }}
            onEdit={handleEditComplete}
            editMeme={editMeme}
          />
        </Suspense>
      )}

      <TopBar title="Memes" subtitle="Cinema's lighter side" />

      <div className="flex flex-col md:flex-row gap-6 px-4 sm:px-7 pt-4 sm:pt-6 pb-24 md:pb-16 items-start">
        {/* ── Main feed ── */}
        <div className="flex-1 min-w-0 w-full">
          {/* Feed tabs + submit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
            <div className="flex overflow-x-auto no-scrollbar bg-[#12121a] border border-[#22222d] rounded-xl p-1 gap-1 w-full sm:w-fit">
              {TABS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setFeedTab(value)}
                  className={`group flex items-center gap-2 px-4 py-1.5 rounded-lg text-[13px] font-outfit font-semibold transition-all duration-300 ease-out active:scale-95 cursor-pointer ${
                    feedTab === value
                      ? "bg-[rgba(124,92,252,0.094)] text-[#7c5cfc] border border-[#7c5cfc]/30 shadow-[0_0_15px_rgba(124,92,252,0.15)]"
                      : "bg-transparent border border-transparent text-gray-500 hover:text-gray-300 hover:bg-[#181822] hover:shadow-sm"
                  }`}
                >
                  <Icon
                    size={14}
                    strokeWidth={feedTab === value ? 2.5 : 2}
                    className={`transition-transform duration-300 ease-out ${feedTab === value ? "scale-110" : "group-hover:scale-110"}`}
                  />
                  {label}
                </button>
              ))}
            </div>
            {currentUser ? (
              <button
                onClick={() => setSubmitOpen(true)}
                className="flex items-center justify-center gap-2 bg-[#7c5cfc] text-white text-[13px] font-outfit font-bold px-4 py-2.5 sm:py-2 rounded-lg transition-all duration-200 hover:bg-[#8b6dfc] hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(124,92,252,0.3)] hover:shadow-[0_6px_20px_rgba(124,92,252,0.4)] active:scale-95 cursor-pointer w-full sm:w-auto"
              >
                <Plus size={15} strokeWidth={2.5} />
                Submit Meme
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-2 bg-[#7c5cfc]/10 border border-[#7c5cfc]/30 text-[#7c5cfc] text-[13px] font-outfit font-bold px-4 py-2.5 sm:py-2 rounded-lg transition-all duration-200 hover:bg-[#7c5cfc]/20 cursor-pointer w-full sm:w-auto"
              >
                <LogIn size={15} strokeWidth={2.5} />
                Login to Post Meme
              </button>
            )}
          </div>

          {/* Mobile Sidebar */}
          <div className="md:hidden flex flex-col gap-5 w-full mb-5 antialiased text-[#f0f0f8]">
            {renderSidebarContent()}
          </div>

          {/* Loading State */}
          {loadingMemes && (
            <div className="text-center py-16 flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-[rgba(124,92,252,0.8)]" />
              <span className="font-outfit text-sm text-[rgba(240,240,248,0.5)]">
                Loading memes...
              </span>
            </div>
          )}

          {/* Empty State */}
          {!loadingMemes && allMemes.length === 0 && feedTab === "saved" && (
            <div className="text-center py-16 px-6 text-[rgba(240,240,248,0.3)] font-outfit text-sm">
              <div className="text-5xl mb-3">🔖</div>
              No saved memes yet. Bookmark your favourites to find them here.
            </div>
          )}

          {!loadingMemes && allMemes.length === 0 && feedTab !== "saved" && (
            <div className="text-center py-16 px-6 text-[rgba(240,240,248,0.3)] font-outfit text-sm">
              <div className="text-5xl mb-3">🤷</div>
              No memes found in this feed!
            </div>
          )}

          {/* Meme cards */}
          {!loadingMemes && (
            <div className="flex flex-col gap-3.5">
              {allMemes.map((meme) => (
                <MemeCard
                  key={meme.id || meme._id}
                  meme={meme}
                  upvoted={upvotedIds.has(meme.id || meme._id)}
                  saved={savedIds.has(meme.id || meme._id)}
                  reaction={reactionMap[meme.id || meme._id] || ""}
                  onUpvote={() => toggleUpvote(meme.id || meme._id)}
                  onSave={() => toggleSave(meme.id || meme._id)}
                  onReact={(emoji) => setReaction(meme.id || meme._id, emoji)}
                  onEdit={handleEditMeme}
                  onDelete={handleDeleteMeme}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="hidden md:flex w-[330px] flex-shrink-0 flex-col gap-5 antialiased text-[#f0f0f8]">
          {renderSidebarContent()}
        </div>
      </div>
    </div>
  );
}
