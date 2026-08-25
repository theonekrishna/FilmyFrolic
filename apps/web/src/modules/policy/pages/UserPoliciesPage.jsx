/**
 * UserPoliciesPage — Full policy viewer.
 *
 * Flow: GET /public/all → full list with icon, color, description, sections[]
 * Selecting a policy switches the displayed data from already-loaded state.
 */
import { PolicyIcon } from "../utils/policyIcons";
import { useState, useEffect, useCallback } from "react";
import TopBar from "../../../layout/TopBar";
import { policyService } from "../services/policyService";
// import PolicySidebar from "../components/PolicySidebar";
import PolicyHero from "../components/PolicyHero";
import PolicySectionList from "../components/PolicySectionList";
import { AlertCircle, RefreshCw } from "lucide-react";

const MAX_WIDTH = "max-w-[1440px]";
const PAD = "px-3 md:px-6 lg:px-8";

// ── Skeletons ─────────────────────────────────────────────────────────────────
// function SidebarSkeleton() {
//   return (
//     <div className="flex flex-col gap-1.5 p-3">
//       {[80, 65, 90, 70].map((w, i) => (
//         <div key={i} className="flex items-center gap-3 px-3 py-2.5">
//           <div className="w-8 h-8 rounded-lg animate-pulse flex-shrink-0"
//             style={{ background: "rgba(255,255,255,0.07)" }} />
//           <div className="h-3 rounded-full animate-pulse"
//             style={{ width: `${w}%`, background: "rgba(255,255,255,0.06)" }} />
//         </div>
//       ))}
//     </div>
//   );
// }

function ContentSkeleton() {
  return (
    <div className="space-y-2.5 animate-pulse">
      {/* Hero */}
      <div className="h-32 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)" }} />
      {/* Sections */}
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={n}
          className="h-12 rounded-xl"
          style={{ background: "rgba(255,255,255,0.035)", animationDelay: `${n * 60}ms` }}
        />
      ))}
    </div>
  );
}

// ── Error banner ──────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(232,69,69,0.1)", border: "1px solid rgba(232,69,69,0.2)" }}
      >
        <AlertCircle size={22} color="#e84545" />
      </div>
      <div className="text-center space-y-1">
        <p className="font-['Outfit'] text-sm font-semibold text-white/60">
          Failed to load policies
        </p>
        <p className="font-['Outfit'] text-xs text-white/30 max-w-xs">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 rounded-full font-['Outfit'] text-xs font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95"
        style={{
          background: "rgba(124,92,252,0.1)",
          border: "1px solid rgba(124,92,252,0.3)",
          color: "#7c5cfc",
        }}
      >
        <RefreshCw size={11} /> Try again
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function UserPoliciesPage() {
  const [allPolicies, setAllPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSlug, setActiveSlug] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await policyService.getAllPolicies();
      const list = (Array.isArray(data) ? data : []).filter((p) => p.is_active !== false);
      setAllPolicies(list);
      if (list.length > 0) setActiveSlug((prev) => prev ?? list[0].slug);
    } catch (err) {
      setError(err.message || "Could not load policies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const activePolicy = allPolicies.find((p) => p.slug === activeSlug) ?? null;

  return (
    <div className="min-h-screen bg-[#080810] text-[#f0f0f8] overflow-x-hidden selection:bg-purple-500/30">
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .ff-no-scrollbar::-webkit-scrollbar { display: none; }
        .ff-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .policy-fade { animation: fadeSlide 0.22s ease forwards; }
      `}</style>

      {/* coomenting top bar , we dont required this in policies now because we moved it into inside settings */}
      {/* <TopBar title="Policies" subtitle="Terms, privacy & community guidelines" /> */}

      <main className={`${PAD} pt-5 pb-24 mx-auto w-full ${MAX_WIDTH}`}>
        {/* Error */}
        {error && !loading && <ErrorState message={error} onRetry={fetchAll} />}

        {/* Loading */}
        {loading && (
          <div className="md:flex md:gap-5 lg:gap-7">
            {/* Sidebar skeleton */}
            {/* <div className="hidden md:block w-[230px] lg:w-[250px] flex-shrink-0">
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="px-4 pt-4 pb-1">
                  <div className="h-2.5 w-20 rounded animate-pulse"
                    style={{ background: "rgba(255,255,255,0.07)" }} />
                </div>
                <SidebarSkeleton />
              </div>
            </div> */}
            <div className="flex-1">
              <ContentSkeleton />
            </div>
          </div>
        )}

        {/* Main content */}
        {!error && !loading && (
          <>
            {/* Mobile tabs */}
            {/* <div className="mb-4 md:hidden">
              <PolicySidebar policies={allPolicies} activeSlug={activeSlug} onSelect={setActiveSlug} />
            </div> */}

            <div className="md:flex md:gap-5 lg:gap-7">
              {/* Desktop sidebar */}
              {/* <aside className="hidden md:block w-[230px] lg:w-[250px] flex-shrink-0">
                <div
                  className="sticky top-5 rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.022)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(12px)",
                  }}
                > */}
              {/* Sidebar header */}
              {/* <div className="px-4 pt-4 pb-2">
                    <p className="font-['Outfit'] text-[10px] font-bold uppercase tracking-[0.12em] text-white/25">
                      Legal Documents
                    </p>
                  </div> */}

              {/* <PolicySidebar
                    policies={allPolicies}
                    activeSlug={activeSlug}
                    onSelect={setActiveSlug}
                    loading={false}
                  /> */}

              {/* Sidebar footer */}
              {/* <div
                    className="px-4 py-3 mt-1"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <p className="font-['Outfit'] text-[10px] text-white/20 leading-relaxed">
                      {allPolicies.length} polic{allPolicies.length !== 1 ? "ies" : "y"} · All active
                    </p>
                  </div>
                </div>
              </aside> */}

              {/* Detail panel */}
              <section className="flex-1 min-w-0">
                {/* Policy Selector Cards */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {allPolicies.map((policy) => {
                    const isActive = policy.slug === activeSlug;
                    const color = policy.color || "#7c5cfc";

                    return (
                      <button
                        key={policy.slug}
                        onClick={() => setActiveSlug(policy.slug)}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all cursor-pointer"
                        style={{
                          background: isActive ? `${color}18` : "rgba(255,255,255,0.04)",
                          border: `1px solid ${isActive ? `${color}50` : "rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: isActive ? `${color}22` : "rgba(255,255,255,0.05)",
                            border: `1px solid ${
                              isActive ? `${color}40` : "rgba(255,255,255,0.08)"
                            }`,
                          }}
                        >
                          <PolicyIcon
                            name={policy.icon}
                            size={14}
                            color={isActive ? color : "rgba(255,255,255,0.35)"}
                          />
                        </span>

                        <span
                          style={{
                            color: isActive ? "#f0f0f8" : "rgba(240,240,248,0.6)",
                            fontWeight: isActive ? 600 : 400,
                          }}
                        >
                          {policy.title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Policy Content */}
                {activePolicy ? (
                  <div key={activePolicy.slug} className="policy-fade">
                    <PolicyHero policy={activePolicy} />
                    <PolicySectionList
                      sections={activePolicy.sections ?? []}
                      accentColor={activePolicy.color || "#7c5cfc"}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-white/25 font-['Outfit'] text-sm">
                    <div className="text-4xl mb-3">📄</div>
                    Select a policy from the sidebar.
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
