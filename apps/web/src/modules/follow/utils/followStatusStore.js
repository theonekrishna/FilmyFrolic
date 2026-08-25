/**
 * followStatusStore
 *
 * IMPORTANT: Cache is scoped per logged-in user via initFollowCache(userId).
 * This prevents User A's follow state from bleeding into User B's session.
 *
 * Call initFollowCache(userId) on login.
 * Call clearFollowCache()       on logout.
 */

const STORAGE_PREFIX = "ff_follow_v2_"; // prefix + userId = unique key per account

let _currentUserId = null;
let _store = new Map();
const _listeners = new Map();

function _storageKey() {
  return _currentUserId ? `${STORAGE_PREFIX}${_currentUserId}` : null;
}

function _persist() {
  const key = _storageKey();
  if (!key) return;
  try {
    sessionStorage.setItem(key, JSON.stringify([..._store]));
  } catch {
    /* quota — ignore */
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Call this on login with the logged-in user's own ID.
 * Loads that user's specific follow cache from sessionStorage.
 */
export function initFollowCache(userId) {
  if (!userId || userId === _currentUserId) return;
  _currentUserId = userId;
  _store.clear();
  try {
    const raw = sessionStorage.getItem(_storageKey());
    if (raw) {
      JSON.parse(raw).forEach(([k, v]) => _store.set(k, v));
    }
  } catch {
    /* ignore */
  }
  // Notify all existing subscribers their status may have changed
  _listeners.forEach((cbs, targetId) => {
    const val = _store.has(targetId) ? _store.get(targetId) : false;
    cbs.forEach((cb) => cb(val));
  });
}

/**
 * Call this on logout — wipes the in-memory cache and clears sessionStorage.
 */
export function clearFollowCache() {
  const key = _storageKey();
  if (key) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  _store.clear();
  _currentUserId = null;
  // Reset all subscribed components to false
  _listeners.forEach((cbs) => cbs.forEach((cb) => cb(false)));
}

/** Get cached follow status. Returns null if never checked. */
export function getCachedStatus(userId) {
  if (!userId) return null;
  return _store.has(userId) ? _store.get(userId) : null;
}

/** Set follow status and notify all subscribers for that userId. */
export function setCachedStatus(userId, isFollowing) {
  if (!userId) return;
  _store.set(userId, isFollowing);
  _persist();
  _listeners.get(userId)?.forEach((cb) => cb(isFollowing));
}

/** Subscribe to status changes. Returns unsubscribe fn. */
export function subscribeToStatus(userId, cb) {
  if (!userId) return () => {};
  if (!_listeners.has(userId)) _listeners.set(userId, new Set());
  _listeners.get(userId).add(cb);
  return () => _listeners.get(userId)?.delete(cb);
}
