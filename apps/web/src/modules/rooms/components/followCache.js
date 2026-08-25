// Shared in-memory cache for follow state across all room cards
// Key: ownerId (string), Value: boolean (isFollowing)
export const followCache = {};

// Listeners: notify all cards when a follow state changes
const listeners = {};

export function subscribeFollow(ownerId, callback) {
  if (!listeners[ownerId]) listeners[ownerId] = new Set();
  listeners[ownerId].add(callback);
  return () => listeners[ownerId]?.delete(callback);
}

export function setFollowCache(ownerId, value) {
  followCache[ownerId] = value;
  listeners[ownerId]?.forEach((cb) => cb(value));
}

export function getFollowCache(ownerId) {
  return followCache[ownerId]; // undefined means not loaded yet
}
