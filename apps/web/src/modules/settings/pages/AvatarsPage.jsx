import { Camera, Check, User } from "lucide-react";
import { useEffect, useState, useCallback, memo } from "react";
import { ToastContainer, useToast } from "../../../shared/Toast";
import { settingsService } from "../services/settingsService";
import { settingsCache, CACHE_KEYS } from "../utils/settingsCache";

const ACCENT = "#1fd1a8";

// ── AvatarGridItem (memoized) ────────────────────────────────────────────────
const AvatarGridItem = memo(function AvatarGridItem({ avatar, isSelected, onSelect }) {
  const handleClick = useCallback(() => onSelect(avatar.id), [onSelect, avatar.id]);

  return (
    <button
      onClick={handleClick}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1",
        borderRadius: 16,
        overflow: "hidden",
        border: `3px solid ${isSelected ? ACCENT : "transparent"}`,
        background: "#1a1a2a",
        cursor: "pointer",
        transition: "all 0.2s",
        padding: 0,
      }}
    >
      {avatar.url ? (
        <img
          src={avatar.url}
          alt={`Avatar ${avatar.id}`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={20} color="rgba(240,240,248,0.3)" />
        </div>
      )}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: ACCENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={12} color="#080810" />
        </div>
      )}
    </button>
  );
});

export default function AvatarsPage() {
  const toastApi = useToast();

  const [avatars, setAvatars] = useState([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [currentAvatarId, setCurrentAvatarId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadAvatars = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch avatars using cache
      const res = await settingsCache.fetchWithCache(CACHE_KEYS.AVATARS, () =>
        settingsService.getAvatars()
      );
      const avatarsData = res?.avatars || res;
      setAvatars(Array.isArray(avatarsData) ? avatarsData : []);

      // Get current profile from cache (avoids redundant API call)
      const cachedAccount = settingsCache.get(CACHE_KEYS.ACCOUNT);
      if (cachedAccount) {
        const profile = cachedAccount?.profile || cachedAccount;
        if (profile?.avatar_preset) {
          setCurrentAvatarId(profile.avatar_preset);
          setSelectedAvatarId(profile.avatar_preset);
        }
      }
    } catch (err) {
      console.error("Error loading avatars:", err);
      toastApi.error("Error", "Failed to load avatars", 3000);
    } finally {
      setLoading(false);
    }
  }, [toastApi]);

  useEffect(() => {
    loadAvatars();
  }, [loadAvatars]);

  const handleSelectAvatar = useCallback((id) => {
    setSelectedAvatarId(id);
  }, []);

  const handleSaveAvatar = useCallback(async () => {
    if (selectedAvatarId === currentAvatarId) return;

    try {
      setSaving(true);
      console.log("Sending avatar update:", {
        avatar_preset: Number(selectedAvatarId),
      });
      await settingsService.updateProfile({
        avatar_preset: Number(selectedAvatarId),
      });
      setCurrentAvatarId(selectedAvatarId);
      toastApi.success(
        "Avatar Updated",
        "Your profile avatar has been changed successfully.",
        3000
      );
    } catch (err) {
      console.error("Error updating avatar:", err);
      toastApi.error("Error", err.message || "Failed to update avatar", 3000);
    } finally {
      setSaving(false);
    }
  }, [selectedAvatarId, currentAvatarId, toastApi]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-[#f5c518] rounded-full animate-spin"></div>
      </div>
    );
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
          <Camera size={20} color={ACCENT} />
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
            Avatars
          </div>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 12,
              color: "rgba(240,240,248,0.38)",
              marginTop: 2,
            }}
          >
            Choose a preset avatar for your profile
          </div>
        </div>
      </div>

      {/* Avatar Grid */}
      <div
        style={{
          background: "#12121e",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: 24,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 16,
          }}
        >
          {avatars.map((avatar) => (
            <AvatarGridItem
              key={avatar.id}
              avatar={avatar}
              isSelected={selectedAvatarId === avatar.id}
              onSelect={handleSelectAvatar}
            />
          ))}
        </div>

        {avatars.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "rgba(240,240,248,0.4)",
            }}
          >
            <Camera size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>No avatars available</p>
          </div>
        )}

        {/* Save Button */}
        {selectedAvatarId !== currentAvatarId && (
          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleSaveAvatar}
              disabled={saving}
              style={{
                padding: "12px 24px",
                background: ACCENT,
                border: "none",
                borderRadius: 10,
                color: "#080810",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Saving..." : "Save Avatar"}
            </button>
          </div>
        )}
      </div>

      <ToastContainer toasts={toastApi.toasts} onDismiss={toastApi.dismiss} />
    </div>
  );
}
