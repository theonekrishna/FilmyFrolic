import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../../layout/TopBar";
import {
  Plus,
  Flame,
  MessageSquare,
  TrendingUp,
  Search,
  BookOpen,
  Sparkles,
  Award,
  Hash,
  X,
  ArrowUpRight,
} from "lucide-react";

// Data & Components
import { ARTICLES, CATEGORY_FILTERS } from "../data/articles";
import ArticleListCard from "../components/ArticleListCard";
import CreateArticleModal from "../components/CreateArticleModal";

import AuthPromptModal from "../../../shared/AuthPromptModal";
import { useAuthGate } from "../../../hooks/useAuthGate";

const ACCENT = "#f5c518";

export default function Articles() {
  const navigate = useNavigate();
  const { requireAuth, authPromptProps } = useAuthGate();

  // ── State ──
  const [filterCat, setFilterCat] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  const toggleBookmark = (id) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Filter Logic ──
  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((a) => {
      const matchesCat =
        filterCat === "all" || a.category.toLowerCase() === filterCat.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [filterCat, searchQuery]);

  const featured = useMemo(() => {
    return filteredArticles.find((a) => a.featured) || filteredArticles[0];
  }, [filteredArticles]);

  const listArticles = useMemo(() => {
    if (!featured) return filteredArticles;
    return filteredArticles.filter((a) => a.id !== featured.id);
  }, [filteredArticles, featured]);

  return (
    <div className="min-h-screen bg-[#080810] text-[#f0f0f8] font-['Outfit'] overflow-x-hidden selection:bg-yellow-400/30">
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 3px; }
        ::-webkit-scrollbar-track { background: #080810; }
        ::-webkit-scrollbar-thumb { background: #1a1a2e; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #f5c518; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <AuthPromptModal {...authPromptProps} />

      {createOpen && (
        <CreateArticleModal onClose={() => setCreateOpen(false)} onCreate={() => {}} />
      )}

      <TopBar title="Articles & Insights" />

      {/* ── HERO BANNER & STICKY CONTROLS ── */}
      <div className="sticky top-[60px] z-30 w-full bg-[#080810]/95 backdrop-blur-xl border-b border-white/[0.08] transition-all">
        <div className="w-full px-4 md:px-6 lg:px-10 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Header Title & Pill */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-[#f5c518] shadow-[0_0_15px_rgba(245,197,24,0.15)]">
              <BookOpen size={18} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                FILM PULSE{" "}
                <span className="text-[10px] bg-white/10 text-yellow-400 font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Editorial
                </span>
              </h1>
              <p className="text-[11px] text-white/40 font-medium">
                Exclusive features, reviews & industry analysis
              </p>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full bg-[#12121e] border border-white/[0.08] rounded-xl pl-9 pr-8 py-2 text-[12px] text-white placeholder-white/20 outline-none focus:border-yellow-400/40 focus:bg-[#151525] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <button
              onClick={() =>
                requireAuth("Sign in to write your own articles, reviews, and film analysis!", () =>
                  setCreateOpen(true)
                )
              }
              className="flex items-center justify-center gap-2 bg-[#f5c518] text-[#080810] px-4 md:px-6 py-2 rounded-xl text-[11px] font-black hover:scale-[1.03] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(245,197,24,0.2)] uppercase tracking-wider shrink-0"
            >
              <Plus size={15} strokeWidth={3} /> Write
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="w-full px-4 md:px-6 lg:px-10 pb-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-black tracking-widest text-white/20 uppercase shrink-0 border-r border-white/10 pr-3">
            <Hash size={11} className="text-[#f5c518]" /> Topics
          </span>
          <div className="flex gap-2 py-0.5">
            {CATEGORY_FILTERS.map((cat) => {
              const active = filterCat.toLowerCase() === cat.value.toLowerCase();
              return (
                <button
                  key={cat.value}
                  onClick={() => setFilterCat(cat.value)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-200 whitespace-nowrap shrink-0 ${
                    active
                      ? "border-[#f5c518]/40 bg-[#f5c518]/15 text-[#f5c518] shadow-[0_0_15px_rgba(245,197,24,0.12)]"
                      : "border-white/[0.06] bg-white/[0.03] text-white/40 hover:border-white/20 hover:text-white/70"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <main className="w-full px-4 md:px-6 lg:px-10 pt-6 pb-24 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column - Articles */}
        <div className="col-span-1 lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Featured Article Card */}
          {featured && !searchQuery && (
            <div
              onClick={() => navigate(`/content/articles/${featured.id}`)}
              className="group relative h-[320px] sm:h-[420px] md:h-[480px] rounded-[28px] overflow-hidden cursor-pointer border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-yellow-400/30"
            >
              <img
                src={featured.image}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                alt={featured.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-[#080810]/60 to-transparent" />

              {/* Featured Badge */}
              <div className="absolute top-6 left-6 flex items-center gap-2">
                <span className="bg-[#f5c518] text-[#080810] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Sparkles size={11} fill="#080810" /> FEATURED COVER
                </span>
                <span className="bg-black/60 backdrop-blur-md text-white/70 border border-white/10 text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  {featured.category}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
                <div className="flex items-center gap-4 text-white/50 text-[11px] font-medium mb-3">
                  <span>By {featured.author?.name || "Editorial Desk"}</span>
                  <span>•</span>
                  <span>{featured.readTime || "5 min read"}</span>
                  <span>•</span>
                  <span>{featured.timeAgo || "Recently"}</span>
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-3 group-hover:text-[#f5c518] transition-colors leading-[1.1]">
                  {featured.title}
                </h2>
                <p className="text-white/60 text-xs md:text-sm line-clamp-2 max-w-3xl font-light mb-4">
                  {featured.excerpt}
                </p>
                <div className="inline-flex items-center gap-2 text-[#f5c518] text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                  Read Article <ArrowUpRight size={14} />
                </div>
              </div>
            </div>
          )}

          {/* List of Articles */}
          {listArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {listArticles.map((a) => (
                <ArticleListCard
                  key={a.id}
                  article={a}
                  bookmarked={bookmarkedIds.has(a.id)}
                  onBookmark={() => toggleBookmark(a.id)}
                  onClick={() => navigate(`/content/articles/${a.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#12121e] rounded-3xl border border-white/5">
              <BookOpen size={36} className="mx-auto text-white/20 mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No articles found</h3>
              <p className="text-xs text-white/40">
                Try adjusting your topic filter or search keyword.
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="col-span-1 lg:col-span-4 xl:col-span-3 space-y-6">
          {/* Trending Pulse Index */}
          <div className="p-6 rounded-[24px] bg-[#12121e] border border-white/[0.08] shadow-2xl">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center text-[#f5c518]">
                <TrendingUp size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pulse Index
                </h3>
                <p className="text-[10px] text-white/30">Trending stories right now</p>
              </div>
            </div>

            <div className="space-y-4">
              {ARTICLES.slice(0, 5).map((a, i) => (
                <div
                  key={a.id}
                  onClick={() => navigate(`/content/articles/${a.id}`)}
                  className="group flex items-start gap-3 cursor-pointer pb-3 border-b border-white/[0.04] last:border-0 last:pb-0"
                >
                  <span className="text-xl font-black text-white/10 group-hover:text-[#f5c518] transition-colors font-mono">
                    0{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-white/80 group-hover:text-yellow-400 transition-colors line-clamp-2 leading-snug">
                      {a.title}
                    </h4>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest mt-1 block">
                      {a.category} • {a.readTime || "4 min"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Reacted Box */}
          <div className="p-6 rounded-[24px] bg-[#12121e] border border-white/[0.08] shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={18} className="text-red-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Most Reacted
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { title: "The 25 Most Anticipated Films of the Season", reactions: "6.7k" },
                { title: "How Realm of Ash Rewrote Epic Fantasy Rules", reactions: "4.8k" },
                { title: "Inside the Making of Obsidian Protocol", reactions: "3.4k" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(`/content/articles/${idx + 1}`)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] cursor-pointer transition-colors"
                >
                  <span className="text-[12px] font-medium text-white/70 line-clamp-1 flex-1 pr-2">
                    {item.title}
                  </span>
                  <span className="text-[11px] font-black text-red-400 shrink-0">
                    {item.reactions}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Writers Box */}
          <div className="p-6 rounded-[24px] bg-[#12121e] border border-white/[0.08] shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Award size={18} className="text-[#f5c518]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Top Contributors
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { name: "PixelFrame_Maya", role: "Chief Critic", avatar: "PM" },
                { name: "CineVault_Alex", role: "Senior Analyst", avatar: "CA" },
                { name: "ReelTalk_Juno", role: "Feature Writer", avatar: "RJ" },
              ].map((w, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 text-[#080810] font-black text-xs flex items-center justify-center">
                    {w.avatar}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{w.name}</h5>
                    <span className="text-[10px] text-white/40">{w.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
