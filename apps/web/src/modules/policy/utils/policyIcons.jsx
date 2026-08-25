/**
 * policyIcons.js — Shared icon resolver for the policy module.
 *
 * Mirrors the ICON_OPTIONS in the admin (PolicyUI.jsx) exactly:
 *   value: "shield"      → Shield
 *   value: "file-text"   → FileText
 *   value: "lock"        → Lock
 *   value: "eye"         → Eye
 *   value: "alert"       → AlertTriangle
 *   value: "info"        → Info
 *
 * The admin stores these lowercase/kebab-case strings in the DB,
 * so we resolve them here instead of trying LucideIcons[name] directly
 * (which only works for PascalCase names like "Lock", not "lock").
 */

import { Shield, FileText, Lock, Eye, AlertTriangle, Info } from "lucide-react";

export const POLICY_ICON_MAP = {
  shield: Shield,
  "file-text": FileText,
  lock: Lock,
  eye: Eye,
  alert: AlertTriangle,
  info: Info,
};

/**
 * Resolve an icon component from its stored string value.
 * Falls back to Shield (same as admin) if the value is unknown.
 */
export function getPolicyIconComponent(iconValue) {
  return POLICY_ICON_MAP[iconValue] ?? Shield;
}

/**
 * Convenience render helper — matches admin's getPolicyIcon() signature.
 * @param {string}  iconValue  e.g. "lock", "eye"
 * @param {number}  size
 * @param {string}  color
 */
export function PolicyIcon({ name, size = 16, color }) {
  const Icon = getPolicyIconComponent(name);
  return <Icon size={size} color={color} />;
}
