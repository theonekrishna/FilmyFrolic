const ACCENT = "#3b82f6";

import { ArrowLeft, Check, Loader2, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { COMMUNITY_RULES, MEDIA_IMAGES } from "../data/communities";
import {
  deleteCommunity,
  deleteCommunityPost,
  getCommunityEvents,
  getCommunityMembers,
  getCommunityPosts,
  reactToCommunityPost,
} from "../services/communityService";
import CommunityPostCard from "./CommunityPostCard";
import Toast from "./Toast";
import { useToast } from "../hooks/useToast";
import CommunityPostComposer from "./CommunityPostComposer";
import ReportButton from "../../Reports/components/ReportButton";

// ─── Data normalisers ─────────────────────────────────────────────────────────
function normalizePost(rp) {
  return {
    id: rp.id,
    gradient: rp.gradient || "linear-gradient(135deg, #3b82f6, #9b59b6)",
    initials: rp.initials || (rp.user ? rp.user.substring(0, 2).toUpperCase() : "FF"),
    user: rp.user || rp.author || rp.username || "Community Member",
    role: rp.role || null,
    timeAgo: rp.timeAgo || rp.time_ago || "Just now",
    content: rp.content || "",
    isSpoiler: !!(rp.isSpoiler || rp.is_spoiler),
    reactions: Array.isArray(rp.reactions) ? rp.reactions : [],
    commentCount: rp.commentCount ?? rp.comment_count ?? 0,
    shareCount: rp.shareCount ?? rp.share_count ?? 0,
    attachedMovie: rp.attachedMovie || rp.attached_movie || null,
    images: rp.images || [],
    is_owner: rp.is_owner || rp.isOwner || false,
    created_by: rp.created_by || rp.createdBy || rp.user_id || null,
    username: rp.user || rp.username || rp.author || "",
    userAvatar: rp.avatar_url || rp.userAvatar || rp.user_avatar || rp.avatarUrl || null,
  };
}

function normalizeMember(m) {
  const profile = m.profiles || m.profile || {};
  // API returns username correctly, name may be "Unknown" - prioritize username
  const username = m.username || profile.username || "Unknown";
  const role = m.role || "Member";
  const joinedAt = m.joined || m.joined_at || m.created_at || null;
  return {
    id: m.id || m.user_id,
    username,
    name: username, // keep for compatibility
    initials:
      m.initials || (username !== "Unknown" ? username.substring(0, 2).toUpperCase() : "??"),
    gradient: m.gradient || "linear-gradient(135deg, #3b82f6, #9b59b6)",
    role: typeof role === "string" ? role.charAt(0).toUpperCase() + role.slice(1) : "Member",
    joined: joinedAt
      ? typeof joinedAt === "string" && joinedAt.includes("T")
        ? new Date(joinedAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : joinedAt
      : "Recently",
    avatarUrl: m.avatarUrl || m.avatar_url || profile.avatar_url || null,
  };
}

export default function CommunityDetailView({
  community,
  joined,
  isJoining = false,
  onBack,
  onToggleJoin,
  onDelete,
}) {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [detailTab, setDetailTab] = useState("feed");
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Check if current user is an admin of this community
  const isAdmin = members.some(
    (m) => (m.id === user?.id || m.id === user?.id?.toString()) && m.role?.toLowerCase() === "admin"
  );
  const [errorMembers, setErrorMembers] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [errorEvents, setErrorEvents] = useState(null);
  const [showComposer, setShowComposer] = useState(false);
  const [postReactions, setPostReactions] = useState({});
  const [spoilerRevealed, setSpoilerRevealed] = useState({});

  useEffect(() => {
    async function fetchPosts() {
      if (!community.id) return;
      setIsLoadingPosts(true);
      setErrorPosts(null);
      try {
        const data = await getCommunityPosts(community.id);
        const postList = Array.isArray(data) ? data.map(normalizePost) : [];
        setPosts(postList);

        // Initialize postReactions from API data (which reactions user already made)
        const initialReactions = {};
        postList.forEach((post) => {
          const reactedIdxs = (post.reactions || [])
            .map((r, idx) => (r.reacted ? idx : -1))
            .filter((idx) => idx !== -1);
          if (reactedIdxs.length > 0) {
            initialReactions[post.id] = reactedIdxs;
          }
        });
        setPostReactions(initialReactions);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setErrorPosts("Failed to load posts.");
        setPosts([]);
      } finally {
        setIsLoadingPosts(false);
      }
    }

    if (detailTab === "feed") {
      fetchPosts();
    }
  }, [community.id, detailTab]);

  // Fetch members on mount to determine admin status for community delete button
  useEffect(() => {
    async function fetchMembersForAdmin() {
      if (!community.id || !user?.id) return;
      try {
        const data = await getCommunityMembers(community.id);
        const normalized = Array.isArray(data) ? data.map(normalizeMember) : [];
        setMembers(normalized);
      } catch (err) {
        console.error("Error fetching members for admin check:", err);
      }
    }

    fetchMembersForAdmin();
  }, [community.id, user?.id]);

  // Fetch members when members tab is active (with loading state)
  useEffect(() => {
    async function fetchMembers() {
      if (!community.id) return;
      setIsLoadingMembers(true);
      setErrorMembers(null);
      try {
        const data = await getCommunityMembers(community.id);
        const normalized = Array.isArray(data) ? data.map(normalizeMember) : [];
        setMembers(normalized);
      } catch (err) {
        console.error("Error fetching members:", err);
        setErrorMembers("Failed to load members.");
      } finally {
        setIsLoadingMembers(false);
      }
    }

    if (detailTab === "members") {
      fetchMembers();
    }
  }, [community.id, detailTab]);

  useEffect(() => {
    async function fetchEvents() {
      if (!community.id) return;
      setIsLoadingEvents(true);
      setErrorEvents(null);
      try {
        const data = await getCommunityEvents(community.id);
        setEvents(data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setErrorEvents("Failed to load events.");
      } finally {
        setIsLoadingEvents(false);
      }
    }

    if (detailTab === "events") {
      fetchEvents();
    }
  }, [community.id, detailTab]);

  async function handleDeletePost(postId) {
    try {
      await deleteCommunityPost(community.id, postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast("Post deleted", "info");
    } catch (err) {
      console.error("Error deleting post:", err);
      showToast(err.message || "Failed to delete post.", "error");
    }
  }

  async function handleToggleReaction(postId, emojiIdx, emoji) {
    const currentReactions = postReactions[postId] || [];
    const prevEmojiIdx = currentReactions.length > 0 ? currentReactions[0] : null;
    const isTogglingOff = prevEmojiIdx === emojiIdx;

    // Store previous state for rollback
    const previousReactionState = currentReactions;
    const previousPosts = [...posts];

    // Optimistic update: toggle user reaction state
    setPostReactions((prev) => ({
      ...prev,
      [postId]: isTogglingOff ? [] : [emojiIdx],
    }));

    // Optimistic update: update reaction count in posts
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id !== postId) return p;
        const newReactions = [...(p.reactions || [])];
        // Ensure reactions array has the emoji slots
        while (newReactions.length <= emojiIdx) {
          newReactions.push({
            emoji: ["👍", "❤️", "🔥"][newReactions.length],
            count: 0,
            reacted: false,
          });
        }
        if (isTogglingOff) {
          // Decrement count
          newReactions[emojiIdx] = {
            ...newReactions[emojiIdx],
            count: Math.max(0, (newReactions[emojiIdx].count || 0) - 1),
            reacted: false,
          };
        } else {
          // If switching, decrement previous
          if (prevEmojiIdx !== null && newReactions[prevEmojiIdx]) {
            newReactions[prevEmojiIdx] = {
              ...newReactions[prevEmojiIdx],
              count: Math.max(0, (newReactions[prevEmojiIdx].count || 0) - 1),
              reacted: false,
            };
          }
          // Increment new
          newReactions[emojiIdx] = {
            ...newReactions[emojiIdx],
            count: (newReactions[emojiIdx].count || 0) + 1,
            reacted: true,
          };
        }
        return { ...p, reactions: newReactions };
      })
    );

    try {
      // If toggling off (same emoji clicked again), just call API once to remove
      if (isTogglingOff) {
        await reactToCommunityPost(postId, emoji);
      } else {
        // If switching to different emoji, remove previous first, then add new
        if (prevEmojiIdx !== null) {
          const post = posts.find((p) => p.id === postId);
          const prevEmoji = post?.reactions?.[prevEmojiIdx]?.emoji;
          if (prevEmoji) {
            await reactToCommunityPost(postId, prevEmoji);
          }
        }
        // Add new reaction
        await reactToCommunityPost(postId, emoji);
      }
    } catch (err) {
      console.error("Error toggling reaction:", err);
      // Revert on failure
      setPostReactions((prev) => ({ ...prev, [postId]: previousReactionState }));
      setPosts(previousPosts);
    }
  }

  const TABS = [
    { value: "feed", label: "Feed" },
    { value: "about", label: "About" },
    { value: "members", label: "Members" },
    { value: "events", label: "Events" }, // Added
    { value: "media", label: "Media" },
    { value: "rules", label: "Rules" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 800,
        background: "#080810",
        overflowY: "auto",
        scrollbarWidth: "none",
      }}
    >
      {/* Banner */}
      <div
        style={{
          position: "relative",
          height: 200,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img
          src={community.banner}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(8,8,16,0.3) 0%, rgba(8,8,16,0.8) 100%)",
          }}
        />
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(8,8,16,0.6)",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
          }}
        >
          <ArrowLeft size={16} color="#f0f0f8" />
        </button>
        {/* Avatar */}
        <div
          style={{
            position: "absolute",
            bottom: -28,
            left: 24,
            width: 56,
            height: 56,
            borderRadius: 14,
            background: community.avatarGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            border: "3px solid #080810",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            zIndex: 2,
          }}
        >
          {community.avatarEmoji}
        </div>
      </div>

      {/* Info bar */}
      <div
        style={{
          padding: "38px 24px 16px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 28,
              letterSpacing: 2,
              color: "#f0f0f8",
              margin: "0 0 4px",
              lineHeight: 1,
            }}
          >
            {community.name}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12,
                color: "rgba(240,240,248,0.45)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Users size={11} /> {community.members} members
            </span>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12,
                color: "rgba(240,240,248,0.45)",
              }}
            >
              ·
            </span>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12,
                color: "rgba(240,240,248,0.45)",
              }}
            >
              {community.postsToday} posts today
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <button
            onClick={onToggleJoin}
            disabled={isJoining}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 20px",
              borderRadius: 10,
              background: joined ? "transparent" : ACCENT,
              border: `1px solid ${ACCENT}`,
              fontFamily: "'Outfit', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: joined ? ACCENT : "#fff",
              cursor: isJoining ? "not-allowed" : "pointer",
              opacity: isJoining ? 0.6 : 1,
              transition: "all 0.18s",
            }}
          >
            {isJoining ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Joining...
              </>
            ) : joined ? (
              <>
                <Check size={13} /> Joined
              </>
            ) : (
              "Join Community"
            )}
          </button>

          <ReportButton
            moduleType="community"
            targetId={String(community.id)}
            contentPreview={community.name}
            isOwner={community.isCreator || isAdmin}
            size="md"
            variant="icon"
            style={{
              padding: "9px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
            }}
          />

          {(community.isCreator || isAdmin) && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this community? This action cannot be undone."
                  )
                ) {
                  onDelete(community.id);
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 16px",
                borderRadius: 10,
                background: "rgba(232, 69, 69, 0.1)",
                border: "1px solid rgba(232, 69, 69, 0.2)",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: "#e84545",
                cursor: "pointer",
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(232, 69, 69, 0.15)";
                e.currentTarget.style.borderColor = "rgba(232, 69, 69, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(232, 69, 69, 0.1)";
                e.currentTarget.style.borderColor = "rgba(232, 69, 69, 0.2)";
              }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Genre chips */}
      <div
        style={{
          padding: "0 24px 16px",
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {community.genres.map((g) => (
          <span
            key={g}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              color: ACCENT,
              background: `${ACCENT}12`,
              border: `1px solid ${ACCENT}30`,
              borderRadius: 100,
              padding: "3px 10px",
            }}
          >
            {g}
          </span>
        ))}
      </div>

      {/* Tabs */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "0 16px",
          display: "flex",
          gap: 0,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setDetailTab(t.value)}
            style={{
              padding: "12px 16px 11px",
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${detailTab === t.value ? ACCENT : "transparent"}`,
              fontFamily: "'Outfit', sans-serif",
              fontSize: 13,
              fontWeight: detailTab === t.value ? 700 : 400,
              color: detailTab === t.value ? ACCENT : "rgba(240,240,248,0.45)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              minHeight: "unset",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "16px 20px 80px" }}>
        {detailTab === "feed" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* New post bar - only for joined members */}
            {joined && (
              <div
                onClick={() => setShowComposer(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#12121e",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.background = "#161625";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "#12121e";
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: user?.gradient || "linear-gradient(135deg,#f5c518,#e84545)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 800,
                    fontSize: 12,
                    color: "#080810",
                  }}
                >
                  {user?.initials || "JD"}
                </div>
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13,
                    color: "rgba(240,240,248,0.3)",
                  }}
                >
                  Share something with the community…
                </span>
              </div>
            )}
            {isLoadingPosts ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 0",
                  gap: 10,
                }}
              >
                <Loader2 size={24} className="animate-spin" style={{ color: ACCENT }} />
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13,
                    color: "rgba(240,240,248,0.3)",
                  }}
                >
                  Loading posts...
                </span>
              </div>
            ) : errorPosts ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#e84545",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                }}
              >
                {errorPosts}
              </div>
            ) : posts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "rgba(240,240,248,0.3)",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                }}
              >
                No posts yet. Be the first to share!
              </div>
            ) : (
              posts.map((post) => {
                // Use API's is_owner and created_by fields (backend now returns these)
                const isPostOwner = post.is_owner || post.created_by === user?.id;
                return (
                  <CommunityPostCard
                    key={post.id}
                    post={post}
                    reactedIdxs={postReactions[post.id] || []}
                    onReact={(idx, emoji) => handleToggleReaction(post.id, idx, emoji)}
                    isOwner={isPostOwner}
                    onDelete={isPostOwner ? handleDeletePost : null}
                    spoilerRevealed={!!spoilerRevealed[post.id]}
                    onRevealSpoiler={() =>
                      setSpoilerRevealed((prev) => ({ ...prev, [post.id]: true }))
                    }
                  />
                );
              })
            )}
          </div>
        )}
        {detailTab === "about" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "#12121e",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: "16px",
              }}
            >
              <h4
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: 18,
                  letterSpacing: 1.5,
                  color: "#f0f0f8",
                  margin: "0 0 10px",
                }}
              >
                About
              </h4>
              <p
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 14,
                  color: "rgba(240,240,248,0.65)",
                  margin: 0,
                  lineHeight: 1.7,
                  fontWeight: 300,
                }}
              >
                {community.description}
              </p>
            </div>
            <div
              style={{
                background: "#12121e",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: "16px",
              }}
            >
              <h4
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: 18,
                  letterSpacing: 1.5,
                  color: "#f0f0f8",
                  margin: "0 0 12px",
                }}
              >
                Stats
              </h4>
              {[
                { label: "Members", value: community.members },
                { label: "Posts Today", value: String(community.postsToday) },
                { label: "Category", value: community.category },
                { label: "Privacy", value: "Public" },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 13,
                      color: "rgba(240,240,248,0.45)",
                    }}
                  >
                    {s.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#f0f0f8",
                    }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {detailTab === "members" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isLoadingMembers ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Loader2
                  size={24}
                  className="animate-spin"
                  style={{ color: ACCENT, margin: "0 auto 10px" }}
                />
                <div
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13,
                    color: "rgba(240,240,248,0.35)",
                  }}
                >
                  Loading members...
                </div>
              </div>
            ) : errorMembers ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#e84545",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                }}
              >
                {errorMembers}
              </div>
            ) : members.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "rgba(240,240,248,0.35)",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                }}
              >
                No members found.
              </div>
            ) : (
              members.map((m) => (
                <div
                  key={m.id || m.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#12121e",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12,
                    padding: "12px 16px",
                  }}
                >
                  {m.avatarUrl ? (
                    <img
                      src={m.avatarUrl}
                      alt={m.name}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: m.gradient || "linear-gradient(135deg, #3b82f6, #9b59b6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: 800,
                        fontSize: 14,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {m.initials || (m.name ? m.name.substring(0, 2).toUpperCase() : "FF")}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#f0f0f8",
                      }}
                    >
                      {m.username || m.name || "Unknown"}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 11,
                        color: "rgba(240,240,248,0.35)",
                      }}
                    >
                      Joined {m.joined || "Recently"}
                    </div>
                  </div>
                  {m.role && (
                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 10,
                        fontWeight: 700,
                        color:
                          m.role === "Admin"
                            ? "#f5c518"
                            : m.role === "Moderator"
                              ? ACCENT
                              : "rgba(240,240,248,0.35)",
                        background:
                          m.role === "Admin"
                            ? "rgba(245,197,24,0.12)"
                            : m.role === "Moderator"
                              ? `${ACCENT}18`
                              : "rgba(255,255,255,0.05)",
                        border: `1px solid ${
                          m.role === "Admin"
                            ? "rgba(245,197,24,0.3)"
                            : m.role === "Moderator"
                              ? ACCENT + "40"
                              : "rgba(255,255,255,0.09)"
                        }`,
                        borderRadius: 100,
                        padding: "3px 10px",
                      }}
                    >
                      {m.role.toUpperCase()}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        {detailTab === "events" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {isLoadingEvents ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Loader2
                  size={24}
                  className="animate-spin"
                  style={{ color: ACCENT, margin: "0 auto 10px" }}
                />
                <div
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13,
                    color: "rgba(240,240,248,0.35)",
                  }}
                >
                  Loading events...
                </div>
              </div>
            ) : errorEvents ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#e84545",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                }}
              >
                {errorEvents}
              </div>
            ) : events.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "rgba(240,240,248,0.35)",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 13,
                }}
              >
                No events found.
              </div>
            ) : (
              events.map((e) => (
                <div
                  key={e.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    background: "#12121e",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    padding: "16px 20px",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `${e.color || ACCENT}15`,
                      border: `1px solid ${e.color || ACCENT}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Plus size={20} style={{ color: e.color || ACCENT }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#f0f0f8",
                        marginBottom: 4,
                      }}
                    >
                      {e.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 12,
                          color: "rgba(240,240,248,0.4)",
                        }}
                      >
                        {e.date}
                      </span>
                      {e.type && (
                        <span
                          style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 10,
                            fontWeight: 700,
                            borderRadius: 100,
                            padding: "2px 9px",
                            color: e.color || ACCENT,
                            background: `${e.color || ACCENT}15`,
                            border: `1px solid ${e.color || ACCENT}30`,
                          }}
                        >
                          {e.type.toUpperCase()}
                        </span>
                      )}
                      <span
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 12,
                          color: "rgba(240,240,248,0.35)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Users size={11} /> {(e.attending || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    style={{
                      background: e.color || ACCENT,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "9px 18px",
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Attend
                  </button>
                </div>
              ))
            )}
          </div>
        )}
        {detailTab === "media" && (
          <div>
            {(() => {
              // Extract all images from posts (mediaUrl and images array)
              const allImages = posts.reduce((acc, post) => {
                if (post.mediaUrl) acc.push(post.mediaUrl);
                if (post.images && Array.isArray(post.images)) {
                  acc.push(...post.images);
                }
                return acc;
              }, []);

              if (allImages.length === 0) {
                return (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "rgba(240,240,248,0.4)",
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 14,
                    }}
                  >
                    No media yet
                  </div>
                );
              }

              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                  {allImages.map((img, i) => (
                    <div
                      key={i}
                      style={{
                        aspectRatio: "1",
                        borderRadius: 8,
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={img}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
        {detailTab === "rules" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {COMMUNITY_RULES.map((r) => (
              <div
                key={r.num}
                style={{
                  display: "flex",
                  gap: 14,
                  background: "#12121e",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: `${ACCENT}18`,
                    border: `1px solid ${ACCENT}35`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: 16,
                    color: ACCENT,
                    flexShrink: 0,
                  }}
                >
                  {r.num}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#f0f0f8",
                      marginBottom: 4,
                    }}
                  >
                    {r.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 12,
                      color: "rgba(240,240,248,0.5)",
                      lineHeight: 1.5,
                      fontWeight: 300,
                    }}
                  >
                    {r.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showComposer && (
        <CommunityPostComposer
          community={community}
          onClose={() => setShowComposer(false)}
          onPostCreated={(newPost) => {
            setPosts((prev) => [newPost, ...prev]);
            // Initialize reactions for new post (user hasn't reacted yet)
            setPostReactions((prev) => ({ ...prev, [newPost.id]: [] }));
            showToast("Post shared!", "success");
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={toast.duration}
        />
      )}
    </div>
  );
}
