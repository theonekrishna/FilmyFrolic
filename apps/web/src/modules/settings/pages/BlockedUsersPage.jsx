import { UserX, UserPlus, Search, Ban } from "lucide-react";
import { useEffect, useState, useCallback, memo } from "react";
import { ToastContainer, useToast } from "../../../shared/Toast";
import SettingsLoader from "../components/SettingsLoader";
import { settingsService } from "../services/settingsService";
import { settingsCache, CACHE_KEYS } from "../utils/settingsCache";

const ACCENT = "#e84545";

// ── SearchResultRow ───────────────────────────────────────────────────────────
const SearchResultRow = memo(function SearchResultRow({ user, isLast, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  const handleClick = useCallback(() => onSelect(user), [onSelect, user]);

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        cursor: "pointer",
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)",
        background: hovered ? "rgba(255,255,255,0.05)" : "transparent",
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: user.gradient || "#1a1a2a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 12, color: "#f0f0f8" }}>
            {user.initials || user.name?.charAt(0) || "?"}
          </span>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#f0f0f8",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {user.name || "Unknown"}
        </div>
        <div style={{ fontSize: 11, color: "rgba(240,240,248,0.4)" }}>
          @{user.username || "unknown"}
        </div>
      </div>
    </div>
  );
});

// ── BlockedUserRow ─────────────────────────────────────────────────────────────
const BlockedUserRow = memo(function BlockedUserRow({ item, isLast, onUnblock }) {
  const user = item.blocked;

  const handleUnblock = useCallback(
    () => onUnblock(item.blocked_id || user?.id),
    [onUnblock, item.blocked_id, user?.id]
  );

  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  if (!user) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            overflow: "hidden",
            background: user.gradient || "#1a1a2a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 16,
                fontWeight: 600,
                color: "#f0f0f8",
              }}
            >
              {user.initials || user.name?.charAt(0) || "?"}
            </span>
          )}
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: "#f0f0f8",
            }}
          >
            {user.name || "Unknown User"}
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              color: "rgba(240,240,248,0.4)",
              marginTop: 2,
            }}
          >
            @{user.username || "unknown"}
          </div>
        </div>
      </div>
      <button
        onClick={handleUnblock}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          padding: "8px 16px",
          background: hovered ? `${ACCENT}20` : "transparent",
          border: `1px solid ${ACCENT}50`,
          borderRadius: 8,
          color: ACCENT,
          fontFamily: "'Outfit', sans-serif",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        Unblock
      </button>
    </div>
  );
});

export default function BlockedUsersPage({ inModal = false, onClose }) {
  const toastApi = useToast();

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const loadBlockedUsers = useCallback(async () => {
    try {
      // Check cache first
      const cached = settingsCache.get(CACHE_KEYS.BLOCKED_USERS);
      if (cached) {
        setLoading(false);
        const blockedData = cached?.blocked || cached;
        setBlockedUsers(Array.isArray(blockedData) ? blockedData : []);
      } else {
        setLoading(true);
      }

      // Fetch fresh data
      const res = await settingsCache.fetchWithCache(
        CACHE_KEYS.BLOCKED_USERS,
        () => settingsService.getBlockedUsers(),
        { staleWhileRevalidate: true }
      );
      const blockedData = res?.blocked || res;
      setBlockedUsers(Array.isArray(blockedData) ? blockedData : []);
    } catch (err) {
      console.error("Error loading blocked users:", err);
      toastApi.error("Error", "Failed to load blocked users", 3000);
    } finally {
      setLoading(false);
    }
  }, [toastApi]);

  useEffect(() => {
    loadBlockedUsers();
  }, [loadBlockedUsers]);

  const handleUnblock = useCallback(
    async (userId) => {
      if (!window.confirm("Are you sure you want to unblock this user?")) return;

      try {
        await settingsService.unblockUser(userId);
        setBlockedUsers((prev) => prev.filter((u) => u.blocked?.id !== userId));
        toastApi.success("User Unblocked", "The user has been unblocked successfully.", 3000);
      } catch (err) {
        console.error("Error unblocking user:", err);
        toastApi.error("Error", "Failed to unblock user", 3000);
      }
    },
    [toastApi]
  );

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await settingsService.searchUsers(searchQuery);
        // Handle different response formats - messages search might return conversations or users
        const results = res?.users || res?.conversations || res?.data || res || [];
        const users = Array.isArray(results) ? results : [];
        setSearchResults(users.slice(0, 5)); // Limit to 5 results
        setShowDropdown(users.length > 0);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSelectUser = useCallback((user) => {
    setSelectedUser(user);
    setSearchQuery(user.name || user.username || "");
    setShowDropdown(false);
    setSearchResults([]);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setSelectedUser(null);
  }, []);

  const handleBlockUser = useCallback(
    async (e) => {
      e.preventDefault();
      const userId = selectedUser?.id || searchQuery.trim();
      if (!userId) {
        toastApi.error("Error", "Please select a user to block", 3000);
        return;
      }

      try {
        setBlocking(true);
        await settingsService.blockUser(userId);
        toastApi.success("User Blocked", "The user has been blocked successfully.", 3000);
        setSearchQuery("");
        setSelectedUser(null);
        setSearchResults([]);
        loadBlockedUsers();
      } catch (err) {
        console.error("Error blocking user:", err);
        toastApi.error("Error", err.message || "Failed to block user", 3000);
      } finally {
        setBlocking(false);
      }
    },
    [selectedUser, searchQuery, toastApi, loadBlockedUsers]
  );

  if (loading) {
    return <SettingsLoader text="Loading blocked users..." />;
  }

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      {/* Header - hidden when in modal */}
      {!inModal && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 20,
            padding: "16px 20px",
            background: `${ACCENT}08`,
            border: `1px solid ${ACCENT}18`,
            borderRadius: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `${ACCENT}18`,
              border: `1px solid ${ACCENT}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Ban size={20} color={ACCENT} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 20,
                letterSpacing: 2,
                color: "#f0f0f8",
                lineHeight: 1,
              }}
            >
              Blocked Users
            </div>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12,
                color: "rgba(240,240,248,0.38)",
                marginTop: 2,
              }}
            >
              Manage users you've blocked
            </div>
          </div>
        </div>
      )}

      {/* Block User Form with Search */}
      <div
        style={{
          background: "#12121e",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <form
          onSubmit={handleBlockUser}
          style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(240,240,248,0.3)",
                zIndex: 1,
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search user by name or username..."
              style={{
                width: "100%",
                padding: "12px 12px 12px 40px",
                background: "#080810",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#f0f0f8",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 14,
                outline: "none",
              }}
            />

            {/* Search Results Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  marginTop: 4,
                  background: "#12121e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  maxHeight: 200,
                  overflow: "auto",
                  zIndex: 100,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
              >
                {searchResults.map((item, index) => {
                  const user = item.user || item.participant || item;
                  return (
                    <SearchResultRow
                      key={user.id || index}
                      user={user}
                      isLast={index === searchResults.length - 1}
                      onSelect={handleSelectUser}
                    />
                  );
                })}
              </div>
            )}

            {/* Searching indicator */}
            {searching && (
              <div
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(240,240,248,0.4)",
                  fontSize: 12,
                }}
              >
                Searching...
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={blocking || !searchQuery.trim()}
            style={{
              padding: "12px 20px",
              background: ACCENT,
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontFamily: "'Outfit', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: blocking || !searchQuery.trim() ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            <UserPlus size={16} />
            {blocking ? "Blocking..." : "Block User"}
          </button>
        </form>
      </div>

      {/* Blocked Users List */}
      <div
        style={{
          background: "#12121e",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {blockedUsers.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "rgba(240,240,248,0.4)",
            }}
          >
            <UserX size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>No blocked users</p>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12,
                marginTop: 8,
                opacity: 0.6,
              }}
            >
              Users you block will appear here
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {blockedUsers.map((item, index) => (
              <BlockedUserRow
                key={item.id}
                item={item}
                isLast={index === blockedUsers.length - 1}
                onUnblock={handleUnblock}
              />
            ))}
          </div>
        )}
      </div>

      {!inModal && <ToastContainer toasts={toastApi.toasts} onDismiss={toastApi.dismiss} />}
    </div>
  );
}
