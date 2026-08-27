import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../services/supabase";

const STAFF_ROLES = ["admin", "super_admin", "content_manager", "community_moderator", "support_staff", "moderator", "article_writer"];

export default function ProtectedAdminRoute() {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        // 1. Check local session / demo state
        const demoAuth = localStorage.getItem("ff_admin_auth");
        if (demoAuth) {
          const parsed = JSON.parse(demoAuth);
          setIsAuthenticated(true);
          setUserRole(parsed.role || "admin");
          setLoading(false);
          return;
        }

        // 2. Check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // 3. Fetch profile role from DB
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setUserRole(profile?.role || "admin");
      } catch (err) {
        // Fallback for offline dev
        setIsAuthenticated(true);
        setUserRole("admin");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080810",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Outfit', sans-serif",
          color: "rgba(240,240,248,0.6)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "3px solid rgba(124,92,252,0.2)",
              borderTopColor: "#7c5cfc",
              animation: "spin 0.7s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Verifying Admin Access & Permissions...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // RBAC Access Check
  if (userRole === "user") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080810",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Outfit', sans-serif",
          padding: 20,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            background: "#12121e",
            border: "1px solid rgba(232,69,69,0.3)",
            borderRadius: 16,
            padding: 32,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontFamily: "'Bebas Neue', cursive",
              color: "#e84545",
              letterSpacing: 2,
              marginBottom: 12,
            }}
          >
            403 ACCESS DENIED
          </div>
          <p style={{ color: "rgba(240,240,248,0.7)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Your account does not have staff or administrator privileges to access the FilmyFrolic Admin Console.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("ff_admin_auth");
              supabase.auth.signOut();
              window.location.href = "/login";
            }}
            style={{
              background: "#7c5cfc",
              border: "none",
              borderRadius: 10,
              padding: "12px 24px",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
