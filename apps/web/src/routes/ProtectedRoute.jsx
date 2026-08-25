import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 *
 * Wraps any set of routes that require an authenticated user.
 * - While auth state is still being resolved (loading), renders a full-screen
 *   spinner so we never flash a redirect before we know the truth.
 * - If no authenticated user is found, redirects to /login and remembers the
 *   intended destination via `state.from` so Login can send the user back.
 * - Otherwise renders the child routes via <Outlet />.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  /* ── 1. Still hydrating from localStorage ─────────────────────────── */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#080810",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid rgba(245,197,24,0.2)",
            borderTopColor: "#f5c518",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── 2. Not authenticated → redirect to /login ─────────────────────── */
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* ── 3. Authenticated → render the matched child route ─────────────── */
  return <Outlet />;
}
