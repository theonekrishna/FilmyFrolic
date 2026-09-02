import {
  Check,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "../../../context/AuthContext";
import BottomSheet from "../../../shared/BottomSheet";
import EmptyState from "../../../shared/EmptyState";
import TopBar from "../../../layout/TopBar";
import AuthPromptModal from "../components/Authpromptmoda";
import DesktopCommunityCard from "../components/DesktopCommunityCard";
import MobileCommunityCard from "../components/MobileCommunityCard";
import Toast from "../components/Toast";
import { useToast } from "../hooks/useToast";
import { FILTER_TABS } from "../data/communities";
import { getAllRooms } from "../../Feed/services/feedService";
import {
  deleteCommunity,
  getAllCommunities,
  getUserActivity,
  toggleCommunityMembership,
} from "../services/communityService";

// Lazy-load heavy modals so they don't bloat the initial bundle
const CommunityDetailView = lazy(() => import("../components/CommunityDetailView"));
const CreateCommunityModal = lazy(() => import("../components/CreateCommunityModal"));

const ACCENT = "#3b82f6";

export default function Communities() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [joinedMap, setJoinedMap] = useState({});
  const [joiningSet, setJoiningSet] = useState(new Set());
  const [liveSheetOpen, setLiveSheetOpen] = useState(false);
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [allCommunities, setAllCommunities] = useState([]);
  const [detailCommunity, setDetailCommunity] = useState(null);

  // Locked suggested list — set once on first data load, never reshuffled
  const suggestedListRef = useRef([]);

  // ── Auth prompt state ────────────────────────────────────────────────────
  const [authPrompt, setAuthPrompt] = useState({ open: false, message: "" });

  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  const isLoggedIn = !!user && !!localStorage.getItem("accessToken");

  // Central auth gate — same pattern as Rooms
  const requireAuth = useCallback(
    function requireAuth(message, action) {
      if (!isLoggedIn) {
        setAuthPrompt({ open: true, message });
        return false;
      }
      action?.();
      return true;
    },
    [isLoggedIn]
  );

  // Helper to open community detail (Public read allowed for guests)
  const openCommunityDetail = useCallback(function openCommunityDetail(community) {
    setDetailCommunity(community);
  }, []);

  const [userActivity, setUserActivity] = useState({
    communitiesJoined: 0,
    postsCount: 0,
    upvotesEarned: 0,
  });
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live rooms state
  const [liveRooms, setLiveRooms] = useState([]);

  // Fetch live rooms — shuffle order is stable for 2 hours via sessionStorage
  useEffect(() => {
    const CACHE_KEY = "ff_live_rooms_cache";
    const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

    function loadCachedOrder(allRooms) {
      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (raw) {
          const { ids, ts } = JSON.parse(raw);
          const age = Date.now() - ts;
          if (age < CACHE_TTL_MS && Array.isArray(ids)) {
            // Reconstruct ordered list from cached id order
            const roomMap = Object.fromEntries(allRooms.map((r) => [r.id, r]));
            const ordered = ids.map((id) => roomMap[id]).filter(Boolean);
            // Append any new rooms not in cache at the end
            const cached = new Set(ids);
            allRooms.forEach((r) => {
              if (!cached.has(r.id)) ordered.push(r);
            });
            return ordered.slice(0, 4);
          }
        }
      } catch (_) {}
      return null;
    }

    function saveOrder(rooms) {
      try {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            ids: rooms.map((r) => r.id),
            ts: Date.now(),
          })
        );
      } catch (_) {}
    }

    async function fetchRooms() {
      try {
        const result = await getAllRooms();
        const roomsData = result?.data || result || [];

        // Try to restore the stable cached order
        const cached = loadCachedOrder(roomsData);
        if (cached) {
          setLiveRooms(cached);
          return;
        }

        // No valid cache — generate a new shuffle and save it
        const shuffled = [...roomsData].sort(() => 0.5 - Math.random());
        const sliced = shuffled.slice(0, 4);
        saveOrder(sliced);
        setLiveRooms(sliced);
      } catch (err) {
        setLiveRooms([]);
      }
    }
    fetchRooms();
    // Still poll for fresh data (counts/titles), but order stays stable
    const interval = setInterval(fetchRooms, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchCommunities() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAllCommunities();
        const communities = Array.isArray(data) ? data : [];

        const mapped = communities.map((c) => ({
          id: c.id,
          name: c.name || "Unnamed Community",
          description: c.description || "No description available.",
          banner:
            c.banner_url ||
            "https://images.unsplash.com/photo-1561722798-9a732d141027?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
          avatarEmoji: c.avatar_emoji || "🎬",
          avatarGradient: c.avatar_gradient || "linear-gradient(135deg, #3b82f6, #9b59b6)",
          members: c.members_count?.[0]?.count?.toString() || "0",
          postsToday: 0,
          genres: c.genres || [],
          joined: !!c.is_joined,
          category: c.category || (c.genres && c.genres[0]) || "General",
          isTrending: !!c.is_trending,
          isCreator: !!c.is_creator,
        }));

        setAllCommunities(mapped);

        const jm = {};
        mapped.forEach((c) => {
          jm[c.id] = c.joined === true;
        });
        setJoinedMap(jm);

        // Lock the suggested list once on first data load.
        // Only pick communities that are NOT already joined by the user.
        if (suggestedListRef.current.length === 0) {
          const unjoined = mapped
            .filter((c) => !jm[c.id])
            .sort((a, b) => a.id.localeCompare(b.id))
            .slice(0, 3);
          suggestedListRef.current = unjoined;
        }
      } catch (err) {
        console.error("Error fetching communities:", err);
        setError("Failed to load communities. Please try again later.");
        setAllCommunities([]);
        setJoinedMap({});
      } finally {
        setIsLoading(false);
      }
    }

    fetchCommunities();
    // Reset suggested list whenever user changes (login/logout/switch)
    suggestedListRef.current = [];
  }, [user?.id]);

  useEffect(() => {
    async function fetchUserActivity() {
      if (!user?.id) return;
      setIsLoadingActivity(true);
      try {
        const data = await getUserActivity(user.id);
        if (data) {
          setUserActivity(data);
        }
      } catch (err) {
        console.error("Error fetching user activity:", err);
      } finally {
        setIsLoadingActivity(false);
      }
    }

    fetchUserActivity();
  }, [user?.id]);

  async function toggleJoin(id) {
    // Gate behind auth
    if (!requireAuth("Sign in to join communities and connect with fellow film lovers!", undefined))
      return;

    if (joiningSet.has(id)) return;

    const isDeparting = joinedMap[id];

    setJoiningSet((prev) => new Set([...prev, id]));

    setJoinedMap((prev) => ({ ...prev, [id]: !prev[id] }));
    const delta = isDeparting ? -1 : 1;
    const updateCount = (c) => {
      if (c.id !== id) return c;
      const n = Math.max(0, (parseInt(c.members) || 0) + delta);
      return { ...c, members: String(n) };
    };
    setAllCommunities((prev) => prev.map(updateCount));
    setDetailCommunity((prev) => (prev?.id === id ? updateCount(prev) : prev));

    try {
      await toggleCommunityMembership(id, isDeparting);
      const communityName = allCommunities.find((c) => c.id === id)?.name || "Community";
      if (isDeparting) {
        showToast(`Left ${communityName}`, "info");
      } else {
        showToast(`Joined ${communityName}!`, "success");
      }
      if (isDeparting && activeTab === "mine") {
        const remainingJoined = Object.values({
          ...joinedMap,
          [id]: false,
        }).filter(Boolean).length;
        if (remainingJoined === 0) {
          setActiveTab("all");
        }
      }
    } catch (err) {
      console.error("Error toggling join status:", err);
      setJoinedMap((prev) => ({ ...prev, [id]: isDeparting }));
      const revert = (c) => {
        if (c.id !== id) return c;
        const n = Math.max(0, (parseInt(c.members) || 0) - delta);
        return { ...c, members: String(n) };
      };
      setAllCommunities((prev) => prev.map(revert));
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update community status.";
      showToast(errorMsg, "error");
    } finally {
      setJoiningSet((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  const filtered = useMemo(() => {
    return allCommunities.filter((c) => {
      const matchTab =
        activeTab === "mine"
          ? joinedMap[c.id]
          : activeTab === "trending"
            ? c.isTrending
            : activeTab === "new"
              ? c.isNew
              : true;
      const matchSearch =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [allCommunities, activeTab, joinedMap, searchQuery]);

  const myCount = useMemo(() => {
    return allCommunities.filter((c) => joinedMap[c.id]).length;
  }, [allCommunities, joinedMap]);

  const handleCreateCommunity = useCallback(function handleCreateCommunity(c) {
    setAllCommunities((prev) => [c, ...prev]);
    setJoinedMap((prev) => ({ ...prev, [c.id]: true }));
  }, []);

  const handleDeleteCommunity = useCallback(
    async function handleDeleteCommunity(id) {
      try {
        const communityName = allCommunities.find((c) => c.id === id)?.name || "Community";
        await deleteCommunity(id);
        setAllCommunities((prev) => prev.filter((c) => c.id !== id));
        setDetailCommunity(null);
        showToast(`"${communityName}" deleted`, "info");
      } catch (err) {
        console.error("Error deleting community:", err);
        showToast(err.message || "Failed to delete community.", "error");
      }
    },
    [allCommunities, showToast]
  );

  const featuredCommunity = allCommunities[0];

  return (
    <>
      {/* ── Auth Prompt Modal (same as Rooms) ─────────────────────────────── */}
      <AuthPromptModal
        isOpen={authPrompt.open}
        onClose={() => setAuthPrompt({ open: false, message: "" })}
        message={authPrompt.message}
      />

      {/* Modals — wrapped in Suspense since they are lazy-loaded */}
      {createSheetOpen && (
        <Suspense fallback={null}>
          <CreateCommunityModal
            onClose={() => setCreateSheetOpen(false)}
            onCreate={handleCreateCommunity}
          />
        </Suspense>
      )}
      {detailCommunity && (
        <Suspense fallback={null}>
          <CommunityDetailView
            community={detailCommunity}
            joined={joinedMap[detailCommunity.id] ?? false}
            isJoining={joiningSet.has(detailCommunity.id)}
            onBack={() => setDetailCommunity(null)}
            onToggleJoin={() => toggleJoin(detailCommunity.id)}
            onDelete={handleDeleteCommunity}
          />
        </Suspense>
      )}

      {/* ── MOBILE LAYOUT (≤768px) ─────────────────────────────────────────── */}
      <div className="ff-sc-mobile min-h-screen bg-[#080810]">
        {/* TOP BAR */}
        <TopBar title="Communities" subtitle="Find your fandom" />

        {/* FILTER TABS */}
        <div className="ff-hscroll flex gap-1.5 px-4 pt-2.5 pb-2 shrink-0 overflow-x-auto [scrollbar-width:none]">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`h-7 px-3 rounded-full border-[1.5px] font-[Outfit] text-[10px] font-medium cursor-pointer shrink-0 whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "border-[#3b82f6]/[0.44] bg-[#3b82f6]/10 text-[#3b82f6] font-bold"
                    : "border-white/[0.09] bg-white/[0.04] text-[rgba(240,240,248,0.55)]"
                }`}
              >
                {tab.value === "mine" ? `Mine${myCount > 0 ? ` (${myCount})` : ""}` : tab.label}
              </button>
            );
          })}
        </div>

        {/* SEARCH BAR */}
        <div className="px-4 pb-3">
          <div
            className={`flex items-center gap-2 h-10 rounded-xl px-3 transition-all duration-200 ${
              searchFocused
                ? "bg-[rgba(59,130,246,0.06)] border-[1.5px] border-[#3b82f6]/[0.33] shadow-[0_0_0_3px_rgba(59,130,246,0.07)]"
                : "bg-white/[0.04] border-[1.5px] border-white/[0.09]"
            }`}
          >
            <Search
              size={14}
              className={`shrink-0 transition-colors duration-200 ${
                searchFocused ? "text-[#3b82f6]" : "text-[rgba(240,240,248,0.3)]"
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Find your fandom..."
              autoComplete="off"
              className="flex-1 bg-transparent border-none outline-none font-[Outfit] text-[13px] text-[#f0f0f8] caret-[#3b82f6] min-w-0"
            />
            {searchQuery && (
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearchQuery("");
                }}
                className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-white/[0.08] border-none cursor-pointer p-0 shrink-0"
              >
                <X size={11} color="rgba(240,240,248,0.6)" />
              </button>
            )}
          </div>
        </div>

        {/* Create button (mobile) — requires auth */}
        {!isLoggedIn && (
          <div className="px-4 pb-3">
            <button
              onClick={() =>
                requireAuth("Sign in to create your own community and build your fandom!", () =>
                  setCreateSheetOpen(true)
                )
              }
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-[#3b82f6] border-none font-[Outfit] text-[13px] font-bold text-white cursor-pointer shadow-[0_4px_16px_rgba(59,130,246,0.27)]"
            >
              <Plus size={14} color="#fff" />
              Create Community
            </button>
          </div>
        )}

        {/* FEATURED COMMUNITY */}
        {activeTab === "all" && !searchQuery && featuredCommunity && (
          <div className="px-4 pb-3.5">
            <div
              onClick={() => openCommunityDetail(featuredCommunity)}
              className="relative h-[180px] rounded-2xl overflow-hidden cursor-pointer border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            >
              <img
                src={featuredCommunity.banner}
                alt={featuredCommunity.name}
                className="w-full h-full object-cover [object-position:center_40%]"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,16,0.95)] via-[rgba(8,8,16,0.5)]/[0.45] to-transparent" />
              <div className="absolute top-2.5 left-3 bg-[#3b82f6] rounded-md px-2.5 py-[3px] font-[Outfit] text-[9px] font-extrabold text-white tracking-wider uppercase">
                ⭐ Featured
              </div>

              <div className="absolute bottom-0 left-0 right-0 px-3.5 py-3 flex items-center gap-2.5">
                <div
                  className="w-11 h-11 rounded-[11px] flex items-center justify-center text-xl border-2 border-white/[0.15] shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                  style={{ background: featuredCommunity.avatarGradient }}
                >
                  {featuredCommunity.avatarEmoji}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-[Bebas_Neue] text-2xl tracking-[1.5px] text-[#f0f0f8] mb-0.5 leading-none truncate [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]">
                    {featuredCommunity.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="font-[Outfit] text-[11px] text-[rgba(240,240,248,0.7)] flex items-center gap-[3px]">
                      <Users size={10} color="rgba(240,240,248,0.7)" />
                      {featuredCommunity.members} members
                    </span>
                    <span className="bg-[#3b82f6]/[0.15] border border-[#3b82f6]/[0.31] rounded-full px-2 py-px font-[Outfit] text-[9px] font-bold text-[#3b82f6]">
                      {featuredCommunity.category}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleJoin(featuredCommunity.id);
                  }}
                  disabled={joiningSet.has(featuredCommunity.id)}
                  className={`flex items-center gap-[5px] h-[34px] px-3.5 rounded-lg font-[Outfit] text-xs font-bold shrink-0 whitespace-nowrap transition-all duration-200 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                    joinedMap[featuredCommunity.id]
                      ? "bg-transparent text-[#3b82f6] border-[1.5px] border-[#3b82f6]"
                      : "bg-[#3b82f6] text-white border-[1.5px] border-[#3b82f6]"
                  }`}
                >
                  {joiningSet.has(featuredCommunity.id) ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : joinedMap[featuredCommunity.id] ? (
                    <>
                      <Check size={12} strokeWidth={2.5} /> Joined
                    </>
                  ) : (
                    "Join"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIVE INDICATOR PILL */}
        {activeTab !== "mine" && (
          <div style={{ padding: "0 16px 12px" }}>
            <button
              onClick={() => setLiveSheetOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                height: 32,
                padding: "0 14px",
                borderRadius: 100,
                background: `${ACCENT}18`,
                border: `1.5px solid ${ACCENT}45`,
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: ACCENT,
                cursor: "pointer",
                minHeight: "unset",
                transition: "background 0.15s",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#e84545",
                  boxShadow: "0 0 6px #e84545",
                  animation: "ff-pulse 1.5s infinite",
                  flexShrink: 0,
                }}
              />
              🔴 {liveRooms.length} rooms live
              <ChevronRight size={13} color={ACCENT} />
            </button>
          </div>
        )}

        {/* COMMUNITY CARDS LIST */}
        <div style={{ paddingBottom: 80 }}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/50">
              <Loader2 size={28} className="animate-spin text-[#3b82f6]" strokeWidth={2.5} />
              <span className="font-[Outfit] text-[14px]">Fetching communities...</span>
            </div>
          ) : error ? (
            <div className="px-5 py-10">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-center">
                <p className="text-red-500 font-[Outfit] text-[14px] mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-500 text-white font-[Outfit] text-[12px] font-bold px-5 py-2 rounded-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              module="social"
              icon="🏘️"
              heading="Find communities you'll love"
              body={
                activeTab === "mine"
                  ? "You haven't joined any communities yet. Browse all and find your fandom!"
                  : "No communities match your search. Try a different term."
              }
              cta="Browse All"
              onCta={() => {
                setActiveTab("all");
                setSearchQuery("");
              }}
            />
          ) : (
            filtered.map((community) => (
              <div key={community.id} onClick={() => openCommunityDetail(community)}>
                <MobileCommunityCard
                  community={community}
                  joined={joinedMap[community.id]}
                  isJoining={joiningSet.has(community.id)}
                  onToggleJoin={(e) => {
                    e?.stopPropagation?.();
                    toggleJoin(community.id);
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (≥769px) ────────────────────────────────────────── */}
      <div className="ff-sc-desktop min-h-screen bg-[#080810]">
        {/* TOP BAR */}
        <TopBar title="Communities" subtitle="Find your fandom" />

        <div className="flex gap-6 px-7 py-7 pb-16 items-start">
          {/* Main column */}
          <div className="flex-1 min-w-0">
            {/* Desktop Control Sub-Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-[#12121e] border border-white/10 rounded-2xl p-3 px-4">
              {/* Filter tabs */}
              <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`rounded-xl px-4 py-1.5 font-['Outfit'] text-[13px] font-medium cursor-pointer transition-all duration-200 whitespace-nowrap shrink-0 ${
                      activeTab === tab.value
                        ? "bg-[#3b82f6] text-white shadow-md shadow-blue-500/20 font-semibold"
                        : "text-[#f0f0f8]/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Create Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    requireAuth("Sign in to create your own community and build your fandom!", () =>
                      setCreateSheetOpen(true)
                    )
                  }
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl px-4 py-2 cursor-pointer font-['Outfit'] text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <Plus size={14} /> Create Community
                </button>
              </div>
            </div>

            {/* Featured banner */}
            {featuredCommunity && (
              <div
                onClick={() => openCommunityDetail(featuredCommunity)}
                style={{
                  position: "relative",
                  height: 200,
                  borderRadius: 14,
                  overflow: "hidden",
                  marginBottom: 28,
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <img
                  src={featuredCommunity.banner}
                  alt={featuredCommunity.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                  decoding="async"
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(8,8,16,0.92) 0%, rgba(8,8,16,0.3) 60%, transparent 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 16,
                    left: 20,
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: featuredCommunity.avatarGradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    border: "2px solid rgba(255,255,255,0.2)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                  }}
                >
                  {featuredCommunity.avatarEmoji}
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 16,
                    left: 90,
                    right: 110,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      fontSize: 28,
                      letterSpacing: 2,
                      color: "#f0f0f8",
                      margin: "0 0 4px",
                      lineHeight: 1,
                    }}
                  >
                    {featuredCommunity.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 12,
                        color: "rgba(240,240,248,0.65)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Users size={12} /> {featuredCommunity.members} members
                    </span>
                    <span className="bg-[#3b82f6]/[0.13] border border-[#3b82f6]/[0.31] rounded-full px-2.5 py-0.5 font-[Outfit] text-[11px] font-semibold text-[#3b82f6]">
                      {featuredCommunity.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleJoin(featuredCommunity.id);
                  }}
                  disabled={joiningSet.has(featuredCommunity.id)}
                  className={`absolute bottom-5 right-5 rounded-lg px-5 py-2 font-[Outfit] text-[13px] font-bold transition-all duration-200 flex items-center gap-1.5 border disabled:opacity-50 disabled:cursor-not-allowed ${
                    joinedMap[featuredCommunity.id]
                      ? "bg-transparent text-[#3b82f6] border-[#3b82f6]"
                      : "bg-[#3b82f6] text-white border-[#3b82f6]"
                  }`}
                >
                  {joiningSet.has(featuredCommunity.id) ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : joinedMap[featuredCommunity.id] ? (
                    <>
                      <Check size={13} /> Joined
                    </>
                  ) : (
                    "Join"
                  )}
                </button>
                <div className="absolute top-3.5 left-3.5 bg-[#3b82f6]/[0.13] border border-[#3b82f6]/[0.31] rounded-full px-3 py-1 font-[Outfit] text-[10px] font-bold text-[#3b82f6] tracking-wider">
                  ⭐ FEATURED
                </div>
              </div>
            )}

            {/* Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-3 text-white/50">
                <Loader2 size={32} className="animate-spin text-[#3b82f6]" strokeWidth={2.5} />
                <span className="font-[Outfit] text-[15px]">Syncing communities...</span>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center max-w-md mx-auto">
                <p className="text-red-500 font-[Outfit] text-[15px] mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-500 text-white font-[Outfit] text-[13px] font-bold px-6 py-2.5 rounded-lg transition-transform hover:scale-[1.02]"
                >
                  Retry Connection
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 px-6 text-[rgba(240,240,248,0.35)] font-[Outfit] text-sm">
                No communities found.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filtered.map((community) => (
                  <div
                    key={community.id}
                    onClick={() => openCommunityDetail(community)}
                    className="cursor-pointer"
                  >
                    <DesktopCommunityCard
                      community={community}
                      joined={joinedMap[community.id]}
                      isJoining={joiningSet.has(community.id)}
                      onToggleJoin={() => toggleJoin(community.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="w-[260px] shrink-0 flex flex-col gap-4">
            {/* Suggested — locked list set on first data load, never reshuffles */}
            {(() => {
              // Use the ref that was populated once when communities first loaded.
              // This means joining a community does NOT remove it from the list —
              // only the button state changes (Join → Joined).
              const suggestedCommunities = suggestedListRef.current;

              if (suggestedCommunities.length === 0) return null;

              return (
                <div className="bg-[#12121e] border border-white/[0.07] rounded-xl p-[18px]">
                  <h4 className="font-[Bebas_Neue] text-[17px] tracking-[1.5px] text-[#f0f0f8] mb-3.5">
                    Suggested for You
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {suggestedCommunities.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-2.5 cursor-pointer"
                        onClick={() => openCommunityDetail(s)}
                      >
                        <div
                          className="w-10 h-10 rounded-[10px] shrink-0 flex items-center justify-center text-lg"
                          style={{
                            background:
                              s.avatarGradient ||
                              s.gradient ||
                              "linear-gradient(135deg, #3b82f6, #9b59b6)",
                          }}
                        >
                          {s.avatarEmoji || s.emoji || "🎬"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-[Outfit] text-[13px] font-semibold text-[#f0f0f8] truncate">
                            {s.name}
                          </div>
                          <div className="font-[Outfit] text-[11px] text-[rgba(240,240,248,0.35)] flex items-center gap-[3px]">
                            <Users size={10} /> {s.members}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleJoin(s.id);
                          }}
                          disabled={joiningSet.has(s.id)}
                          className={`rounded-md px-3 py-[5px] font-[Outfit] text-[11px] font-bold cursor-pointer shrink-0 disabled:opacity-50 transition-all duration-200 border ${
                            joinedMap[s.id]
                              ? "bg-transparent text-[#3b82f6] border-[#3b82f6]"
                              : "bg-[#3b82f6]/[0.09] border-[#3b82f6]/[0.25] text-[#3b82f6]"
                          }`}
                        >
                          {joiningSet.has(s.id) ? (
                            <Loader2 size={10} className="animate-spin inline" />
                          ) : joinedMap[s.id] ? (
                            <>
                              <Check size={10} className="inline" /> Joined
                            </>
                          ) : (
                            "Join"
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Live Rooms */}
            {liveRooms.length > 0 && (
              <div className="bg-[#12121e] border border-white/[0.07] rounded-xl p-[18px]">
                <div className="flex items-center gap-1.5 mb-3.5">
                  <div className="w-[7px] h-[7px] rounded-full bg-[#e84545] shadow-[0_0_6px_#e84545] animate-[ff-pulse_1.5s_infinite]" />
                  <h4 className="font-[Bebas_Neue] text-[17px] tracking-[1.5px] text-[#f0f0f8] m-0">
                    Live Rooms
                  </h4>
                </div>
                <div className="flex flex-col gap-2">
                  {liveRooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.05]"
                    >
                      <span className="font-[Outfit] text-xs text-[rgba(240,240,248,0.75)] flex-1 truncate">
                        {room.title || "Untitled Room"}
                      </span>
                      <span className="font-[Outfit] text-[11px] text-[rgba(240,240,248,0.35)] shrink-0">
                        👁 {room.participant_count || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity stats — logged-in only */}
            {isLoggedIn && (
              <div
                className="rounded-xl p-[18px] border border-[#3b82f6]/[0.13]"
                style={{
                  background: `linear-gradient(135deg, rgba(59,130,246,0.06), rgba(155,89,182,0.06))`,
                }}
              >
                <h4 className="font-[Bebas_Neue] text-[17px] tracking-[1.5px] text-[#f0f0f8] mb-3.5">
                  Your Activity
                </h4>
                {[
                  {
                    icon: Users,
                    label: "Communities",
                    value: `${isLoadingActivity ? "..." : userActivity.communitiesJoined} joined`,
                  },
                  {
                    icon: FileText,
                    label: "Posts",
                    value: `${isLoadingActivity ? "..." : userActivity.postsCount} total`,
                  },
                  {
                    icon: TrendingUp,
                    label: "Upvotes earned",
                    value: `${isLoadingActivity ? "..." : userActivity.upvotesEarned.toLocaleString()}`,
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5 mb-2.5">
                    <item.icon size={14} color={ACCENT} />
                    <span className="font-[Outfit] text-xs text-[rgba(240,240,248,0.45)] flex-1">
                      {item.label}
                    </span>
                    <span className="font-[Outfit] text-xs font-bold text-[#f0f0f8]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Sign-in prompt card for guests */}
            {!isLoggedIn && (
              <div
                className="rounded-xl p-[18px] border border-[#3b82f6]/[0.2]"
                style={{
                  background: `linear-gradient(135deg, rgba(59,130,246,0.08), rgba(124,92,252,0.05))`,
                }}
              >
                <div className="text-[28px] mb-[10px]">🏘️</div>
                <h4 className="font-[Bebas_Neue] text-[18px] tracking-[1.5px] text-[#f0f0f8] mb-[8px]">
                  Join the Community
                </h4>
                <p className="font-[Outfit] text-[12px] text-[rgba(240,240,248,0.45)] mb-[14px]">
                  Sign in to join communities, post, and connect with fellow film lovers.
                </p>
                <button
                  onClick={() =>
                    setAuthPrompt({
                      open: true,
                      message:
                        "Sign in to join communities, share your takes, and connect with fellow cinephiles!",
                    })
                  }
                  className="w-full rounded-[8px] py-[10px] text-white font-semibold text-[13px]"
                  style={{
                    background: "#3b82f6",
                    boxShadow: "0 4px 16px #3b82f640",
                  }}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomSheet
        open={liveSheetOpen}
        onClose={() => setLiveSheetOpen(false)}
        title="Live Rooms"
        subtitle={`${liveRooms.length} rooms happening right now`}
        accentColor="#e84545"
      >
        <div className="flex flex-col gap-2.5 pt-2 pb-6">
          {liveRooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer bg-[#3b82f6]/[0.08] border border-[#3b82f6]/[0.2]"
            >
              <div className="flex-1 min-w-0">
                <div className="font-[Outfit] text-[13px] font-semibold text-[#f0f0f8] truncate mb-0.5">
                  {room.title || "Untitled Room"}
                </div>
                <div className="font-[Outfit] text-[11px] text-[rgba(240,240,248,0.4)]">
                  👁 {room.participant_count || 0} watching · Live now
                </div>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>

      <style>{`
        @media (max-width: 768px) {
          .ff-sc-mobile  { display: block !important; }
          .ff-sc-desktop { display: none  !important; }
        }
        @media (min-width: 769px) {
          .ff-sc-mobile  { display: none  !important; }
          .ff-sc-desktop { display: block !important; }
        }
        @keyframes ff-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }
        .ff-hscroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={toast.duration}
        />
      )}
    </>
  );
}
