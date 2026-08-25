// Simple in-memory cache for settings data
// Prevents repeated API calls when navigating between settings pages

const CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const settingsCache = {
  get(key) {
    const item = CACHE.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > CACHE_TTL) {
      CACHE.delete(key);
      return null;
    }

    return item.data;
  },

  set(key, data) {
    CACHE.set(key, {
      data,
      timestamp: Date.now(),
    });
  },

  invalidate(key) {
    if (key) {
      CACHE.delete(key);
    } else {
      CACHE.clear();
    }
  },

  // Helper for async data fetching with cache
  async fetchWithCache(key, fetchFn, options = {}) {
    const { forceRefresh = false, staleWhileRevalidate = true } = options;

    // Return cached data immediately if available and not forcing refresh
    const cached = !forceRefresh ? this.get(key) : null;

    if (cached && !staleWhileRevalidate) {
      return cached;
    }

    // If we have cached data, return it immediately but refresh in background
    if (cached && staleWhileRevalidate) {
      // Refresh in background
      fetchFn()
        .then((data) => {
          this.set(key, data);
        })
        .catch((err) => {
          console.error(`Background refresh failed for ${key}:`, err);
        });
      return cached;
    }

    // No cache - must wait for API
    try {
      const data = await fetchFn();
      this.set(key, data);
      return data;
    } catch (err) {
      // If we have stale cache, return it as fallback
      if (cached) {
        console.warn(`Using stale cache for ${key} due to error`);
        return cached;
      }
      throw err;
    }
  },
};

// Cache keys
export const CACHE_KEYS = {
  ACCOUNT: "account",
  PREFERENCES: "preferences",
  PRIVACY: "privacy",
  MODULES: "modules",
  BLOCKED_USERS: "blocked_users",
  WATCH_HISTORY: "watch_history",
  SESSIONS: "sessions",
  AVATARS: "avatars",
  CONNECTED_ACCOUNTS: "connected_accounts",
  TWO_FA_STATUS: "2fa_status",
};
