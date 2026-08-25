// ProfileContext.jsx
// Drop this file in src/context/ProfileContext.jsx
// Wrap your app (or relevant subtree) with <ProfileProvider>
// Use useProfile() in any component to get live profile data

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { privateAxios } from "../utils/AxiosInstance";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [sharedProfile, setSharedProfile] = useState({
    displayName: "",
    username: "",
    avatar_url: "",
    avatar_preset: null,
    initials: null,
    gradient: null,
  });
  const [profileLoaded, setProfileLoaded] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        // No token — clear profile and mark as loaded (guest)
        setSharedProfile({
          displayName: "",
          username: "",
          avatar_url: "",
          avatar_preset: null,
          initials: null,
          gradient: null,
        });
        setProfileLoaded(true);
        return;
      }
      const response = await privateAxios.get("/api/settings/account");
      console.log("Fetched profile:", response.data);
      if (response.data.success && response.data.data?.profile) {
        const profile = response.data.data.profile;
        const displayName = profile.display_name || profile.name || "User";
        const getInitial = (n = "") => {
          const m = n.match(/[a-zA-Z]/);
          return m ? m[0].toUpperCase() : "";
        };
        setSharedProfile({
          id: profile.id,
          displayName: profile.name || "User",
          username: profile.username || "user",
          avatar_url: profile.avatar_url || "",
          avatar_preset: profile.avatar_preset ?? null,
          gradient: profile.gradient || "linear-gradient(135deg,#f5c518,#e84545)",
          initials: getInitial(displayName) || "U",
          email: profile.email,
          bio: profile.bio,
          display_name: profile.display_name || profile.name || "User",
        });
      } else {
        setSharedProfile({
          displayName: "",
          username: "",
          avatar_url: "",
          avatar_preset: null,
          initials: null,
          gradient: null,
        });
      }
    } catch {
      // silently fail — user stays as guest
      setSharedProfile({
        displayName: "",
        username: "",
        avatar_url: "",
        avatar_preset: null,
        initials: null,
        gradient: null,
      });
    } finally {
      setProfileLoaded(true);
    }
  }, []);

  // Fetch once on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Re-fetch when sidebar/settings fire the global event
  useEffect(() => {
    window.addEventListener("ff-profile-updated", fetchProfile);
    return () => window.removeEventListener("ff-profile-updated", fetchProfile);
  }, [fetchProfile]);

  // Re-fetch when accessToken appears in localStorage from ANOTHER tab (cross-tab login).
  // Same-tab login is handled by the ff-profile-updated event fired from AuthContext.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "accessToken" && e.newValue && !sharedProfile?.id) {
        fetchProfile();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [fetchProfile, sharedProfile?.id]);

  // Call this from any component whenever profile data changes.
  // Merges only the keys you pass — other keys stay untouched.
  const updateSharedProfile = useCallback((patch) => {
    setSharedProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  return (
    <ProfileContext.Provider value={{ sharedProfile, updateSharedProfile, profileLoaded }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  // Return a safe default instead of throwing — prevents crashes when context
  // is momentarily null during HMR reloads or when used in shared components.
  if (!ctx) {
    return {
      sharedProfile: {
        displayName: "",
        username: "",
        avatar_url: "",
        avatar_preset: null,
        initials: null,
        gradient: null,
      },
      updateSharedProfile: () => {},
      profileLoaded: false,
    };
  }
  return ctx;
}
