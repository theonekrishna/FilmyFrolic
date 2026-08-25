import { Flame, MessageSquare, Bookmark } from "lucide-react";
const ACCENT = "#f5c518";
function ArticleListCard({ article, bookmarked, onBookmark, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group flex bg-[#12121e] border border-white/[0.07] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-yellow-400/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] active:scale-[0.99]"
    >
      {/* Content Area */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span
              className="rounded-md px-2.5 py-1 text-[9px] font-black tracking-widest uppercase"
              style={{
                background: `${ACCENT}15`,
                border: `1px solid ${ACCENT}30`,
                color: ACCENT,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {article.category}
            </span>
            <div className="flex items-center gap-3 text-white/20">
              <span className="text-[10px] font-bold font-['Outfit'] uppercase tracking-tighter">
                {article.readTime}
              </span>
            </div>
          </div>

          <h3 className="font-['Outfit'] text-base font-bold text-[#f0f0f8] leading-tight mb-2 group-hover:text-yellow-400 transition-colors line-clamp-2">
            {article.title}
          </h3>

          <p className="font-['Outfit'] text-[13px] text-white/40 font-light leading-relaxed line-clamp-1 mb-4">
            {article.excerpt}
          </p>
        </div>

        {/* Meta Strip */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-[#080810]"
            style={{ background: article.author.gradient }}
          >
            {article.author.initials}
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white/60 leading-none mb-0.5">
              {article.author.name}
            </span>
            <span className="text-[9px] text-white/20 font-medium uppercase tracking-tighter">
              {article.timeAgo}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-red-500/80">
              <Flame size={13} fill="currentColor" />
              <span className="text-[11px] font-bold tracking-tighter">
                {(article.reactions / 1000).toFixed(1)}k
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-white/30">
              <MessageSquare size={13} />
              <span className="text-[11px] font-bold">{article.comments}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark();
              }}
              className="hover:scale-110 transition-transform active:scale-90"
            >
              <Bookmark
                size={14}
                color={bookmarked ? ACCENT : "rgba(240,240,248,0.2)"}
                fill={bookmarked ? ACCENT : "none"}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnail - Wider and more focused */}
      <div className="w-[120px] md:w-[160px] shrink-0 relative overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#12121e] to-transparent" />
      </div>
    </div>
  );
}

export default ArticleListCard;
