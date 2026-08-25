// ─────────────────────────────────────────────
// Blockcache.js — shared in-memory block cache
// mirrors the pattern used in followCache.js
// ─────────────────────────────────────────────

const blockCache = {}; // { userId: true/false }
const subscribers = {}; // { userId: Set<fn> }

// ── Per-user get/set/subscribe ─────────────────
export function getBlockCache(userId) {
  return blockCache[userId]; // undefined if not yet loaded
}

export function setBlockCache(userId, value) {
  blockCache[userId] = value;
  // Notify per-userId subscribers (e.g. BlockButton)
  if (subscribers[userId]) {
    subscribers[userId].forEach((fn) => fn(value));
  }
}

export function subscribeBlock(userId, fn) {
  if (!subscribers[userId]) subscribers[userId] = new Set();
  subscribers[userId].add(fn);
  return () => subscribers[userId].delete(fn); // returns unsubscribe fn
}

// ── Derive the full set of blocked owner IDs ───
// Rooms.jsx calls this to build the filter Set
export function getBlockedSet() {
  return new Set(
    Object.entries(blockCache)
      .filter(([, v]) => v === true)
      .map(([k]) => k)
  );
}
