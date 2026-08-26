import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../modules/notifications/UserNotification/supabaseClient";
import { useAuth } from "./AuthContext";

const NotificationCtx = createContext({ totalUnread: 0 });

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [userUnread, setUserUnread] = useState(0);
  const totalUnread = userUnread;

  const channelRef = useRef(null);

  // ─── Fetch initial unread count from REST API ─────────────────────────────
  const fetchCount = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token || !userId) return;
    try {
      const base = (import.meta.env.VITE_BASE_URL || "https://filmy-frolic-new-backend.onrender.com").replace(/\/+$/, "");
      const res = await fetch(`${base}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json?.success && typeof json.count === "number") {
        setUserUnread(json.count);
      }
    } catch {
      // silently fail — badge just won't show
    }
  }, [userId]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // ─── Supabase Realtime — user + admin table INSERT ────────────────────────
  useEffect(() => {
    if (!userId) return;

    channelRef.current = supabase
      .channel(`notif-badge-${userId}`)
      // User notifications — server-side filter
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => setUserUnread((c) => c + 1)
      )
      // User notifications marked as read (UPDATE) — keep count in sync
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const n = payload?.new;
          const o = payload?.old;
          if (n?.is_read === true && o?.is_read === false) {
            setUserUnread((c) => Math.max(0, c - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, [userId]);

  // ─── Reset counts when user navigates to /notifications ──────────────────
  // The panels themselves mark things as read; we just sync the badge down
  // when the user actually visits the page (via a custom window event).
  useEffect(() => {
    const onVisit = () => {
      setUserUnread(0);
    };
    window.addEventListener("ff-notifications-visited", onVisit);
    return () => window.removeEventListener("ff-notifications-visited", onVisit);
  }, []);

  return (
    <NotificationCtx.Provider value={{ totalUnread, userUnread, refetch: fetchCount }}>
      {children}
    </NotificationCtx.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationCtx);
}
