import { useState } from "react";
import TopBar from "../../../layout/TopBar";
import { Bell, ShieldAlert } from "lucide-react";
import UserNotificationsPage from "../UserNotification/UserNotificationsPage";
import AdminNotificationsPage from "../AdminNotification/AdminNotificationsPage";

// ─── Main tabs ────────────────────────────────────────────────────────────────
const TABS = [
  { key: "user", label: "My Notifications", Icon: Bell },
  { key: "admin", label: "Admin Alerts", Icon: ShieldAlert },
];

// ─────────────────────────────────────────────────────────────────────────────
// Global Notifications shell
// Owns only the TopBar + tab switcher.
// All data fetching, realtime, and rendering is delegated to the panels.
// ─────────────────────────────────────────────────────────────────────────────
export default function Notifications() {
  const [activeTab, setActiveTab] = useState("user");

  return (
    <div className="min-h-screen bg-[#06060c] text-[#f0f0f8]">
      <TopBar title="Notifications" subtitle="Stay up to date" />

      <div className="max-w-[720px] mx-auto px-6 pt-8 pb-20">
        {/* ── Page heading ───────────────────────────────────────────── */}
        <h2 className="text-[20px] tracking-[1.5px] font-bold uppercase font-bebas text-[#f0f0f8] mb-5">
          Notifications
        </h2>

        {/* ── Main tabs: User | Admin ─────────────────────────────────── */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-7 w-fit">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold font-outfit transition-all duration-200 ${
                activeTab === key
                  ? key === "admin"
                    ? "bg-purple-500/20 border border-purple-500/40 text-purple-300 shadow-sm"
                    : "bg-violet-500/20 border border-violet-500/40 text-violet-300 shadow-sm"
                  : "text-white/35 hover:text-white/60 border border-transparent"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div className="border-b border-white/[0.04] mb-6" />

        {/* ── Panel ───────────────────────────────────────────────────── */}
        {activeTab === "user" && <UserNotificationsPage />}
        {activeTab === "admin" && <AdminNotificationsPage />}
      </div>
    </div>
  );
}
