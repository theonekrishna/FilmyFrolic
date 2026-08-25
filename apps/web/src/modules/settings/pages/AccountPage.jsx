import {
  User,
  ChevronRight,
  Camera,
  Upload,
  Check,
  QrCode,
  Key,
  Shield,
  Loader2,
} from "lucide-react";
import { useEffect, useState, useRef, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, useToast } from "../../../shared/Toast";
import EditModal from "../components/EditModal";
import SettingsLoader from "../components/SettingsLoader";
import SettingsCard from "../components/SettingsCard";
import SettingsRow from "../components/SettingsRow";
import SettingsToggle from "../components/SettingsToggle";
import { settingsService } from "../services/settingsService";
import { settingsCache, CACHE_KEYS } from "../utils/settingsCache";
import { supabase } from "../../../utils/supabaseClient";
import { useProfile } from "../../../context/Profilecontext";
import QRCode from "qrcode";

// ─── Helper: tell the sidebar to re-fetch the profile ───────────────────────
function notifySidebar() {
  window.dispatchEvent(new Event("ff-profile-updated"));
}

// Memoized preset avatar renderer to avoid IIFE in JSX
function PresetAvatar({ avatarPreset, avatars }) {
  return useMemo(() => {
    const currentAvatar = avatars.find((a) => a.id === parseInt(avatarPreset));
    if (!currentAvatar) return <User size={40} color="#fff" />;
    if (currentAvatar.image_url || currentAvatar.url || currentAvatar.avatar_url) {
      return (
        <img
          src={currentAvatar.image_url || currentAvatar.url || currentAvatar.avatar_url}
          alt="Current"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      );
    }
    if (currentAvatar.initials) {
      return (
        <span
          style={{
            fontFamily: "'Bebas Neue', cursive",
            fontSize: 32,
            color: "#fff",
          }}
        >
          {currentAvatar.initials}
        </span>
      );
    }
    return <User size={40} color="#fff" />;
  }, [avatarPreset, avatars]);
}

// ─── Avatar grid item (memoized) ────────────────────────────────────────────
const AvatarGridItem = memo(function AvatarGridItem({ avatar, isSelected, disabled, onSelect }) {
  const handleClick = useCallback(() => onSelect(avatar.id), [onSelect, avatar.id]);

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        width: "100%",
        aspectRatio: "1",
        borderRadius: 12,
        border: `2px solid ${isSelected ? "#1fd1a8" : "transparent"}`,
        background: isSelected ? "rgba(31,209,168,0.15)" : "rgba(255,255,255,0.05)",
        padding: 2,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s ease",
        transform: isSelected ? "scale(1.08)" : "scale(1)",
      }}
      title={avatar.name || "Avatar"}
    >
      {avatar.image_url || avatar.url || avatar.avatar_url ? (
        <img
          src={avatar.image_url || avatar.url || avatar.avatar_url}
          alt={avatar.name}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 9,
            objectFit: "cover",
          }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : avatar.gradient ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 9,
            background: avatar.gradient,
          }}
        />
      ) : avatar.initials ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 9,
            background: "#2a2a3a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 14,
              color: "#fff",
            }}
          >
            {avatar.initials}
          </span>
        </div>
      ) : (
        <User size={20} color="#1fd1a8" />
      )}
    </button>
  );
});

// ─── 2FA Setup Modal ────────────────────────────────────────────────────────
const TwoFAModal = memo(function TwoFAModal({ isOpen, onClose, enrollData, onVerified }) {
  const ACCENT = "#1fd1a8";
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setOtp("");
      setError("");
      setQrDataUrl("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!enrollData?.totp?.uri) return;
    QRCode.toDataURL(enrollData.totp.uri, {
      width: 180,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [enrollData]);

  const handleOtpChange = useCallback((e) => {
    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
  }, []);

  const handleGoToStep2 = useCallback(() => setStep(2), []);

  const handleBackToStep1 = useCallback(() => {
    setStep(1);
    setError("");
    setOtp("");
  }, []);

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }
    try {
      setVerifying(true);
      setError("");
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollData.id,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollData.id,
        challengeId: challengeData.id,
        code: otp,
      });
      if (verifyError) throw verifyError;

      onVerified();
      onClose();
    } catch (err) {
      setError(err.message || "Invalid code. Please try again.");
    } finally {
      setVerifying(false);
    }
  }, [otp, enrollData, onVerified, onClose]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleVerify();
    },
    [handleVerify]
  );

  if (!isOpen || !enrollData) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
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
          borderRadius: 18,
          width: "100%",
          maxWidth: 440,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: `${ACCENT}08`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: `${ACCENT}20`,
              border: `1px solid ${ACCENT}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={20} color={ACCENT} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: 18,
                letterSpacing: 1.5,
                color: "#f0f0f8",
              }}
            >
              Enable Two-Factor Auth
            </div>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 12,
                color: "rgba(240,240,248,0.4)",
              }}
            >
              Step {step} of 2 — {step === 1 ? "Scan QR Code" : "Verify Code"}
            </div>
          </div>
        </div>

        {step === 1 && (
          <div
            style={{
              padding: 28,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 200,
                height: 200,
                flexShrink: 0,
                borderRadius: 14,
                background: "#fff",
                padding: 10,
                boxSizing: "border-box",
                overflow: "hidden",
                boxShadow: `0 0 0 4px ${ACCENT}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Scan this QR code"
                  style={{ width: "100%", height: "100%", display: "block" }}
                />
              ) : enrollData.totp?.uri ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      border: `3px solid ${ACCENT}`,
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <QrCode size={60} color="#080810" />
                  <span style={{ fontSize: 11, color: "#666", textAlign: "center" }}>
                    QR unavailable
                  </span>
                </div>
              )}
            </div>

            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                color: "rgba(240,240,248,0.6)",
                textAlign: "center",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>

            {enrollData.totp?.secret && (
              <div
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "12px 16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Key size={14} color={ACCENT} />
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 11,
                      color: ACCENT,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                    }}
                  >
                    MANUAL ENTRY KEY
                  </span>
                </div>
                <code
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    letterSpacing: 2,
                    color: "#f0f0f8",
                    wordBreak: "break-all",
                    display: "block",
                  }}
                >
                  {enrollData.totp.secret}
                </code>
              </div>
            )}

            <button
              onClick={handleGoToStep2}
              style={{
                width: "100%",
                padding: "13px 0",
                background: ACCENT,
                border: "none",
                borderRadius: 10,
                color: "#080810",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
            >
              I've scanned it → Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div
            style={{
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                color: "rgba(240,240,248,0.6)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Enter the 6-digit code currently shown in your authenticator app to confirm setup.
            </p>
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  color: "rgba(240,240,248,0.5)",
                  marginBottom: 8,
                }}
              >
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                autoFocus
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  background: "#080810",
                  border: `1px solid ${error ? "#e84545" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 10,
                  color: "#f0f0f8",
                  fontFamily: "monospace",
                  fontSize: 22,
                  letterSpacing: 8,
                  textAlign: "center",
                  outline: "none",
                  transition: "border 0.2s",
                  boxSizing: "border-box",
                }}
                onKeyDown={handleKeyDown}
              />
              {error && (
                <p
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 12,
                    color: "#e84545",
                    marginTop: 8,
                  }}
                >
                  {error}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleBackToStep1}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  color: "rgba(240,240,248,0.6)",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleVerify}
                disabled={verifying || otp.length !== 6}
                style={{
                  flex: 2,
                  padding: "12px 0",
                  background: ACCENT,
                  border: "none",
                  borderRadius: 10,
                  color: "#080810",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: verifying || otp.length !== 6 ? "not-allowed" : "pointer",
                  opacity: verifying || otp.length !== 6 ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {verifying ? "Verifying..." : "Verify & Enable"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Main AccountPage ────────────────────────────────────────────────────────
export default function AccountPage() {
  const ACCENT = "#1fd1a8";
  const toastApi = useToast();
  const { updateSharedProfile } = useProfile();

  const [profile, setProfile] = useState({
    displayName: "",
    avatar: "",
    bio: "",
    email: "",
  });
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    lastPasswordChange: "Never",
    hasPassword: true,
  });
  const [connectedApps, setConnectedApps] = useState({
    google: null,
    apple: null,
    letterboxd: null,
  });

  const [avatars, setAvatars] = useState([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [currentAvatarId, setCurrentAvatarId] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const fileInputRef = useRef(null);

  const [twoFAModalOpen, setTwoFAModalOpen] = useState(false);
  const [twoFAEnrollData, setTwoFAEnrollData] = useState(null);
  const [twoFALoading, setTwoFALoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAccountData();
    loadAvatars();
  }, []);

  const loadAvatars = useCallback(async () => {
    try {
      const data = await settingsCache.fetchWithCache(CACHE_KEYS.AVATARS, () =>
        settingsService.getAvatars()
      );
      const avatarsData = data?.avatars || data?.data || data;
      setAvatars(Array.isArray(avatarsData) ? avatarsData : []);
    } catch (err) {
      console.error("Error loading avatars:", err);
      setAvatars([]);
    }
  }, []);

  const handleAvatarSelect = useCallback((id) => setSelectedAvatarId(id), []);

  const handleSaveAvatar = useCallback(async () => {
    if (selectedAvatarId === currentAvatarId) return;
    try {
      setAvatarLoading(true);
      setAvatarError(null);
      const selectedAvatar = avatars.find((avatar) => avatar.id === Number(selectedAvatarId));
      const avatarUrl =
        selectedAvatar?.image_url || selectedAvatar?.url || selectedAvatar?.avatar_url || null;
      await settingsService.updateProfile({
        avatar_preset: Number(selectedAvatarId),
        avatar_url: avatarUrl,
        initials: null,
        gradient: null,
      });
      setCurrentAvatarId(selectedAvatarId);
      settingsCache.invalidate(CACHE_KEYS.ACCOUNT);
      setProfile((prev) => ({
        ...prev,
        avatar_preset: selectedAvatarId,
        avatar_url: avatarUrl,
        avatar: avatarUrl,
        initials: null,
        gradient: null,
      }));
      // Push to ProfileContext so Sidebar updates instantly
      updateSharedProfile({
        avatar_url: avatarUrl,
        avatar_preset: selectedAvatarId,
        initials: null,
        gradient: null,
      });
      notifySidebar();
      toastApi.success("Avatar Updated", "Your profile avatar has been changed.", 3000);
    } catch (err) {
      console.error("Error updating avatar:", err);
      setAvatarError({ type: "PRESET_SAVE_ERROR", message: err.message });
      toastApi.error("Error", err.message || "Failed to update avatar", 3000);
    } finally {
      setAvatarLoading(false);
    }
  }, [selectedAvatarId, currentAvatarId, avatars, updateSharedProfile, toastApi]);

  const handleFileUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toastApi.error("Invalid File", "Only JPEG, PNG, and WebP images are allowed.", 3000);
        return;
      }
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        toastApi.error("File Too Large", "Image must be 2MB or smaller.", 3000);
        return;
      }
      try {
        setAvatarLoading(true);
        setAvatarError(null);
        const res = await settingsService.uploadAvatarFile(file);
        const avatarUrl = res?.avatar_url || res?.data?.avatar_url;
        if (avatarUrl) {
          setProfile((prev) => ({
            ...prev,
            avatar_url: avatarUrl,
            avatar: avatarUrl,
            avatar_preset: null,
            initials: null,
            gradient: null,
          }));
          setSelectedAvatarId(null);
          setCurrentAvatarId(null);
          settingsCache.invalidate(CACHE_KEYS.ACCOUNT);
          // Push to ProfileContext so Sidebar updates instantly
          updateSharedProfile({
            avatar_url: avatarUrl,
            avatar_preset: null,
            initials: null,
            gradient: null,
          });
          notifySidebar();
          toastApi.success("Avatar Uploaded", "Your profile picture has been updated.", 3000);
        }
      } catch (err) {
        console.error("Error uploading avatar:", err);
        setAvatarError({ type: "AVATAR_UPLOAD_ERROR", message: err.message });
        toastApi.error(
          "Upload Failed",
          err.message || "Failed to upload avatar. Please try again.",
          4000
        );
      } finally {
        setAvatarLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [updateSharedProfile, toastApi]
  );

  const loadAccountData = useCallback(async () => {
    try {
      const cachedAccount = settingsCache.get(CACHE_KEYS.ACCOUNT);
      if (cachedAccount) {
        setLoading(false);
        const accountData = cachedAccount?.profile || cachedAccount;
        if (accountData) {
          setProfile((prev) => ({
            ...prev,
            id: accountData.id || "",
            displayName: accountData.name || accountData.username || "",
            username: accountData.username || "",
            name: accountData.name || "",
            avatar: accountData.avatar_url || "",
            avatar_url: accountData.avatar_url || "",
            avatar_preset: accountData.avatar_preset || null,
            bio: accountData.bio || "",
            email: accountData.email || "",
            is_deactivated: accountData.is_deactivated || false,
          }));
          if (accountData.avatar_preset) {
            setCurrentAvatarId(accountData.avatar_preset);
            setSelectedAvatarId(accountData.avatar_preset);
          }
        }
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await settingsCache.fetchWithCache(
        CACHE_KEYS.ACCOUNT,
        () => settingsService.getAccount(),
        { staleWhileRevalidate: true }
      );
      const accountData = data?.profile || data;
      if (accountData) {
        setProfile({
          id: accountData.id || "",
          displayName: accountData.name || accountData.username || "",
          username: accountData.username || "",
          name: accountData.name || "",
          avatar: accountData.avatar_url || "",
          avatar_url: accountData.avatar_url || "",
          avatar_preset: accountData.avatar_preset || null,
          bio: accountData.bio || "",
          email: accountData.email || "",
          is_deactivated: accountData.is_deactivated || false,
        });
        if (accountData.avatar_preset) {
          setCurrentAvatarId(accountData.avatar_preset);
          setSelectedAvatarId(accountData.avatar_preset);
        }
      }
      try {
        const res = await settingsCache.fetchWithCache(CACHE_KEYS.TWO_FA_STATUS, () =>
          settingsService.get2FAStatus()
        );
        const twoFAData = res?.data || res;
        setSecurity((prev) => ({
          ...prev,
          twoFactorEnabled: !!twoFAData?.enabled,
        }));
      } catch (err) {
        console.log("2FA fetch error (non-critical):", err.message);
      }
      try {
        const res = await settingsCache.fetchWithCache(CACHE_KEYS.CONNECTED_ACCOUNTS, () =>
          settingsService.getConnectedAccounts()
        );
        const connectedData = res?.accounts || res;
        const hasPassword = res?.hasPassword ?? true;
        setSecurity((prev) => ({ ...prev, hasPassword }));
        if (connectedData && Array.isArray(connectedData)) {
          const connected = { google: null, apple: null, letterboxd: null };
          connectedData.forEach((account) => {
            if (account.provider === "google") connected.google = account.email;
            if (account.provider === "apple") connected.apple = account.email;
            if (account.provider === "letterboxd") connected.letterboxd = account.email;
          });
          setConnectedApps(connected);
        }
      } catch (err) {
        console.log("Connected accounts fetch error (non-critical):", err.message);
      }
    } catch (err) {
      console.error("Error loading account data:", err);
      setError(err.message);
      toastApi.error("Error", "Failed to load account data", 3000);
    } finally {
      setLoading(false);
    }
  }, [toastApi]);

  const handleOpenModal = useCallback(
    (type, currentValue) => {
      const resolvedType = type === "password" && !security.hasPassword ? "setPassword" : type;
      setEditValue(currentValue);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      setModalOpen(resolvedType);
    },
    [security.hasPassword]
  );

  const handleSaveModal = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      if (modalOpen === "displayName") {
        const response = await settingsService.updateProfile({
          name: editValue,
        });
        const updatedProfile = response?.profile || response;
        setProfile((prev) => ({
          ...prev,
          displayName: updatedProfile.name || editValue,
          name: updatedProfile.name || editValue,
        }));
        settingsCache.invalidate(CACHE_KEYS.ACCOUNT);
        // Push to ProfileContext so Sidebar updates instantly
        updateSharedProfile({ displayName: updatedProfile.name || editValue });
        notifySidebar();
        toastApi.success("Success", "Name updated", 2000);
      } else if (modalOpen === "username") {
        const response = await settingsService.updateProfile({
          username: editValue,
        });
        const updatedProfile = response?.profile || response;
        setProfile((prev) => ({
          ...prev,
          username: updatedProfile.username || editValue,
        }));
        settingsCache.invalidate(CACHE_KEYS.ACCOUNT);
        // Push to ProfileContext so Sidebar updates instantly
        updateSharedProfile({ username: updatedProfile.username || editValue });
        notifySidebar();
        toastApi.success("Success", "Username updated", 2000);
      } else if (modalOpen === "bio") {
        const response = await settingsService.updateProfile({
          bio: editValue,
        });
        const updatedProfile = response?.profile || response;
        setProfile((prev) => ({
          ...prev,
          bio: updatedProfile.bio || editValue,
        }));
        toastApi.success("Success", "Bio updated", 2000);
      } else if (modalOpen === "password") {
        if (!currentPassword) {
          setError("Current password is required");
          return;
        }
        if (newPassword !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        if (newPassword.length < 8) {
          setError("Password must be at least 8 characters");
          return;
        }
        await settingsService.changePassword(currentPassword, newPassword);
        setSecurity((prev) => ({ ...prev, lastPasswordChange: "Just now" }));
        toastApi.success("Success", "Password changed successfully", 2000);
      } else if (modalOpen === "setPassword") {
        if (newPassword !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        if (newPassword.length < 8) {
          setError("Password must be at least 8 characters");
          return;
        }
        await settingsService.setPassword(newPassword);
        setSecurity((prev) => ({
          ...prev,
          hasPassword: true,
          lastPasswordChange: "Just now",
        }));
        settingsCache.invalidate(CACHE_KEYS.CONNECTED_ACCOUNTS);
        toastApi.success("Success", "Password set successfully", 2000);
      } else if (modalOpen === "deactivate") {
        await settingsService.deactivateAccount();
        setProfile((prev) => ({ ...prev, is_deactivated: true }));
        toastApi.success("Success", "Account deactivated.", 3000);
      } else if (modalOpen === "reactivate") {
        await settingsService.reactivateAccount();
        setProfile((prev) => ({ ...prev, is_deactivated: false }));
        toastApi.success("Success", "Account reactivated.", 3000);
      } else if (modalOpen === "delete") {
        await settingsService.deleteAccount();
        toastApi.success("Success", "Account deleted permanently", 2000);
        setTimeout(async () => {
          try {
            await supabase.auth.signOut();
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            settingsCache.invalidate(CACHE_KEYS.ACCOUNT);
            settingsCache.invalidate(CACHE_KEYS.TWO_FA_STATUS);
            settingsCache.invalidate(CACHE_KEYS.CONNECTED_ACCOUNTS);
            window.location.reload();
          } catch (error) {
            console.error("Logout cleanup failed:", error);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.reload();
          }
        }, 2000);
      }
      setModalOpen(null);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "An error occurred");
      toastApi.error("Error", err.message || "Operation failed", 3000);
    } finally {
      setIsSaving(false);
    }
  }, [
    modalOpen,
    editValue,
    currentPassword,
    newPassword,
    confirmPassword,
    updateSharedProfile,
    toastApi,
  ]);

  const handleToggle2FA = useCallback(
    async (enabled) => {
      if (twoFALoading) return;
      try {
        setTwoFALoading(true);
        if (enabled) {
          await settingsService.prepare2FA();
          const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
            factorType: "totp",
          });
          if (enrollError) throw enrollError;
          setTwoFAEnrollData(enrollData);
          setTwoFAModalOpen(true);
        } else {
          const res = await settingsService.get2FAStatus();
          const twoFAData = res?.data || res;
          if (!twoFAData?.enabled) {
            setSecurity((prev) => ({ ...prev, twoFactorEnabled: false }));
            return;
          }
          const factorId =
            twoFAData?.factor_id || twoFAData?.factors?.[0]?.id || twoFAData?.all_factors?.[0]?.id;
          if (!factorId) throw new Error("Could not find 2FA factor to disable");
          await settingsService.disable2FA(factorId);
          settingsCache.invalidate(CACHE_KEYS.TWO_FA_STATUS);
          setSecurity((prev) => ({ ...prev, twoFactorEnabled: false }));
          toastApi.success("2FA Disabled", "Two-factor authentication has been turned off.", 3000);
        }
      } catch (err) {
        console.error("Error toggling 2FA:", err);
        toastApi.error("Error", err.message || "Failed to toggle 2FA", 3000);
        try {
          const res = await settingsService.get2FAStatus();
          const twoFAData = res?.data || res;
          setSecurity((prev) => ({
            ...prev,
            twoFactorEnabled: !!twoFAData?.enabled,
          }));
        } catch (e) {
          console.error("Failed to refresh 2FA status:", e);
        }
      } finally {
        if (!enabled) setTwoFALoading(false);
      }
    },
    [twoFALoading, toastApi]
  );

  const handle2FAModalClose = useCallback(() => {
    setTwoFAModalOpen(false);
    setTwoFALoading(false);
  }, []);

  const handle2FAVerified = useCallback(() => {
    setSecurity((prev) => ({ ...prev, twoFactorEnabled: true }));
    settingsCache.invalidate(CACHE_KEYS.TWO_FA_STATUS);
    setTwoFALoading(false);
    toastApi.success("2FA Enabled", "Two-factor authentication is now active.", 3000);
  }, [toastApi]);

  const handleConnectProvider = useCallback(
    async (provider) => {
      try {
        const { error } = await supabase.auth.linkIdentity({ provider });
        if (error) toastApi.error("Error", error.message, 3000);
      } catch (err) {
        toastApi.error("Error", err.message || "Failed to connect account", 3000);
      }
    },
    [toastApi]
  );

  const handleUnlinkProvider = useCallback(
    async (provider) => {
      if (!window.confirm(`Unlink ${provider}?`)) return;
      try {
        const res = await settingsService.getConnectedAccounts();
        const connectedData = res?.accounts || res;
        const providerData = connectedData.find((p) => p.provider === provider);
        if (providerData) {
          await settingsService.unlinkOAuthProvider(providerData.identity_id);
          settingsCache.invalidate(CACHE_KEYS.CONNECTED_ACCOUNTS);
          setConnectedApps((prev) => ({ ...prev, [provider]: null }));
          toastApi.success("Success", `${provider} unlinked`, 2000);
        }
      } catch (err) {
        console.error("Error unlinking provider:", err);
        setError(err.message);
        toastApi.error("Error", err.message, 3000);
      }
    },
    [toastApi]
  );

  // ── Stable per-field handlers ──────────────────────────────────────────────
  const handleEditDisplayName = useCallback(
    () => handleOpenModal("displayName", profile.name || ""),
    [handleOpenModal, profile.name]
  );
  const handleEditUsername = useCallback(
    () => handleOpenModal("username", profile.username || ""),
    [handleOpenModal, profile.username]
  );
  const handleEmailClick = useCallback(
    () => toastApi.info("Email Protected", "Contact support to change your email address.", 3000),
    [toastApi]
  );
  const handleEditBio = useCallback(
    () => handleOpenModal("bio", profile.bio || ""),
    [handleOpenModal, profile.bio]
  );
  const handleOpenFilePicker = useCallback(() => fileInputRef.current?.click(), []);
  const handleAvatarLoadError = useCallback(() => setAvatarLoadError(true), []);
  const handlePasswordRowClick = useCallback(
    () => handleOpenModal("password", ""),
    [handleOpenModal]
  );
  const handleGoogleClick = useCallback(
    () => (connectedApps.google ? handleUnlinkProvider("google") : handleConnectProvider("google")),
    [connectedApps.google, handleUnlinkProvider, handleConnectProvider]
  );
  // const handleAppleClick = useCallback(
  //   () =>
  //     connectedApps.apple
  //       ? handleUnlinkProvider("apple")
  //       : handleConnectProvider("apple"),
  //   [connectedApps.apple, handleUnlinkProvider, handleConnectProvider],
  // );
  // const handleLetterboxdClick = useCallback(
  //   () =>
  //     connectedApps.letterboxd
  //       ? handleUnlinkProvider("letterboxd")
  //       : handleConnectProvider("letterboxd"),
  //   [connectedApps.letterboxd, handleUnlinkProvider, handleConnectProvider],
  // );

  // const handleDeactivateClick = useCallback(
  //   () => handleOpenModal("deactivate", ""),
  //   [handleOpenModal],
  // );
  // const handleReactivateClick = useCallback(
  //   () => handleOpenModal("reactivate", ""),
  //   [handleOpenModal],
  // );
  const handleDeleteClick = useCallback(() => handleOpenModal("delete", ""), [handleOpenModal]);
  const handleCloseEditModal = useCallback(() => setModalOpen(null), []);

  const handleEditValueChange = useCallback((e) => setEditValue(e.target.value), []);
  const handleCurrentPasswordChange = useCallback((e) => setCurrentPassword(e.target.value), []);
  const handleNewPasswordChange = useCallback((e) => setNewPassword(e.target.value), []);
  const handleConfirmPasswordChange = useCallback((e) => setConfirmPassword(e.target.value), []);

  const modalTitle = useMemo(() => {
    switch (modalOpen) {
      case "displayName":
        return "Edit Name";
      case "username":
        return "Edit Username";
      case "bio":
        return "Edit Bio";
      case "password":
        return "Change Password";
      case "setPassword":
        return "Set Password";
      case "deactivate":
        return "Deactivate Account";
      case "reactivate":
        return "Reactivate Account";
      case "delete":
        return "Delete Account";
      default:
        return "";
    }
  }, [modalOpen]);

  const saveButtonLabel = useMemo(() => {
    if (isSaving) return "Processing...";
    switch (modalOpen) {
      case "delete":
        return "Delete Permanently";
      case "reactivate":
        return "Reactivate";
      case "deactivate":
        return "Deactivate";
      case "setPassword":
        return "Set Password";
      default:
        return "Save Changes";
    }
  }, [isSaving, modalOpen]);

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <TwoFAModal
        isOpen={twoFAModalOpen}
        onClose={handle2FAModalClose}
        enrollData={twoFAEnrollData}
        onVerified={handle2FAVerified}
      />

      {loading ? (
        <SettingsLoader text="Loading account data..." />
      ) : (
        <>
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
              <User size={20} color={ACCENT} />
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
                Account
              </div>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  color: "rgba(240,240,248,0.38)",
                  marginTop: 2,
                }}
              >
                Profile, password, connected accounts
              </div>
            </div>
          </div>

          <SettingsCard title="Profile">
            <SettingsRow
              label="Edit Name"
              desc={profile.name || "Not set"}
              onClick={handleEditDisplayName}
            />
            <SettingsRow
              label="Username"
              desc={profile.username || "Not set"}
              onClick={handleEditUsername}
            />
            <SettingsRow
              label="Email"
              desc={profile.email || "Not set"}
              onClick={handleEmailClick}
            />
            <SettingsRow
              label="Edit Bio"
              desc={profile.bio || "No bio added"}
              border={false}
              onClick={handleEditBio}
            />
          </SettingsCard>

          <SettingsCard title="Profile Picture">
            <div style={{ padding: "20px 0" }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background:
                      profile.gradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "3px solid #1fd1a8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(31,209,168,0.25)",
                    marginBottom: 16,
                    position: "relative",
                  }}
                >
                  {avatarLoadError ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ fontSize: 32 }}>👤</span>
                    </div>
                  ) : profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Current"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={handleAvatarLoadError}
                    />
                  ) : profile.initials ? (
                    <span
                      style={{
                        fontFamily: "'Bebas Neue', cursive",
                        fontSize: 36,
                        color: "#fff",
                        letterSpacing: 1,
                      }}
                    >
                      {profile.initials}
                    </span>
                  ) : profile.avatar_preset && avatars.length > 0 ? (
                    <PresetAvatar avatarPreset={profile.avatar_preset} avatars={avatars} />
                  ) : (
                    <User size={40} color="#fff" />
                  )}
                  <button
                    onClick={handleOpenFilePicker}
                    disabled={avatarLoading}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "#1fd1a8",
                      border: "3px solid #12121e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: avatarLoading ? "not-allowed" : "pointer",
                      opacity: avatarLoading ? 0.6 : 1,
                      transition: "all 0.2s",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                    title="Upload new photo"
                  >
                    {avatarLoading ? (
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          border: "2px solid rgba(8,8,16,0.3)",
                          borderTopColor: "#080810",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    ) : (
                      <Camera size={14} color="#080810" />
                    )}
                  </button>
                </div>
                <button
                  onClick={handleOpenFilePicker}
                  disabled={avatarLoading}
                  style={{
                    padding: "8px 16px",
                    background: "rgba(31,209,168,0.1)",
                    border: "1px solid rgba(31,209,168,0.3)",
                    borderRadius: 20,
                    color: "#1fd1a8",
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "'Outfit', sans-serif",
                    cursor: avatarLoading ? "not-allowed" : "pointer",
                    opacity: avatarLoading ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.2s",
                    marginBottom: 8,
                  }}
                >
                  <Upload size={14} />
                  Upload Photo
                </button>
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(240,240,248,0.4)",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  Max 2MB • JPG, PNG, WebP
                </span>
              </div>

              {avatars.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "rgba(255,255,255,0.08)",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      color: "rgba(240,240,248,0.4)",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    Or choose preset
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "rgba(255,255,255,0.08)",
                    }}
                  />
                </div>
              )}

              {avatars.length > 0 && (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(6, 1fr)",
                      gap: 10,
                      marginBottom: 20,
                    }}
                  >
                    {avatars.slice(0, 12).map((avatar) => (
                      <AvatarGridItem
                        key={avatar.id}
                        avatar={avatar}
                        isSelected={selectedAvatarId === avatar.id}
                        disabled={avatarLoading}
                        onSelect={handleAvatarSelect}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleSaveAvatar}
                    disabled={
                      avatarLoading ||
                      selectedAvatarId === currentAvatarId ||
                      selectedAvatarId === null
                    }
                    style={{
                      width: "100%",
                      padding: "12px 18px",
                      background:
                        selectedAvatarId === currentAvatarId ? "rgba(255,255,255,0.08)" : "#1fd1a8",
                      border: "none",
                      borderRadius: 10,
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color:
                        selectedAvatarId === currentAvatarId ? "rgba(240,240,248,0.5)" : "#080810",
                      cursor:
                        selectedAvatarId === currentAvatarId || selectedAvatarId === null
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        selectedAvatarId === currentAvatarId ||
                        selectedAvatarId === null ||
                        avatarLoading
                          ? 0.6
                          : 1,
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {avatarLoading ? (
                      <>
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            border: "2px solid rgba(8,8,16,0.3)",
                            borderTopColor: "#080810",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                        Saving...
                      </>
                    ) : selectedAvatarId === currentAvatarId ? (
                      <>
                        <Check size={16} />
                        Current Selection
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Save Selection
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </SettingsCard>

          <SettingsCard title="Password & Security">
            <SettingsRow
              label={security.hasPassword ? "Change Password" : "Set Password"}
              desc={
                security.hasPassword
                  ? `Last changed ${security.lastPasswordChange}`
                  : "Add a password so you can sign in without Google"
              }
              onClick={handlePasswordRowClick}
            />
            <SettingsRow
              label="Two-Factor Authentication"
              desc={
                twoFALoading
                  ? security.twoFactorEnabled
                    ? "Disabling 2FA…"
                    : "Setting up 2FA…"
                  : security.twoFactorEnabled
                    ? "Your account is protected with 2FA"
                    : "Add an extra layer of security"
              }
              value={twoFALoading ? "" : security.twoFactorEnabled ? "On" : "Off"}
              border={false}
            >
              {twoFALoading ? (
                <div
                  style={{
                    width: 42,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Loader2
                    size={18}
                    color={ACCENT}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                </div>
              ) : (
                <SettingsToggle
                  value={security.twoFactorEnabled}
                  onChange={handleToggle2FA}
                  accent={ACCENT}
                />
              )}
            </SettingsRow>
          </SettingsCard>

          <SettingsCard title="Connected Accounts">
            <SettingsRow
              label="Google"
              desc={
                connectedApps.google
                  ? `Connected as ${connectedApps.google}`
                  : "Connect your Google account"
              }
              value={connectedApps.google ? "Unlink" : "Connect"}
              onClick={handleGoogleClick}
            />

            {/* <SettingsRow
              label="Apple ID"
              desc={
                connectedApps.apple
                  ? `Connected as ${connectedApps.apple}`
                  : "Not connected"
              }
              value={connectedApps.apple ? "Unlink" : "Connect"}
              onClick={handleAppleClick}
            /> */}

            {/* <SettingsRow
              label="Letterboxd"
              desc="Sync your Letterboxd diary"
              value={connectedApps.letterboxd ? "Unlink" : "Connect"}
              border={false}
              onClick={handleLetterboxdClick}
            /> */}
          </SettingsCard>

          <SettingsCard title="Danger Zone">
            {/* {profile.is_deactivated ? (
              <SettingsRow
                label="Reactivate Account"
                desc="Enable your account again"
                onClick={handleReactivateClick}
              />
            ) : (
              <SettingsRow
                label="Deactivate Account"
                desc="Temporarily disable your account"
                danger
                onClick={handleDeactivateClick}
              />
            )} */}
            <SettingsRow
              label="Delete Account"
              desc="Permanently remove all data — cannot be undone"
              danger
              border={false}
              onClick={handleDeleteClick}
            />
          </SettingsCard>

          <EditModal isOpen={!!modalOpen} onClose={handleCloseEditModal} title={modalTitle}>
            <div className="space-y-4">
              {modalOpen === "password" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={handleCurrentPasswordChange}
                      className="w-full bg-[#080810] border border-[#1e212b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#1fd1a8] transition-colors"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      className="w-full bg-[#080810] border border-[#1e212b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#1fd1a8] transition-colors"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      className="w-full bg-[#080810] border border-[#1e212b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#1fd1a8] transition-colors"
                      placeholder="Confirm new password"
                    />
                  </div>
                </>
              ) : modalOpen === "setPassword" ? (
                <>
                  <p className="text-gray-400 text-sm">
                    Create a password so you can also sign in with your email address, without
                    needing Google.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                      className="w-full bg-[#080810] border border-[#1e212b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#1fd1a8] transition-colors"
                      placeholder="At least 8 characters"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      className="w-full bg-[#080810] border border-[#1e212b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#1fd1a8] transition-colors"
                      placeholder="Confirm new password"
                    />
                  </div>
                </>
              ) : modalOpen === "deactivate" ? (
                <div>
                  <p className="text-gray-300 text-sm mb-4">
                    Your account will be temporarily disabled. You can reactivate it anytime by
                    clicking Reactivate.
                  </p>
                  <p className="text-gray-400 text-xs">All your data will be preserved.</p>
                </div>
              ) : modalOpen === "reactivate" ? (
                <div>
                  <p className="text-gray-300 text-sm mb-4">
                    Ready to come back? This will re-enable your account.
                  </p>
                </div>
              ) : modalOpen === "delete" ? (
                <div>
                  <p className="text-red-400 text-sm mb-4 font-semibold">
                    ⚠️ This action cannot be undone!
                  </p>
                  <p className="text-gray-300 text-sm">
                    Your account and all associated data will be permanently deleted.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    {modalOpen === "displayName"
                      ? "Name"
                      : modalOpen === "username"
                        ? "Username"
                        : "Bio"}
                  </label>
                  <input
                    type="text"
                    value={editValue}
                    onChange={handleEditValueChange}
                    className="w-full bg-[#080810] border border-[#1e212b] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#1fd1a8] transition-colors"
                    placeholder={`Enter new ${modalOpen === "displayName" ? "name" : modalOpen === "username" ? "username" : "bio"}`}
                    maxLength={modalOpen === "bio" ? 160 : undefined}
                  />
                  {modalOpen === "bio" && (
                    <p className="text-xs text-gray-500 mt-2 text-right">
                      {editValue.length} / 160
                    </p>
                  )}
                </div>
              )}
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveModal}
                  className={`px-4 py-2 font-semibold rounded-lg text-sm transition-opacity disabled:opacity-50 ${modalOpen === "delete" ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-[#1fd1a8] hover:opacity-90 text-[#080810]"}`}
                  disabled={isSaving}
                >
                  {saveButtonLabel}
                </button>
              </div>
            </div>
          </EditModal>

          <ToastContainer toasts={toastApi.toasts} onDismiss={toastApi.dismiss} />
        </>
      )}
    </div>
  );
}
