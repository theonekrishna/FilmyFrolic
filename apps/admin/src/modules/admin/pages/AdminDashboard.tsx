import { useState, useEffect } from "react";
import { adminApi } from "../../../services/adminApi";
import { supabase } from "../../../services/supabase";
import { AdminLayout } from "../../../components/layout/AdminLayout";
import { OverviewPage } from "../../../features/overview/OverviewPage";
import { UsersPage } from "../../../features/users/UsersPage";
import { ContentPage } from "../../../features/content/ContentPage";
import { SocialPage } from "../../../features/social/SocialPage";
import { EntertainPage } from "../../../features/entertain/EntertainPage";
import { ModerationPage } from "../../../features/moderation/ModerationPage";
import { ContentFeedbackPage } from "../../../features/contentFeedback/ContentFeedbackPage";
import { NotificationsPage } from "../../../features/notifications/NotificationsPage";
import { AnalyticsPage } from "../../../features/analytics/AnalyticsPage";
import { SettingsPage } from "../../../features/settings/SettingsPage";
type Section =
  | "overview"
  | "users"
  | "content"
  | "contentFeedback"
  | "social"
  | "entertain"
  | "moderation"
  | "notifications"
  | "analytics"
  | "settings";

function OverviewSection() {
  return <OverviewPage />;
}

// ─── SECTION: USERS ───────────────────────────────────────────────────────────

function UsersSection() {
  return <UsersPage />;
}

function ContentSection() {
  return <ContentPage />;
}

function SocialSection() {
  return <SocialPage />;
}

function EntertainSection() {
  return <EntertainPage />;
}

function ModerationSection() {
  return <ModerationPage />;
}

function ContentFeedbackSection() {
  return <ContentFeedbackPage />;
}

function NotificationsSection() {
  return <NotificationsPage />;
}

function AnalyticsSection() {
  return <AnalyticsPage />;
}

function SettingsSection() {
  return <SettingsPage />;
}

const RED = "#e84545";

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [section, setSection] = useState<Section>("overview");
  const [realtimeAlerts, setRealtimeAlerts] = useState<string[]>([]);

  useEffect(() => {
    // ── Supabase Realtime Moderation Signals & API Check ─────────────────
    adminApi.getOverview();
    const channel = supabase
      .channel("admin-moderation-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reports" },
        (payload: any) => {
          const msg = `🚨 Realtime Report: ${payload?.new?.reason || "New moderation item"} submitted!`;
          setRealtimeAlerts((prev) => [msg, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AdminLayout section={section} onSectionChange={setSection}>
      {realtimeAlerts.length > 0 && (
        <div
          style={{
            background: "rgba(232,69,69,0.15)",
            border: "1px solid rgba(232,69,69,0.3)",
            borderRadius: 10,
            padding: "10px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: RED }}>{realtimeAlerts[0]}</span>
          <button
            onClick={() => setRealtimeAlerts([])}
            style={{
              background: "none",
              border: "none",
              color: "rgba(240,240,248,0.5)",
              cursor: "pointer",
              fontSize: 11,
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {section === "overview" && <OverviewSection />}
      {section === "users" && <UsersSection />}
      {section === "content" && <ContentSection />}
      {section === "contentFeedback" && <ContentFeedbackSection />}
      {section === "social" && <SocialSection />}
      {section === "entertain" && <EntertainSection />}
      {section === "moderation" && <ModerationSection />}
      {section === "notifications" && <NotificationsSection />}
      {section === "analytics" && <AnalyticsSection />}
      {section === "settings" && <SettingsSection />}
    </AdminLayout>
  );
}

export default AdminDashboard;
