import React, { useState } from "react";
import { Section, ADMIN_NAV_ITEMS } from "../../constants/adminNavigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";

interface AdminLayoutProps {
  section: Section;
  onSectionChange: (s: Section) => void;
  children: React.ReactNode;
}

const F = "'Plus Jakarta Sans', system-ui, sans-serif";

export const AdminLayout: React.FC<AdminLayoutProps> = ({ section, onSectionChange, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sectionLabel = ADMIN_NAV_ITEMS.find((n) => n.id === section)?.label || "Overview";

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#080810", fontFamily: F }}>
      <AdminSidebar section={section} onSection={onSectionChange} collapsed={!sidebarOpen} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <AdminTopBar sectionLabel={sectionLabel} onMenu={() => setSidebarOpen((v) => !v)} />

        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: "#080810" }}>
          {children}
        </main>
      </div>
    </div>
  );
};
