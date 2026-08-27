import { supabase } from "../supabase";

export interface AdminUser {
  name: string;
  email: string;
  role: string;
}

export const authService = {
  getAdminUser(): AdminUser {
    try {
      const demo = localStorage.getItem("ff_admin_auth");
      if (demo) {
        const parsed = JSON.parse(demo);
        return {
          name: parsed.user?.name || "Demo Admin",
          email: parsed.user?.email || "admin@filmyfrolic.com",
          role: (parsed.role || "admin").toUpperCase(),
        };
      }
      const user = localStorage.getItem("user");
      if (user) {
        const parsed = JSON.parse(user);
        return {
          name: parsed.displayName || parsed.username || "Admin User",
          email: parsed.email || "admin@filmyfrolic.com",
          role: (parsed.role || "admin").toUpperCase(),
        };
      }
    } catch (err) {
      console.error("Failed to parse auth user:", err);
    }
    return { name: "Super Admin", email: "admin@filmyfrolic.app", role: "ADMIN" };
  },

  logout(): void {
    localStorage.removeItem("ff_admin_auth");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    try {
      supabase.auth.signOut();
    } catch {
      // ignore
    }
    window.location.href = "/login";
  },
};
