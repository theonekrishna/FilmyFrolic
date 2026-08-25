import { createContext, useContext, useEffect, useState } from "react";
import { clearFollowCache, initFollowCache } from "../modules/follow/utils/followStatusStore";

const STORAGE_KEY = "ff_auth_user";

const GRADIENTS = [
  "linear-gradient(135deg, #f5c518, #e84545)",
  "linear-gradient(135deg, #3b82f6, #9b59b6)",
  "linear-gradient(135deg, #e91e8c, #9b59b6)",
  "linear-gradient(135deg, #2ecc71, #1abc9c)",
  "linear-gradient(135deg, #7c5cfc, #3b82f6)",
  "linear-gradient(135deg, #f5c518, #2ecc71)",
];

function makeInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function randomGradient() {
  return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
}

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw));
        return;
      }
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const u = {
            id: payload.sub || payload.id || "api-user",
            displayName: payload.name || payload.email?.split("@")[0] || "User",
            username: payload.username || payload.email?.split("@")[0] || "user",
            email: payload.email || "",
            initials: makeInitials(payload.name || payload.email?.split("@")[0] || "U"),
            gradient: randomGradient(),
            joinedAt: "",
            genres: [],
            _fromToken: true,
          };
          setUser(u);
          initFollowCache(u.id);
        } catch {
          setUser({ id: "api-user", displayName: "User", _fromToken: true });
        }
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  async function signIn(email, password) {
    if (!email || !password) return { error: "Please fill in all fields." };
    if (password.length < 6) return { error: "Password must be at least 6 characters." };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw);
        if (stored.email.toLowerCase() === email.toLowerCase()) {
          setUser(stored);
          return {};
        }
      }
    } catch {}

    const demoUser = {
      id: "demo-" + Date.now(),
      displayName: email
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      username: email.split("@")[0].toLowerCase(),
      email,
      initials: makeInitials(email.split("@")[0]),
      gradient: randomGradient(),
      joinedAt: new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      genres: ["Thriller", "Sci-Fi"],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    return {};
  }

  async function signUp(data) {
    const { displayName, username, email, password, genres } = data;
    if (!displayName || !username || !email || !password)
      return { error: "Please fill in all fields." };
    if (password.length < 6) return { error: "Password must be at least 6 characters." };
    if (!/[^a-zA-Z0-9]/.test(password))
      return { error: "Password must include at least one special character." };
    if (!/^[a-z0-9_]+$/i.test(username))
      return {
        error: "Username can only contain letters, numbers and underscores.",
      };

    const newUser = {
      id: "user-" + Date.now(),
      displayName,
      username,
      email,
      initials: makeInitials(displayName),
      gradient: randomGradient(),
      joinedAt: new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      genres,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return {};
  }

  /**
   * signInWithToken
   * Called by Login.jsx immediately after a successful API login.
   * Decodes the JWT payload and sets the user state in-memory so that
   * ProtectedRoute sees an authenticated user before the page navigates.
   */
  function signInWithToken(token) {
    localStorage.setItem("accessToken", token);
    clearFollowCache();
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const resolvedName = payload.name || payload.email?.split("@")[0] || "User";
      const u = {
        id: payload.sub || payload.id || "api-user",
        displayName: resolvedName,
        username: payload.username || payload.email?.split("@")[0] || "user",
        email: payload.email || "",
        initials: makeInitials(resolvedName),
        gradient: randomGradient(),
        joinedAt: "",
        genres: [],
        _fromToken: true,
      };
      setUser(u);
      initFollowCache(u.id);
      // Notify ProfileContext to fetch the full server profile immediately.
      // This replaces the 500ms polling that used to detect same-tab logins.
      window.dispatchEvent(new Event("ff-profile-updated"));
    } catch {
      setUser({ id: "api-user", displayName: "User", _fromToken: true });
    }
  }

  function signOut() {
    clearFollowCache(); // wipe this user's follow cache
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("accessToken");

    // Clear ALL community join caches (for all users) to ensure clean state
    // This prevents stale join state from appearing for the next user
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("ff_community_joined_")) {
        localStorage.removeItem(key);
      }
    });

    setUser(null);
  }

  function updateProfile(updates) {
    if (!user) return;
    const updated = {
      ...user,
      ...updates,
      initials: updates.displayName ? makeInitials(updates.displayName) : user.initials,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
  }

  return (
    <AuthCtx.Provider
      value={{ user, loading, signIn, signInWithToken, signUp, signOut, updateProfile }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
