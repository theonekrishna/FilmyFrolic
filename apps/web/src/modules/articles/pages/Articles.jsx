import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../../../layout/TopBar";
import {
  Plus,
  Flame,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Zap,
  ChevronRight,
  Hash,
} from "lucide-react";

// Data & Components
import { ARTICLES, CATEGORY_FILTERS, GOSSIPS } from "../data/articles";
import ArticleListCard from "../components/ArticleListCard";
import CreateArticleModal from "../components/CreateArticleModal";

const ACCENT = "#f5c518";

export default function Articles() {
  const navigate = useNavigate();

  // ── State ──
  const [mainTab, setMainTab] = useState("articles");
  const [filterCat, setFilterCat] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  // ── Logic ──
  const filteredArticles = ARTICLES.filter(
    (a) => filterCat === "all" || a.category.toLowerCase() === filterCat
  );
  const featured = filteredArticles.find((a) => a.featured);
  const listArticles = filteredArticles.filter((a) => !a.featured || filterCat !== "all");

  return (
    <div className="min-h-screen bg-[#080810] text-[#f0f0f8] font-['Outfit'] overflow-x-hidden selection:bg-yellow-400/30">
      {/* Inline Scrollbar Fix */}
      <style>{`
                ::-webkit-scrollbar { width: 8px; height: 3px; }
                ::-webkit-scrollbar-track { background: #080810; }
                ::-webkit-scrollbar-thumb { background: #1a1a26; border-radius: 10px; border: 2px solid #080810; }
                ::-webkit-scrollbar-thumb:hover { background: #f5c518; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>

      {createOpen && (
        <CreateArticleModal
          onClose={() => setCreateOpen(false)}
          onCreate={(newArt) => {
            /* Handle local state update if needed */
          }}
        />
      )}

      <TopBar title="Pulse" />

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-[60px] z-30 w-full bg-[#080810]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="w-full px-4 md:px-6 lg:px-10 py-4 md:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex bg-[#12121e] rounded-[14px] p-1 border border-white/[0.08] shadow-inner w-full sm:w-auto">
            {["articles"].map((tab) => (
              <button
                key={tab}
                onClick={() => setMainTab(tab)}
                className={`flex-1 sm:flex-none px-6 md:px-10 py-2.5 rounded-xl text-[11px] font-black tracking-[2px] transition-all duration-300 ${
                  mainTab === tab
                    ? "bg-white/10 text-white shadow-md"
                    : "text-white/20 hover:text-white/50"
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#f5c518] text-[#080810] px-5 md:px-7 py-2.5 md:py-3 rounded-2xl text-[11px] font-black hover:scale-[1.03] transition-all shadow-[0_8px_25px_rgba(245,197,24,0.15)] uppercase tracking-wider w-full sm:w-auto shrink-0"
          >
            <Plus size={16} strokeWidth={3} /> Write
          </button>
        </div>

        {/* Filters (Screenshot-matched Pill Style) */}
        {mainTab === "articles" && (
          <div className="w-full px-4 md:px-6 lg:px-10 pb-4 md:pb-6 flex items-center gap-3 md:gap-5">
            <div className="hidden sm:flex items-center gap-2 text-white/20 text-[10px] font-black tracking-widest border-r border-white/10 pr-4 shrink-0">
              <Hash size={12} className="text-[#f5c518]" /> FILTERS
            </div>
            <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar py-1 w-full">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setFilterCat(cat.value)}
                  className={`px-4 md:px-6 py-2 rounded-full text-[12px] md:text-[13px] font-medium border transition-all duration-200 whitespace-nowrap shrink-0 ${
                    filterCat === cat.value
                      ? "border-[#f5c518]/30 bg-[#f5c518]/10 text-[#f5c518] shadow-[0_0_15px_rgba(245,197,24,0.1)]"
                      : "border-white/10 bg-white/[0.04] text-white/40 hover:border-white/30 hover:text-white/70"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN GRID ── */}
      <main className="w-full px-4 md:px-6 lg:px-10 pt-6 pb-24 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* ── CONTENT AREA (LEFT) ── */}
        <div className="col-span-1 lg:col-span-8 xl:col-span-9 space-y-6 md:space-y-10">
          {mainTab === "articles" ? (
            <>
              {featured && filterCat === "all" && (
                <div
                  onClick={() => navigate(`/content/articles/${featured.id}`)}
                  className="group relative h-[280px] sm:h-[380px] md:h-[520px] rounded-[24px] md:rounded-[40px] overflow-hidden cursor-pointer border border-white/10 shadow-2xl transition-all hover:border-yellow-400/20"
                >
                  <img
                    src={featured.image}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    alt="featured"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-[#080810]/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full">
                    <div className="flex items-center gap-3 mb-3 md:mb-5">
                      <span className="bg-[#f5c518] text-[#080810] text-[10px] font-black px-2.5 py-1 rounded-md">
                        FEATURED
                      </span>
                      <span className="text-white/50 text-[10px] font-black tracking-[3px] uppercase hidden sm:inline">
                        {featured.category}
                      </span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl md:text-7xl font-['Bebas_Neue'] tracking-wider mb-4 md:mb-6 group-hover:text-[#f5c518] transition-colors leading-[0.85]">
                      {featured.title}
                    </h2>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5">
                {listArticles.map((a) => (
                  <ArticleListCard
                    key={a.id}
                    article={a}
                    onClick={() => navigate(`/content/articles/${a.id}`)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="p-6 rounded-[24px] bg-[#12121e] border-l-8 border-red-500 flex gap-6 items-center shadow-xl">
                <AlertTriangle size={32} className="text-red-500" />
                <div className="flex-1">
                  <h4 className="text-red-500 font-black uppercase tracking-widest text-sm mb-1">
                    Rumor Protocol Active
                  </h4>
                  <p className="text-xs text-white/40 font-medium">
                    Content below is community-sourced and unverified. Proceed with caution.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── SIDEBAR (RIGHT) ── */}
        <aside className="col-span-1 lg:col-span-4 xl:col-span-3 space-y-6 md:space-y-10">
          {mainTab === "articles" ? (
            /* Article Sidebar */
            <>
              {/* Pulse Index */}
              <div className="p-5 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#12121e] border border-white/5 shadow-2xl">
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                  <TrendingUp size={22} className="text-[#f5c518]" />
                  <h4 className="text-xl md:text-2xl font-['Bebas_Neue'] tracking-widest uppercase text-white/90">
                    Pulse Index
                  </h4>
                </div>
                <div className="space-y-4 md:space-y-8">
                  {ARTICLES.slice(0, 6).map((a, i) => (
                    <div
                      key={a.id}
                      className="group cursor-pointer flex gap-4 md:gap-5 border-b border-white/5 pb-4 md:pb-6 last:border-0"
                      onClick={() => navigate(`/content/articles/${a.id}`)}
                    >
                      <span className="text-2xl md:text-3xl font-['Bebas_Neue'] text-white/5 group-hover:text-yellow-400 transition-colors">
                        0{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-[13px] md:text-[14px] font-bold group-hover:text-yellow-400 transition-colors line-clamp-2 text-white/80">
                          {a.title}
                        </h5>
                        <span className="text-[10px] text-white/20 font-black uppercase mt-1.5 md:mt-2 block tracking-widest">
                          {a.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Reacted */}
              <div className="p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-[#12121e] border border-white/5 shadow-2xl">
                <div className="flex items-center gap-2.5 mb-4 md:mb-5">
                  <span className="text-lg">🔥</span>
                  <h4 className="text-lg md:text-xl font-['Bebas_Neue'] tracking-widest uppercase text-white/90">
                    Most Reacted
                  </h4>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      title: "The 25 Most Anticipated Films of the Rest...",
                      reactions: "6.7k",
                    },
                    {
                      title: "How Realm of Ash Rewrote the Rules of Epic...",
                      reactions: "4.8k",
                    },
                    {
                      title: "Ana Kovacs on the Making of Obsidian Proto...",
                      reactions: "3.4k",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="group cursor-pointer flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-white/[0.03] transition-colors"
                      onClick={() => navigate(`/content/articles/${i + 1}`)}
                    >
                      <span className="text-xs">🔥</span>
                      <span className="flex-1 min-w-0 text-[13px] font-medium text-white/70 group-hover:text-white transition-colors truncate">
                        {item.title}
                      </span>
                      <span className="text-[13px] font-bold text-[#e84545]">{item.reactions}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Gossip Sidebar (Heat Index) */
            <>
              <div className="p-5 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#12121e] border border-white/5 shadow-2xl">
                <div className="flex items-center gap-3 mb-6 md:mb-8">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <TrendingUp size={20} />
                  </div>
                  <h4 className="text-xl md:text-2xl font-['Bebas_Neue'] tracking-widest text-white uppercase">
                    Heat Index
                  </h4>
                </div>
                <div className="space-y-6">
                  {[
                    { label: "Realm of Ash", heat: 92, color: "#e84545" },
                    { label: "Obsidian Protocol", heat: 84, color: "#e84545" },
                    { label: "Nexus Rising", heat: 71, color: "#f5c518" },
                    { label: "Ghost Frequency", heat: 68, color: "#f5c518" },
                    { label: "Sakura Protocol", heat: 61, color: "#f39c12" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span className="text-[13px] font-bold text-white/60">{item.label}</span>
                        <span className="text-xs font-black" style={{ color: item.color }}>
                          {item.heat}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${item.heat}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gossip Breakdown */}
              <div className="p-5 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#12121e] border border-white/5 shadow-2xl">
                <h4 className="text-lg md:text-xl font-['Bebas_Neue'] tracking-widest text-white/40 uppercase mb-6 md:mb-8">
                  Breakdown
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      label: "Confirmed Hot",
                      count: 2,
                      icon: "🔥",
                      color: "#e84545",
                    },
                    {
                      label: "Trending",
                      count: 1,
                      icon: "📢",
                      color: "#f5c518",
                    },
                    {
                      label: "Unverified",
                      count: 2,
                      icon: "🤔",
                      color: "#f39c12",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5"
                    >
                      <span className="text-xs font-bold text-white/60">
                        {stat.icon} {stat.label}
                      </span>
                      <span className="font-['Bebas_Neue'] text-lg" style={{ color: stat.color }}>
                        {stat.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
