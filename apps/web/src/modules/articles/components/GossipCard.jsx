import { useState } from "react";
import { MessageSquare, Share2 } from "lucide-react";
import { HEAT_CONFIG } from "../data/articles";

function GossipCard({ gossip }) {
  const cfg = HEAT_CONFIG[gossip.heatLevel];
  const [reacted, setReacted] = useState(null);

  return (
    <div
      className="group bg-[#12121e] border-r border-t border-b border-white/[0.07] rounded-r-2xl pl-4 pr-6 py-5 transition-all duration-300 hover:bg-[#151525] hover:shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
      style={{ borderLeft: `5px solid ${cfg.accentBorder}` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <span
          className="rounded-md px-2.5 py-1 text-[9px] font-black tracking-widest uppercase"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
        >
          {cfg.label}
        </span>

        {gossip.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-bold text-white/20 uppercase tracking-tighter"
          >
            #{tag}
          </span>
        ))}

        <span className="ml-auto text-[10px] font-bold text-white/10 tracking-widest uppercase">
          {gossip.timeAgo}
        </span>
      </div>

      <h3 className="font-['Outfit'] text-[17px] font-bold text-white mb-2 leading-snug group-hover:text-white transition-colors">
        {gossip.headline}
      </h3>

      <p className="font-['Outfit'] text-sm text-white/40 mb-4 leading-relaxed font-light line-clamp-2">
        {gossip.excerpt}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { key: "fire", emoji: "🔥", count: gossip.reactions.fire },
            { key: "shocked", emoji: "😱", count: gossip.reactions.shocked },
            { key: "heart", emoji: "❤️", count: gossip.reactions.heart },
          ].map(({ key, emoji, count }) => (
            <button
              key={key}
              onClick={() => setReacted(reacted === key ? null : key)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all border ${
                reacted === key
                  ? "bg-white/10 border-white/20"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
              }`}
            >
              <span className="text-base leading-none">{emoji}</span>
              <span
                className={`text-[11px] font-black ${reacted === key ? "text-white" : "text-white/30"}`}
              >
                {((count + (reacted === key ? 1 : 0)) / 1000).toFixed(1)}k
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-white/20">
          <div className="flex items-center gap-1.5">
            <MessageSquare size={14} />
            <span className="text-[11px] font-bold">{gossip.reactions.comments}</span>
          </div>
          <button className="hover:text-white transition-colors">
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
export default GossipCard;
