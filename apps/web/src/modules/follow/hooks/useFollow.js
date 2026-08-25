import { useState, useEffect, useCallback, useRef } from "react";
import {
  checkIsFollowing,
  followUser,
  unfollowUser,
  getFollowCounts,
} from "../services/followService";
import { getCachedStatus, setCachedStatus, subscribeToStatus } from "../utils/followStatusStore";

/**
 * useFollow — Simple, always-fetches follow status on mount.
 * Shared state via followStatusStore so all cards for the same user sync.
 */
export function useFollow(targetUserId, currentUserId) {
  const [isFollowing, setIsFollowing] = useState(() => getCachedStatus(targetUserId) ?? false);
  const [isLoading, setIsLoading] = useState(() => {
    if (!targetUserId || targetUserId === currentUserId) return false;
    return getCachedStatus(targetUserId) === null;
  });
  const [error, setError] = useState(null);
  const inFlight = useRef(false);

  const isOwn = !!targetUserId && !!currentUserId && targetUserId === currentUserId;

  // ── Subscribe to cross-card updates ───────────────────────────────────────
  useEffect(() => {
    if (!targetUserId || isOwn) return;
    return subscribeToStatus(targetUserId, (val) => setIsFollowing(val));
  }, [targetUserId, isOwn]);

  // ── Fetch status on mount (skip if cache already has it) ──────────────────
  useEffect(() => {
    if (!targetUserId || isOwn) return;
    if (getCachedStatus(targetUserId) !== null) return; // already known

    let cancelled = false;

    async function init() {
      setIsLoading(true);
      const res = await checkIsFollowing(targetUserId);
      if (cancelled) return;
      if (res.success !== false) {
        const val = !!res.isFollowing;
        setCachedStatus(targetUserId, val);
        setIsFollowing(val);
      }
      setIsLoading(false);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [targetUserId, isOwn]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Toggle with optimistic update ─────────────────────────────────────────
  const toggle = useCallback(async () => {
    if (!targetUserId || isOwn || inFlight.current) return;
    setError(null);

    // Always read fresh from store (avoid stale closure)
    const wasFollowing = getCachedStatus(targetUserId) ?? false;
    const next = !wasFollowing;

    // Optimistic — notifies ALL cards for this user instantly
    setCachedStatus(targetUserId, next);
    setIsFollowing(next);

    inFlight.current = true;
    try {
      const res = wasFollowing ? await unfollowUser(targetUserId) : await followUser(targetUserId);

      if (!res.success) {
        throw new Error(res.message || "Action failed");
      }
    } catch (err) {
      // Backend might return 500 for duplicate keys (already following) or not found (already unfollowed).
      // Instead of blindly reverting, fetch the absolute truth from the DB.
      const trueStatus = await checkIsFollowing(targetUserId);

      if (trueStatus.success !== false) {
        const actualDbState = !!trueStatus.isFollowing;
        setCachedStatus(targetUserId, actualDbState);
        setIsFollowing(actualDbState);

        // Only show error if the DB state isn't what the user intended to do
        // Skip error for 500s since DB usually works despite the error response
        const is500 = err?.message?.includes("500") || err?.response?.status === 500;
        if (actualDbState !== next && !is500) {
          setError(err.message || "Network error");
        }
      } else {
        // Total fallback: assume network offline, revert to previous state
        setCachedStatus(targetUserId, wasFollowing);
        setIsFollowing(wasFollowing);
        setError("Network error");
      }
    } finally {
      inFlight.current = false;
    }
  }, [targetUserId, currentUserId]);

  return { isFollowing, isLoading, isOwn, toggle, error };
}

/**
 * useFollowCounts — for sidebar / profile header.
 */
export function useFollowCounts(userId) {
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const res = await getFollowCounts(userId);
      if (!cancelled && res.success !== false) {
        setCounts(res.data ?? { followers: 0, following: 0 });
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { counts, loading };
}
