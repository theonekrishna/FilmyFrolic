import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "../../../layout/TopBar";
import BottomSheet from "../../../shared/BottomSheet";
import SharedMovieCard from "../../../shared/MovieCard";
import { MOVIES } from "../../Home/data/movies";
import {
  DEFAULT_ARTICLE,
  ARTICLES_DATA,
  RELATED_DISCUSSIONS,
  RELATED_ARTICLES,
} from "../data/articles";
import {
  ChevronLeft,
  Bookmark,
  Share2,
  Flame,
  MessageSquare,
  UserPlus,
  Check,
  Gamepad2,
  ThumbsUp,
} from "lucide-react";

const ACCENT = "#f5c518";

export default function ArticleItemDetailsView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data lookup for Object structure
  const article = ARTICLES_DATA[id] || DEFAULT_ARTICLE;

  const [bookmarked, setBookmarked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [reacted, setReacted] = useState(false);
  const [movieSheetOpen, setMovieSheetOpen] = useState(null);
  const [quizSheetOpen, setQuizSheetOpen] = useState(false);

  const sheetMovie = MOVIES.find((m) => m.id === movieSheetOpen);

  // Auto-scroll to top on article change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="min-h-screen bg-[#080810] text-[#f0f0f8] font-['Outfit'] overflow-x-hidden selection:bg-[#f5c518]/30">
      <TopBar />

      {/* ── STICKY BREADCRUMB ── */}
      <nav className="w-full px-4 md:px-6 lg:px-8 py-4 md:py-5 border-b border-white/5 bg-[#080810]/90 backdrop-blur-xl sticky top-[60px] z-40">
        <div className="flex items-center justify-between w-full gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[2px] text-white/40 hover:text-[#f5c518] transition-all"
          >
            <ChevronLeft size={14} strokeWidth={3} />
            Back to Pulse
          </button>
          <div className="flex items-center gap-6">
            <button className="text-white/30 hover:text-white transition-colors">
              <Share2 size={18} />
            </button>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={bookmarked ? "text-[#f5c518]" : "text-white/30"}
            >
              <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO IMAGE ── */}
      <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] overflow-hidden">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-[#080810]/20 to-transparent" />
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <main className="w-full px-4 md:px-6 lg:px-8 xl:px-12 pt-8 pb-24 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 -mt-20 md:-mt-32 relative z-10">
        {/* ── LEFT COLUMN: ARTICLE CONTENT (9 COLUMNS) ── */}
        <div className="col-span-1 lg:col-span-8 xl:col-span-9">
          {/* Meta Tags */}
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded bg-[#f5c518] text-[#080810] text-[10px] font-black uppercase tracking-tighter">
              {article.category}
            </span>
            <span className="text-white/30 text-[11px] font-bold uppercase tracking-[2.5px]">
              {article.readTime} • {article.date}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-['Bebas_Neue'] leading-[0.9] md:leading-[0.85] mb-8 md:mb-12 tracking-wide text-white uppercase">
            {article.title}
          </h1>

          {/* Author Widget */}
          <div className="flex items-center gap-4 mb-8 md:mb-12 p-4 md:p-6 rounded-[24px] md:rounded-[32px] bg-[#12121e] border border-white/5 w-full lg:w-fit lg:min-w-[320px] xl:min-w-[380px]">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-[#080810]"
              style={{ background: article.author.gradient }}
            >
              {article.author.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{article.author.name}</div>
              <div className="text-[10px] text-white/30 font-black uppercase tracking-widest">
                {article.author.role}
              </div>
            </div>
            <button
              onClick={() => setFollowing(!following)}
              className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase transition-all border tracking-widest shrink-0 ${following ? "bg-white/10 border-white/10 text-white/60" : "bg-[#f5c518] border-[#f5c518] text-[#080810]"}`}
            >
              {following ? "Following" : "Follow"}
            </button>
          </div>

          {/* Article Body */}
          <article className="max-w-full lg:max-w-[850px] mb-8 md:mb-12">
            {article.body.map((block, i) => {
              if (block.type === "h2")
                return (
                  <h2
                    key={i}
                    className="text-2xl sm:text-3xl md:text-4xl font-['Bebas_Neue'] tracking-widest mt-12 md:mt-16 mb-4 md:mb-6 text-white uppercase"
                  >
                    {block.content}
                  </h2>
                );
              if (block.type === "p")
                return (
                  <p
                    key={i}
                    className="text-white/60 leading-relaxed text-base md:text-[18px] font-light mb-6 md:mb-8"
                  >
                    {block.content}
                  </p>
                );
              if (block.type === "pullquote")
                return (
                  <blockquote
                    key={i}
                    className="my-8 md:my-14 pl-4 md:pl-8 border-l-4 border-[#f5c518] italic text-lg md:text-2xl text-white/90 bg-white/[0.02] py-6 md:py-8 rounded-r-3xl pr-4 md:pr-8"
                  >
                    "{block.content}"
                  </blockquote>
                );
              if (block.type === "moviemention") {
                const m = MOVIES.find((mv) => mv.id === block.movieId);
                if (!m) return null;
                return (
                  <div
                    key={i}
                    onClick={() => setMovieSheetOpen(block.movieId)}
                    className="inline-flex items-center gap-4 p-3 pr-6 my-4 bg-white/[0.03] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.08] transition-all"
                  >
                    <img src={m.image} className="w-10 h-14 object-cover rounded-lg" alt="film" />
                    <div>
                      <div className="text-xs font-bold mb-1">{m.title}</div>
                      <div className="text-[10px] font-black text-[#f5c518] tracking-widest uppercase">
                        ★ {m.rating} • VIEW
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </article>

          {/* ── SCREENSHOT MATCHED QUIZ EMBED ── */}
          <div
            onClick={() => setQuizSheetOpen(true)}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-5 cursor-pointer my-8 md:my-12 group p-4 md:p-6 rounded-[20px] md:rounded-[24px] w-full"
            style={{
              background: "rgba(124, 92, 252, 0.04)",
              border: "1px solid rgba(124, 92, 252, 0.2)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(124, 92, 252, 0.5)";
              e.currentTarget.style.background = "rgba(124, 92, 252, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(124, 92, 252, 0.2)";
              e.currentTarget.style.background = "rgba(124, 92, 252, 0.04)";
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
              style={{
                background: "rgba(124, 92, 252, 0.15)",
                border: "1px solid rgba(124, 92, 252, 0.3)",
              }}
            >
              <Gamepad2 size={24} color="#7c5cfc" />
            </div>
            <div className="flex-1">
              <div className="mb-1 font-bold text-[16px] text-white">
                Quiz: Test Your {article.category} Knowledge
              </div>
              <div className="text-[12px] text-white/40 font-medium tracking-wide">
                8 questions · Takes about 3 minutes · Earn 40 Frolic Points
              </div>
            </div>
            <button
              className="shrink-0 rounded-xl px-5 md:px-7 py-2.5 md:py-3.5 text-[11px] md:text-[12px] font-black uppercase tracking-wider text-white transition-all active:scale-95 shadow-lg shadow-[#7c5cfc]/20 w-full sm:w-auto"
              style={{ background: "#7c5cfc", border: "none", cursor: "pointer" }}
            >
              Take Quiz
            </button>
          </div>

          {/* Community Grid */}
          <section className="max-w-full lg:max-w-[1000px] mt-12 md:mt-20 pt-8 md:pt-12 border-t border-white/5">
            <h3 className="text-2xl md:text-3xl font-['Bebas_Neue'] tracking-widest mb-6 md:mb-10 uppercase text-white">
              Community Buzz
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {RELATED_DISCUSSIONS.map((d, i) => (
                <div
                  key={i}
                  className="p-4 md:p-6 rounded-[20px] md:rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3 md:mb-4">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-[#080810]"
                      style={{ background: d.gradient }}
                    >
                      {d.initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-white/80">{d.user}</span>
                      <span className="text-[10px] text-white/20 font-black uppercase tracking-tighter">
                        {d.time}
                      </span>
                    </div>
                  </div>
                  <p className="text-[13px] text-white/50 leading-relaxed font-light mb-4 italic">
                    "{d.content}"
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-white/20 font-sans">
                    <ThumbsUp size={12} /> {d.upvotes.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── RIGHT COLUMN: SIDEBAR (3 COLUMNS) ── */}
        <aside className="col-span-1 lg:col-span-4 xl:col-span-3">
          <div className="lg:sticky lg:top-40 space-y-6 md:space-y-10">
            {/* Stats Tracking */}
            <div className="p-5 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#12121e] border border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-6 md:mb-8">
                Metrics
              </h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-red-500">
                    <Flame size={16} fill="currentColor" />
                    <span className="text-2xl font-['Bebas_Neue'] tracking-wider leading-none">
                      {article.reactions.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-white/20 uppercase">Reacts</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white/60">
                    <MessageSquare size={16} />
                    <span className="text-2xl font-['Bebas_Neue'] tracking-wider leading-none">
                      {article.comments}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-white/20 uppercase">Comments</span>
                </div>
              </div>
            </div>

            {/* Related Films Sidebar */}
            <div className="p-5 md:p-8 rounded-[24px] md:rounded-[32px] bg-[#12121e] border border-white/5">
              <h4 className="text-lg md:text-xl font-['Bebas_Neue'] tracking-widest text-[#f5c518] uppercase mb-6 md:mb-8">
                Mentioned Films
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 md:gap-4">
                {MOVIES.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="cursor-pointer group"
                    onClick={() => navigate(`/content/movie/${m.id}`)}
                  >
                    <div className="aspect-[2/3] rounded-xl md:rounded-2xl overflow-hidden border border-white/10 mb-2 relative">
                      <img
                        src={m.image}
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                        alt="film"
                      />
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-[#f5c518]">
                        ★ {m.rating}
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-white/60 group-hover:text-white truncate">
                      {m.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* ── MODALS ── */}
      <BottomSheet
        open={!!movieSheetOpen}
        onClose={() => setMovieSheetOpen(null)}
        accentColor={ACCENT}
        title="Film Preview"
      >
        {sheetMovie && (
          <div className="flex flex-col md:flex-row gap-8 p-6">
            <img
              src={sheetMovie.image}
              className="w-full md:w-32 h-48 object-cover rounded-2xl shadow-2xl border border-white/10"
              alt="poster"
            />
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-3xl font-['Bebas_Neue'] mb-1 text-white tracking-widest uppercase">
                {sheetMovie.title}
              </div>
              <div className="text-[#f5c518] text-xl font-bold mb-4 font-['Bebas_Neue']">
                ★ {sheetMovie.rating}
              </div>
              <p className="text-sm text-white/50 leading-relaxed mb-8 font-light italic">
                "{sheetMovie.description}"
              </p>
              <button
                onClick={() => navigate(`/content/movie/${sheetMovie.id}`)}
                className="w-full py-4 bg-[#f5c518] text-[#080810] font-black rounded-2xl text-[11px] uppercase tracking-[3px] active:scale-95 transition-all"
              >
                View Full Page
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      <BottomSheet
        open={quizSheetOpen}
        onClose={() => setQuizSheetOpen(false)}
        accentColor="#7c5cfc"
        title="Knowledge Check"
      >
        <div className="text-center py-10 px-6">
          <div className="text-6xl mb-6">🎯</div>
          <h3 className="text-2xl font-bold mb-2 uppercase font-['Bebas_Neue'] tracking-widest">
            Claim Your Points
          </h3>
          <p className="text-white/40 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
            Answer 8 questions about this article correctly to claimed 40 Frolic Points.
          </p>
          <button className="w-full py-4 bg-[#7c5cfc] rounded-2xl font-black text-white text-xs uppercase tracking-[4px] shadow-xl shadow-[#7c5cfc]/20 active:scale-95 transition-all">
            Start Quiz
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
