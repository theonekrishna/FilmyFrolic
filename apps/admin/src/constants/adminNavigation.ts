import React from "react";
import {
  LayoutDashboard,
  Users,
  Film,
  MessageSquare,
  Gamepad2,
  Shield,
  Bell,
  BarChart2,
  Settings,
  HelpCircle,
} from "lucide-react";

export type Section =
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

export interface NavItem {
  id: Section;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: React.createElement(LayoutDashboard, { size: 16 }) },
  { id: "users", label: "Users & Roles", icon: React.createElement(Users, { size: 16 }) },
  { id: "content", label: "Content Catalog", icon: React.createElement(Film, { size: 16 }) },
  {
    id: "contentFeedback",
    label: "Content Feedback",
    icon: React.createElement(HelpCircle, { size: 16 }),
  },
  { id: "social", label: "Social & Rooms", icon: React.createElement(MessageSquare, { size: 16 }) },
  { id: "entertain", label: "Games & Memes", icon: React.createElement(Gamepad2, { size: 16 }) },
  {
    id: "moderation",
    label: "Moderation Queue",
    icon: React.createElement(Shield, { size: 16 }),
    badge: 7,
  },
  { id: "notifications", label: "Notifications", icon: React.createElement(Bell, { size: 16 }) },
  { id: "analytics", label: "Analytics", icon: React.createElement(BarChart2, { size: 16 }) },
  { id: "settings", label: "Settings & Config", icon: React.createElement(Settings, { size: 16 }) },
];
