import {
  MessageCircle,
  ShieldAlert,
  UserCheck,
  Ban,
  History,
  Download,
  Laptop,
  X,
} from "lucide-react";
import { useEffect, useState, useCallback, memo } from "react";
import { ToastContainer, useToast } from "../../../shared/Toast";
import PermissionRow from "../components/PermissionRow";
import SettingsCard from "../components/SettingsCard";
import SettingsLoader from "../components/SettingsLoader";
import SettingsRow from "../components/SettingsRow";
import SettingsToggle from "../components/SettingsToggle";
import { settingsService } from "../services/settingsService";
import { settingsCache, CACHE_KEYS } from "../utils/settingsCache";
// Sub-pages rendered inside the PrivacyModal
import BlockedUsersPage from "./BlockedUsersPage";
import WatchHistoryPage from "./WatchHistoryPage";
import SessionsPage from "./SessionsPage";
import DataExportPage from "./DataExportPage";

// ── API docs (endpoint 28–29) ─────────────────────────────────────────────────
// GET  /api/settings/privacy
//   → { privacy: { followPermission, messagePermission,
//                  activityVisible, watchlistPublic, profileIndexed } }
//
// PATCH /api/settings/privacy  (all fields optional, server-merged)
//   body: { followPermission?, messagePermission?,
//           activityVisible?, watchlistPublic?, profileIndexed? }
//
// Allowed followPermission:  "Everyone" | "Friends of friends" | "No one"
// Allowed messagePermission: "Everyone" | "Followers"          | "No one"
// ─────────────────────────────────────────────────────────────────────────────

export default function PrivacyPage() {
  // const [followPermission, setFollowPermission] = useState("Everyone");
  const [messagePermission, setMessagePermission] = useState("Followers");
  const [toggles, setToggles] = useState({
    activityVisible: false,
    watchlistPublic: true,
    profileIndexed: true,
  });
  const [blockedCount, setBlockedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  // "blocked" | "history" | "sessions" | "export" | null
  const [activeModal, setActiveModal] = useState(null);
  const toastApi = useToast();

  useEffect(() => {
    loadPrivacyData();
  }, []);

  // Apply a privacy object (from API or cache) to all local state
  const applyPrivacyData = useCallback((privacy) => {
    if (!privacy) return;
    // if (privacy.followPermission) setFollowPermission(privacy.followPermission);
    if (privacy.messagePermission) setMessagePermission(privacy.messagePermission);
    setToggles({
      activityVisible: !!privacy.activityVisible,
      watchlistPublic: privacy.watchlistPublic !== false,
      profileIndexed: privacy.profileIndexed !== false,
    });
  }, []);

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadPrivacyData = useCallback(async () => {
    try {
      // Show cached data immediately while refreshing in background
      const cachedPrivacy = settingsCache.get(CACHE_KEYS.PRIVACY);
      const cachedBlocked = settingsCache.get(CACHE_KEYS.BLOCKED_USERS);

      if (cachedPrivacy) {
        setLoading(false);
        applyPrivacyData(cachedPrivacy?.privacy || cachedPrivacy);
      } else {
        setLoading(true);
      }

      if (cachedBlocked) {
        const blockedData = cachedBlocked?.blocked || cachedBlocked;
        setBlockedCount(Array.isArray(blockedData) ? blockedData.length : 0);
      }

      // GET /api/settings/privacy — single endpoint for all five privacy fields
      const privacyRes = await settingsCache.fetchWithCache(
        CACHE_KEYS.PRIVACY,
        () => settingsService.getPrivacy(),
        { staleWhileRevalidate: true }
      );
      applyPrivacyData(privacyRes?.privacy || privacyRes);

      // Blocked count
      const blockedRes = await settingsCache.fetchWithCache(CACHE_KEYS.BLOCKED_USERS, () =>
        settingsService.getBlockedUsers()
      );
      const blockedData = blockedRes?.blocked || blockedRes;
      setBlockedCount(Array.isArray(blockedData) ? blockedData.length : 0);
    } catch (err) {
      console.error("Error loading privacy data:", err);
      toastApi.error("Error", "Failed to load privacy settings", 3000);
    } finally {
      setLoading(false);
    }
  }, [applyPrivacyData, toastApi]);

  // ── Toggle visibility flags ────────────────────────────────────────────────
  const toggle = useCallback(
    async (key) => {
      let revertValue;
      setToggles((prev) => {
        revertValue = prev[key];
        return { ...prev, [key]: !prev[key] };
      });
      settingsCache.invalidate(CACHE_KEYS.PRIVACY);

      try {
        // PATCH /api/settings/privacy — send only the changed flag
        await settingsService.updatePrivacy({ [key]: !revertValue });
        toastApi.success("Privacy Updated", "Your privacy settings have been saved.", 3000);
      } catch (err) {
        console.error("Error updating privacy toggle:", err);
        toastApi.error("Error", "Failed to update privacy settings", 3000);
        // Revert optimistic update
        setToggles((prev) => ({ ...prev, [key]: revertValue }));
      }
    },
    [toastApi]
  );

  // ── Follow / Message permission change ───────────────────────────────────
  // Both followPermission and messagePermission go to PATCH /api/settings/privacy.
  // The API spec lists both fields on the same endpoint (28–29).
  const handlePermissionChange = useCallback(
    async (type, value) => {
      // Optimistic update
      // if (type === "follow") setFollowPermission(value);
      if (type === "message") setMessagePermission(value);

      settingsCache.invalidate(CACHE_KEYS.PRIVACY);

      try {
        const payload =
          type === "follow" ? { followPermission: value } : { messagePermission: value };

        // PATCH /api/settings/privacy
        await settingsService.updatePrivacy(payload);
        toastApi.success("Privacy Updated", "Your privacy settings have been saved.", 3000);
      } catch (err) {
        console.error("Error updating permission:", err);
        toastApi.error("Error", err.message || "Failed to update privacy settings", 3000);
        // Revert on failure
        loadPrivacyData();
      }
    },
    [toastApi, loadPrivacyData]
  );

  // Stable handlers for memoized rows
  // const handleFollowPermissionChange = useCallback(
  //   (val) => handlePermissionChange("follow", val),
  //   [handlePermissionChange],
  // );
  const handleMessagePermissionChange = useCallback(
    (val) => handlePermissionChange("message", val),
    [handlePermissionChange]
  );
  // const handleToggleActivityVisible = useCallback(
  //   () => toggle("activityVisible"),
  //   [toggle],
  // );
  // const handleToggleWatchlistPublic = useCallback(
  //   () => toggle("watchlistPublic"),
  //   [toggle],
  // );
  const handleToggleProfileIndexed = useCallback(() => toggle("profileIndexed"), [toggle]);

  const openBlockedModal = useCallback(() => setActiveModal("blocked"), []);
  // const openHistoryModal = useCallback(() => setActiveModal("history"), []);
  const openSessionsModal = useCallback(() => setActiveModal("sessions"), []);
  const openExportModal = useCallback(() => setActiveModal("export"), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="animate-in fade-in duration-300 pb-10">
      {loading ? (
        <SettingsLoader text="Loading privacy settings..." />
      ) : (
        <>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 20,
              padding: "16px 20px",
              background: "#3b82f608",
              border: "1px solid #3b82f618",
              borderRadius: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#3b82f618",
                border: "1px solid #3b82f630",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldAlert size={20} color="#3b82f6" />
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
                Privacy
              </div>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  color: "rgba(240,240,248,0.38)",
                  marginTop: 2,
                }}
              >
                Who can follow, message, and view your data
              </div>
            </div>
          </div>

          {/* Follow permission */}
          {/* <SettingsCard title="Who Can Follow You">
            <PermissionRow
              label="Follow Permission"
              desc="Control who can follow your profile"
              options={["Everyone", "Friends of friends", "No one"]}
              value={followPermission}
              onChange={handleFollowPermissionChange}
              icon={UserCheck}
              accent="#3b82f6"
            />
          </SettingsCard> */}

          {/* Message permission */}
          <SettingsCard title="Who Can Message You">
            <PermissionRow
              label="Message Permission"
              desc="Control who can send you direct messages"
              options={["Everyone", "Followers", "No one"]}
              value={messagePermission}
              onChange={handleMessagePermissionChange}
              icon={MessageCircle}
              accent="#3b82f6"
            />
          </SettingsCard>

          {/* Visibility toggles */}
          <SettingsCard title="Visibility">
            {/* <SettingsRow
              label="Activity Visible to Others"
              desc="Let others see what you're currently watching"
            >
              <SettingsToggle
                value={toggles.activityVisible}
                onChange={handleToggleActivityVisible}
                accent="#3b82f6"
              />
            </SettingsRow>
            <SettingsRow
              label="Public Watchlist"
              desc="Allow others to browse your watchlist"
            >
              <SettingsToggle
                value={toggles.watchlistPublic}
                onChange={handleToggleWatchlistPublic}
                accent="#3b82f6"
              />
            </SettingsRow> */}
            <SettingsRow
              label="Appear in Search"
              desc="Let others find your profile via search"
              border={false}
            >
              <SettingsToggle
                value={toggles.profileIndexed}
                onChange={handleToggleProfileIndexed}
                accent="#3b82f6"
              />
            </SettingsRow>
          </SettingsCard>

          {/* Manage sub-pages */}
          <SettingsCard title="Manage">
            <SettingsRow
              label="Blocked Users"
              desc="Manage users you've blocked"
              value={`${blockedCount} blocked`}
              onClick={openBlockedModal}
            >
              <Ban size={16} color="#e84545" />
            </SettingsRow>
            {/* <SettingsRow
              label="Watch History"
              desc="View and manage your viewing activity"
              onClick={openHistoryModal}
            >
              <History size={16} color="#f5c518" />
            </SettingsRow> */}
            <SettingsRow
              label="Sessions"
              desc="Manage your active sessions and devices"
              onClick={openSessionsModal}
            >
              <Laptop size={16} color="#1fd1a8" />
            </SettingsRow>
            <SettingsRow
              label="Data Export"
              desc="Download a copy of all your data"
              border={false}
              onClick={openExportModal}
            >
              <Download size={16} color="#7c5cfc" />
            </SettingsRow>
          </SettingsCard>

          {/* Modals */}
          <PrivacyModal
            isOpen={activeModal === "blocked"}
            onClose={closeModal}
            title="Blocked Users"
            icon={Ban}
            accent="#e84545"
          >
            <BlockedUsersPage inModal onClose={closeModal} />
          </PrivacyModal>

          <PrivacyModal
            isOpen={activeModal === "history"}
            onClose={closeModal}
            title="Watch History"
            icon={History}
            accent="#f5c518"
          >
            <WatchHistoryPage inModal onClose={closeModal} />
          </PrivacyModal>

          <PrivacyModal
            isOpen={activeModal === "sessions"}
            onClose={closeModal}
            title="Sessions"
            icon={Laptop}
            accent="#1fd1a8"
          >
            <SessionsPage inModal onClose={closeModal} />
          </PrivacyModal>

          <PrivacyModal
            isOpen={activeModal === "export"}
            onClose={closeModal}
            title="Data Export"
            icon={Download}
            accent="#7c5cfc"
          >
            <DataExportPage inModal onClose={closeModal} />
          </PrivacyModal>

          <ToastContainer toasts={toastApi.toasts} onDismiss={toastApi.dismiss} />
        </>
      )}
    </div>
  );
}

// ── PrivacyModal ──────────────────────────────────────────────────────────────
const PrivacyModal = memo(function PrivacyModal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  accent,
  children,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#12121e",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 700,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: `${accent}08`,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: `${accent}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={18} color={accent} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 18,
                letterSpacing: 1.5,
                color: "#f0f0f8",
              }}
            >
              {title}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(240,240,248,0.6)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ flex: 1, overflow: "auto", padding: 20 }}>{children}</div>
      </div>
    </div>
  );
});
