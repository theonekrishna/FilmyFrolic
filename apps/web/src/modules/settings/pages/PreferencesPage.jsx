import { Bell, ExternalLink, ShieldAlert } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
import { ToastContainer, useToast } from "../../../shared/Toast";
import SelectRow from "../components/SelectRow";
import SettingsCard from "../components/SettingsCard";
import SettingsLoader from "../components/SettingsLoader";
import SettingsRow from "../components/SettingsRow";
import SettingsToggle from "../components/SettingsToggle";
import { settingsService } from "../services/settingsService";
import { settingsCache, CACHE_KEYS } from "../utils/settingsCache";

export default function PreferencesPage() {
  const ACCENT = "#1fd1a8";
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const toastApi = useToast();
  // const navigate = useNavigate();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      // Check cache first
      const cached = settingsCache.get(CACHE_KEYS.PREFERENCES);
      if (cached) {
        setLoading(false);
        setPrefs(cached?.preferences || cached);
      } else {
        setLoading(true);
      }

      // Fetch fresh data
      const res = await settingsCache.fetchWithCache(
        CACHE_KEYS.PREFERENCES,
        () => settingsService.getPreferences(),
        { staleWhileRevalidate: true }
      );
      setPrefs(res?.preferences || res);
    } catch (err) {
      console.error("Error loading preferences:", err);
      toastApi.error("Error", "Failed to load preferences", 3000);
    } finally {
      setLoading(false);
    }
  }, [toastApi]);

  const handleUpdate = useCallback(
    async (path, value) => {
      setPrefs((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        if (path.includes(".")) {
          const [p1, p2] = path.split(".");
          updated[p1][p2] = value;
        } else {
          updated[path] = value;
        }

        settingsService
          .updatePreferences(updated)
          .then(() => {
            toastApi.success(
              "Preferences Saved",
              "Your changes have been updated successfully.",
              3000
            );
          })
          .catch((err) => {
            console.error("Error updating preferences:", err);
            toastApi.error("Error", "Failed to save preferences", 3000);
            // Revert on error
            loadPreferences();
          });

        return updated;
      });
    },
    [toastApi, loadPreferences]
  );

  // Stable per-field handlers so memoized rows don't re-render unnecessarily
  // const handleSpoilerProtection = useCallback(
  //   (val) => handleUpdate("spoilerProtection", val),
  //   [handleUpdate],
  // );
  // const handleAutoSpoilerHide = useCallback(
  //   (val) => handleUpdate("autoSpoilerHide", val),
  //   [handleUpdate],
  // );
  const handleNewReleases = useCallback(
    (val) => handleUpdate("notifications.newReleases", val),
    [handleUpdate]
  );
  const handleReviews = useCallback(
    (val) => handleUpdate("notifications.reviews", val),
    [handleUpdate]
  );
  const handleDiscussions = useCallback(
    (val) => handleUpdate("notifications.discussions", val),
    [handleUpdate]
  );
  const handleLiveRooms = useCallback(
    (val) => handleUpdate("notifications.liveRooms", val),
    [handleUpdate]
  );
  const handleWeeklyDigest = useCallback(
    (val) => handleUpdate("notifications.weeklyDigest", val),
    [handleUpdate]
  );
  const handleLanguage = useCallback((val) => handleUpdate("language", val), [handleUpdate]);
  const handleContentRating = useCallback(
    (val) => handleUpdate("contentRating", val),
    [handleUpdate]
  );
  // const handleMatureContent = useCallback(
  //   (val) => handleUpdate("matureContent", val),
  //   [handleUpdate],
  // );
  // const handleNavigateHistory = useCallback(
  //   () => navigate("/user/history"),
  //   [navigate],
  // );

  if (loading || !prefs) {
    return <SettingsLoader text="Loading preferences..." />;
  }

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 20,
          padding: "16px 20px",
          background: `#f5c51808`,
          border: `1px solid #f5c51818`,
          borderRadius: 14,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `#f5c51818`,
            border: `1px solid #f5c51830`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Bell size={20} color="#f5c518" />
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
            Preferences
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              color: "rgba(240,240,248,0.38)",
              marginTop: 2,
            }}
          >
            Notifications, spoilers, language, filters
          </div>
        </div>
      </div>

      {/* Spoiler Protection */}
      {/* <div
        style={{
          background: `linear-gradient(135deg, rgba(31,209,168,0.1), rgba(59,130,246,0.06))`,
          border: `1px solid ${ACCENT}28`,
          borderRadius: 14,
          padding: "20px 22px",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 12,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 5,
              }}
            >
              <ShieldAlert size={18} color={ACCENT} />
              <span
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: 18,
                  letterSpacing: 1.5,
                  color: "#f0f0f8",
                }}
              >
                Spoiler Protection
              </span>
              <span
                style={{
                  background: `${ACCENT}20`,
                  border: `1px solid ${ACCENT}35`,
                  borderRadius: 100,
                  padding: "2px 9px",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 9,
                  fontWeight: 800,
                  color: ACCENT,
                  letterSpacing: 0.8,
                }}
              >
                RECOMMENDED
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                color: "rgba(240,240,248,0.55)",
                margin: 0,
                lineHeight: 1.55,
                fontWeight: 300,
                maxWidth: 440,
              }}
            >
              Hide content for episodes and films you haven't watched yet.
            </p>
          </div>
          <SettingsToggle
            value={prefs.spoilerProtection}
            onChange={handleSpoilerProtection}
            accent={ACCENT}
          />
        </div>

        {prefs.spoilerProtection && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingTop: 12,
              borderTop: `1px solid ${ACCENT}18`,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#f0f0f8",
                }}
              >
                Auto-hide untagged spoilers
              </div>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  color: "rgba(240,240,248,0.38)",
                  fontWeight: 300,
                  marginTop: 3,
                }}
              >
                Also hide content not explicitly tagged but detected by AI
              </div>
            </div>
            <SettingsToggle
              value={prefs.autoSpoilerHide}
              onChange={handleAutoSpoilerHide}
              accent={ACCENT}
            />
          </div>
        )}

        <button
          onClick={handleNavigateHistory}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 12,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            fontSize: 12,
            color: ACCENT,
            padding: 0,
          }}
        >
          <ExternalLink size={12} /> Manage your watch progress →
        </button>
      </div> */}

      <SettingsCard title="Notifications">
        <SettingsRow label="New Releases" desc="Titles on your watchlist drop">
          <SettingsToggle
            value={!!prefs?.notifications?.newReleases}
            onChange={handleNewReleases}
            accent="#f5c518"
          />
        </SettingsRow>
        <SettingsRow label="Review Reactions" desc="Likes and replies to your reviews">
          <SettingsToggle
            value={!!prefs?.notifications?.reviews}
            onChange={handleReviews}
            accent="#f5c518"
          />
        </SettingsRow>
        <SettingsRow label="Discussion Replies" desc="Thread activity you joined">
          <SettingsToggle
            value={!!prefs?.notifications?.discussions}
            onChange={handleDiscussions}
            accent="#f5c518"
          />
        </SettingsRow>
        <SettingsRow label="Live Room Alerts" desc="When someone you follow goes live">
          <SettingsToggle
            value={!!prefs?.notifications?.liveRooms}
            onChange={handleLiveRooms}
            accent="#f5c518"
          />
        </SettingsRow>
        <SettingsRow label="Weekly Digest" desc="Personalised film recommendations" border={false}>
          <SettingsToggle
            value={!!prefs?.notifications?.weeklyDigest}
            onChange={handleWeeklyDigest}
            accent="#f5c518"
          />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard title="Language & Content">
        <SelectRow
          label="Default Language"
          options={[
            "English (US)",
            //"English (UK)",
            //"Spanish",
            //"French",
            //"Japanese",
          ]}
          value={prefs.language}
          onChange={handleLanguage}
        />
        <SelectRow
          label="Content Filters"
          options={["All ages", "PG-13 & below", "PG & below", "G only"]}
          value={prefs.contentRating}
          onChange={handleContentRating}
          border={false}
        />
      </SettingsCard>

      {/* <SettingsCard title="">
        <SettingsRow
          label="Mature Content"
          desc="Show adult-rated titles in browse and recommendations"
          border={false}
        >
          <SettingsToggle
            value={prefs.matureContent}
            onChange={handleMatureContent}
            accent="#e84545"
          />
        </SettingsRow>
      </SettingsCard> */}

      <ToastContainer toasts={toastApi.toasts} onDismiss={toastApi.dismiss} />
    </div>
  );
}
