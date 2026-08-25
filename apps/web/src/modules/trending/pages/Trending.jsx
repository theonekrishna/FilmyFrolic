import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, TrendingUp, Star, Zap } from "lucide-react";

import { PERIOD_TABS, CAT_TABS } from "../data/trending";
import { MOVIES } from "../../Home/data/movies";
import TopBar from "../../../layout/TopBar";

// Sub-components (Assuming these exist or you'll update them)
import MobileSpotlightCard from "../components/MobileSpotlightCard";
import ChangePill from "../components/ChangePill";
import MobileTrendingRow from "../components/MobileTrendingRow";

const ACCENT = "#f5c518";
const RED = "#e84545";

const TRENDING_RANKED = [...MOVIES]
  .sort((a, b) => b.rating - a.rating)
  .map((m, i) => ({
    ...m,
    rank: i + 1,
    change: ["+2", "—", "+5", "-1", "+3", "+1", "—", "-2", "+4", "-1"][i % 10],
    views: `${((MOVIES.length - i) * 142 + 380).toLocaleString()}K`,
    hot: i < 3,
  }));

export default function Trending() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("week");
  const [category, setCategory] = useState("all");

  // Memoize the ranked list for performance
  const ranked = useMemo(() => {
    return TRENDING_RANKED.filter(
      (m) =>
        category === "all" || m.genre.some((g) => g.toLowerCase().includes(category.toLowerCase()))
    );
  }, [category]);

  const top3 = ranked.slice(0, 3);
  const chart = ranked;

  const goToMovie = (id) => navigate(`/content/movie/${id}`);

  return (
    <div className="min-h-screen bg-[#080810] text-[#f0f0f8] font-['Outfit']">
      {/* ── MOBILE LAYOUT ── */}
      <div className="md:hidden">
        <header className="sticky top-0 z-40 bg-[#080810]/95 backdrop-blur-xl border-b border-white/5 px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-['Bebas_Neue'] text-3xl tracking-wider uppercase">Trending</h1>
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(232,69,69,0.8)]" />
              <span className="text-[10px] font-bold text-red-500 tracking-tighter">LIVE</span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {PERIOD_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setPeriod(t.value)}
                style={{
                  color: period === t.value ? ACCENT : "rgba(240,240,248,0.4)",
                  backgroundColor: period === t.value ? `${ACCENT}15` : "rgba(255,255,255,0.03)",
                  borderColor: period === t.value ? `${ACCENT}40` : "transparent",
                }}
                className="px-4 py-1.5 rounded-full text-[11px] font-semibold border transition-all whitespace-nowrap"
              >
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <main className="px-4 py-4 space-y-8">
          {/* Categories - Horizontal Scroll with fade */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
            {CAT_TABS.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                style={{
                  borderColor: category === c.value ? `${ACCENT}50` : "rgba(255,255,255,0.05)",
                  color: category === c.value ? ACCENT : "inherit",
                }}
                className={`px-4 py-2 rounded-xl text-[12px] whitespace-nowrap border bg-white/[0.02] transition-all active:scale-95`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>

          <section>
            <h3 className="font-['Bebas_Neue'] text-lg tracking-widest text-white/30 mb-4">
              Spotlight
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
              {top3.map((m) => (
                <div key={m.id} className="snap-center min-w-[280px]">
                  <MobileSpotlightCard movie={m} onPress={() => goToMovie(m.id)} />
                </div>
              ))}
            </div>
          </section>

          <section className="pb-24">
            <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
              <TrendingUp size={18} className="text-red-500" />
              <h3 className="font-['Bebas_Neue'] text-xl tracking-wider">Full Chart</h3>
            </div>
            <div className="space-y-1">
              {chart.map((m) => (
                <MobileTrendingRow key={m.id} movie={m} onPress={() => goToMovie(m.id)} />
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden md:block">
        <TopBar title="Trending" subtitle="Real-time global rankings" />
        <div className="max-w-[1400px] mx-auto px-10 py-10">
          <div className="flex items-end justify-between mb-10">
            <div className="space-y-2">
              <h2 className="text-5xl font-['Bebas_Neue'] tracking-tight">Trending Now</h2>
              <p className="text-white/40 text-sm">
                Updated every 15 mins based on global watch data.
              </p>
            </div>
            {/* Period & Category Controls Combined */}
            <div className="flex items-center gap-4 bg-white/[0.02] p-1.5 rounded-2xl border border-white/5">
              {PERIOD_TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setPeriod(t.value)}
                  style={{
                    backgroundColor: period === t.value ? `${ACCENT}` : "transparent",
                    color: period === t.value ? "#080810" : "rgba(255,255,255,0.4)",
                  }}
                  className="px-6 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-10">
            {/* Left: Top 3 Cards */}
            <div className="col-span-12 xl:col-span-4 space-y-6">
              <h3 className="text-2xl font-['Bebas_Neue'] text-yellow-500 flex items-center gap-2">
                <Flame size={20} fill={ACCENT} /> The Spotlight
              </h3>
              <div className="space-y-4">
                {top3.map((m, i) => (
                  <div
                    key={m.id}
                    onClick={() => goToMovie(m.id)}
                    className="group relative h-48 rounded-3xl overflow-hidden cursor-pointer border border-white/5 hover:border-yellow-500/50 transition-all"
                  >
                    <img
                      src={m.image}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#080810] via-transparent to-transparent" />
                    <div className="relative h-full p-6 flex flex-col justify-between">
                      <span className="text-5xl font-['Bebas_Neue'] text-white/10 group-hover:text-yellow-500/20 transition-colors">
                        #{i + 1}
                      </span>
                      <div>
                        <h4 className="text-xl font-bold">{m.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <Star size={12} fill={ACCENT} color={ACCENT} /> {m.rating} • {m.views}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Full List */}
            <div className="col-span-12 xl:col-span-8">
              <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                  <span className="font-['Bebas_Neue'] tracking-widest text-white/20">
                    Ranked Chart
                  </span>
                  <div className="flex gap-2">
                    {["All", "Action", "Sci-Fi"].map((c) => (
                      <button
                        key={c}
                        className="px-4 py-1 text-[10px] rounded-full border border-white/10 text-white/40 hover:text-white transition-colors"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="divide-y divide-white/5">
                  {chart.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => goToMovie(m.id)}
                      className="group flex items-center p-6 hover:bg-white/[0.03] transition-all cursor-pointer"
                    >
                      <span
                        className={`w-12 text-3xl font-['Bebas_Neue'] ${m.rank <= 3 ? "text-yellow-500" : "text-white/10"}`}
                      >
                        {m.rank}
                      </span>
                      <div className="w-16 h-20 rounded-xl overflow-hidden mr-6 shadow-xl">
                        <img src={m.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-lg group-hover:text-yellow-500 transition-colors">
                          {m.title}
                        </h5>
                        <p className="text-xs text-white/30">{m.genre.join(", ")}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold">{m.views}</div>
                        <div className="text-[10px] text-white/20 uppercase tracking-tighter">
                          Views
                        </div>
                      </div>
                      <button className="ml-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <Zap size={16} fill={ACCENT} color={ACCENT} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
    </div>
  );
}
