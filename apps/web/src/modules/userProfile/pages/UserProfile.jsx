import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit3, Star, Film, Bookmark, Settings, TrendingUp, Award, Globe } from "lucide-react";

import TopBar from "../../../layout/TopBar";
import EditProfileModal from "../components/EditProfileModal";
import { useAuth } from "../../../context/AuthContext";
import { MOVIES } from "../../Home/data/movies";
import { PROFILE_STATS } from "../data/userprofile";
import ActivityFeed from "../components/ActivityFeed";
import WatchlistGrid from "../components/WatchlistGrid";
import ReviewsList from "../components/ReviewsList";
import QuizzesTab from "../components/QuizzesTab";
import BadgesTab from "../components/BadgesTab";
import { useEffect } from "react";
import axios from "axios";
import { useFollowCounts } from "../../follow/hooks/useFollow";
import FollowListModal from "../../follow/components/FollowListModal";
const ACCENT = "#1fd1a8";
const GOLD = "#f5c518";
import { requireAuth } from "../../../utils/requireAuth";
const TABS = [
  { value: "activity", label: "Activity", icon: <TrendingUp size={13} /> },
  { value: "watchlist", label: "Watchlist", icon: <Bookmark size={13} /> },
  { value: "reviews", label: "Reviews", icon: <Star size={13} /> },
  { value: "quizzes", label: "Quizzes", icon: <Award size={13} /> },
  { value: "badges", label: "Badges", icon: <Film size={13} /> },
];

export default function UserProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("activity");
  const [editOpen, setEditOpen] = useState(false);
  const [postsCount, setPostsCount] = useState(0);
  const BASE_URL = (import.meta.env.VITE_BASE_URL || "https://filmyfrolic-api.onrender.com").replace(/\/+$/, "");

  // Live follow counts — keyed on user.id from AuthContext
  const { counts: followCounts } = useFollowCounts(user?.id);

  // Followers / Following modal
  const [followModal, setFollowModal] = useState({
    open: false,
    type: "followers",
  });
  const openFollowModal = (type) => setFollowModal({ open: true, type });
  const closeFollowModal = () => setFollowModal((m) => ({ ...m, open: false }));

  // Live user data with fallbacks
  const displayName = profile?.displayName || "Film Enthusiast";

  const username = profile?.username || "film_enthusiast";

  const userBio = profile?.bio || "";

  const userGradient = profile?.gradient || "linear-gradient(135deg, #f5c518, #e84545)";

  const userWebsite = profile?.website || "";
  const avatarUrl = profile?.avatarUrl || null;
  const joinedAt = profile?.joinedAt || "Recently";

  // ✅ FIXED initials (remove user?.initials)
  const userInitials =
    displayName
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "FF";

  // ✅ FIXED genres (use profile only)
  const userGenres = profile?.genres || [];
  const fetchUser = async () => {
    // localStorage.removeItem("accessToken");
    if (!requireAuth(navigate, "/user/profile")) return; // first

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${BASE_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data;
      console.log(res, BASE_URL);

      setProfile({
        displayName: data.display_name,
        username: data.username,
        bio: data.bio,
        website: data.website,
        gradient: data.avatar_color,
        avatarUrl: data.avatar_url,
        joinedAt: data.createdAt || "Recently",
      });
      setPostsCount(data.total_posts_count ?? 0);
    } catch (err) {
      console.error("Fetch user error:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!editOpen) {
      fetchUser(); // 🔥 re-fetch after modal closes
    }
  }, [editOpen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#080810]">
        <div className="w-10 h-10 border-4 border-white/20 border-t-[#1fd1a8] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      {/* ── Edit Profile Modal ─────────────────────────────────────────────── */}
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
      <div className="min-h-screen bg-[#080810]">
        <TopBar />
        {/* ── HERO BANNER ───────────────────────────────────────────────────── */}
        <div className="relative h-[220px] overflow-hidden">
          {/* Blurred movie collage bg */}
          <div className="absolute inset-0 flex">
            {MOVIES.slice(0, 6).map((m) => (
              <img
                key={m.id}
                src={m.image}
                alt=""
                className="flex-1 h-full object-cover blur-[10px] min-w-0 opacity-[0.18]"
              />
            ))}
          </div>

          {/* Gradient color wash based on gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(31,209,168,0.18) 0%, rgba(245,197,24,0.1) 100%)",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(8,8,16,0.2) 0%, rgba(8,8,16,0.55) 60%, #080810 100%)",
            }}
          />

          {/* Edit Profile button — top right */}
          <div className="absolute top-4 right-5 flex gap-2">
            <button
              onClick={() => navigate("/settings/account")}
              className="w-9 h-9 rounded-full bg-[rgba(8,8,16,0.6)] border border-[rgba(255,255,255,0.15)] flex items-center justify-center cursor-pointer backdrop-blur-[8px]"
            >
              <Settings size={15} color="rgba(240,240,248,0.7)" />
            </button>

            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-[6px] px-4 h-9 rounded-[100px] bg-[rgba(8,8,16,0.6)] border border-[rgba(255,255,255,0.18)] text-[12px] font-semibold text-[#f0f0f8] cursor-pointer backdrop-blur-[8px] transition"
              style={{ fontFamily: "'Outfit', sans-serif" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(31,209,168,0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(8,8,16,0.6)")}
            >
              <Edit3 size={12} />
              Edit Profile
            </button>
          </div>
        </div>
        {/* ── PROFILE INFO ──────────────────────────────────────────────────── */}
        <div className="px-[28px] max-w-[920px] mx-auto">
          {/* Avatar row */}
          <div className="flex items-end gap-5 -mt-[44px] mb-5 flex-wrap">
            {/* Avatar circle */}
            <div
              onClick={() => setEditOpen(true)}
              title="Click to edit profile"
              className="w-[88px] h-[88px] rounded-full border-[4px] border-[#080810] flex items-center justify-center text-[30px] text-white cursor-pointer flex-shrink-0 relative z-[5] transition-shadow"
              style={{
                background: userGradient,
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: 2,
                boxShadow: `0 0 0 2px ${ACCENT}50, 0 8px 24px rgba(0,0,0,0.5)`,
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                userInitials
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 pb-1 relative z-10">
              <h1
                className="text-[34px] text-[#f0f0f8] leading-[1.2] mb-[6px]"
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: 3,
                }}
              >
                {displayName}
              </h1>

              <div className="flex items-center gap-[10px] flex-wrap">
                <span
                  className="text-[13px] font-light text-[rgba(240,240,248,0.42)]"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  @{username}
                </span>

                <div
                  className="flex items-center gap-1 rounded-full px-[10px] py-[3px]"
                  style={{
                    background: `${ACCENT}15`,
                    border: `1px solid ${ACCENT}30`,
                  }}
                >
                  <Star size={9} fill={ACCENT} color={ACCENT} />
                  <span
                    className="text-[10px] font-bold"
                    style={{
                      color: ACCENT,
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    Film Buff
                  </span>
                </div>

                <span
                  className="text-[11px] text-[rgba(240,240,248,0.3)]"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Joined {joinedAt}
                </span>
              </div>
            </div>

            {/* CTA button */}
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 px-6 py-[10px] rounded-full text-[13px] font-bold cursor-pointer transition-all flex-shrink-0"
              style={{
                background: `${ACCENT}15`,
                border: `1.5px solid ${ACCENT}50`,
                color: ACCENT,
                fontFamily: "'Outfit', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${ACCENT}25`;
                e.currentTarget.style.boxShadow = `0 0 16px ${ACCENT}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${ACCENT}15`;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Edit3 size={13} />
              Edit Profile
            </button>
          </div>

          {/* Bio + website */}
          <div className="mb-5">
            {userBio && (
              <p
                className="text-[14px] font-light text-[rgba(240,240,248,0.6)] mb-2 leading-[1.6] w-full break-words"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {userBio}
              </p>
            )}

            {userWebsite && (
              <a
                href={userWebsite.startsWith("http") ? userWebsite : `https://${userWebsite}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-[5px] text-[12px] font-medium"
                style={{
                  color: ACCENT,
                  textDecoration: "none",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                <Globe size={12} />
                {userWebsite.replace(/^https?:\/\//, "")}
              </a>
            )}

            {/* Genre pills */}
            {userGenres.length > 0 && (
              <div className="flex flex-wrap gap-[6px] mt-3">
                {userGenres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full px-3 py-[4px] text-[11px] font-medium"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(240,240,248,0.55)",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className="flex bg-[#12121e] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden mb-7">
            {PROFILE_STATS.map((s, i) => {
              const value =
                s.label === "Followers"
                  ? followCounts.followers
                  : s.label === "Following"
                    ? followCounts.following
                    : s.label === "Posts"
                      ? postsCount
                      : s.value;

              const isClickable = s.label === "Followers" || s.label === "Following";

              return (
                <div
                  key={s.label}
                  onClick={() =>
                    isClickable &&
                    openFollowModal(s.label === "Followers" ? "followers" : "following")
                  }
                  className="flex-1 py-4 text-center transition"
                  style={{
                    borderRight:
                      i < PROFILE_STATS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                    cursor: isClickable ? "pointer" : "default",
                  }}
                  onMouseEnter={(e) => {
                    if (isClickable) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div
                    className="text-[24px] leading-none mb-1"
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      letterSpacing: 1,
                      color: isClickable ? "#f5c518" : GOLD,
                    }}
                  >
                    {value}
                  </div>
                  <div
                    className="text-[10px] text-[rgba(240,240,248,0.38)]"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      textDecorationLine: isClickable ? "underline" : "none",
                      textDecorationStyle: "dotted",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[rgba(255,255,255,0.07)] mb-6 overflow-x-auto ff-hscroll">
            {TABS.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className="flex items-center gap-[7px] bg-transparent border-none px-5 py-[12px] text-[13px] whitespace-nowrap cursor-pointer flex-shrink-0 -mb-[1px]"
                style={{
                  borderBottom: `2px solid ${tab === value ? ACCENT : "transparent"}`,
                  color: tab === value ? ACCENT : "rgba(240,240,248,0.45)",
                  fontWeight: tab === value ? 700 : 400,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                <span
                  style={{
                    color: tab === value ? ACCENT : "rgba(240,240,248,0.3)",
                  }}
                >
                  {icon}
                </span>
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="pb-[80px]">
            {tab === "activity" && <ActivityFeed />}
            {tab === "watchlist" && <WatchlistGrid navigate={navigate} />}
            {tab === "reviews" && <ReviewsList />}
            {tab === "quizzes" && <QuizzesTab />}
            {tab === "badges" && <BadgesTab />}
          </div>
        </div>
      </div>

      {/* Followers / Following modal */}
      <FollowListModal
        isOpen={followModal.open}
        onClose={closeFollowModal}
        userId={user?.id}
        type={followModal.type}
        count={followModal.type === "followers" ? followCounts.followers : followCounts.following}
      />
    </>
  );
}
