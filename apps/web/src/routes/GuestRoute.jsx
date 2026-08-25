import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * GuestRoute
 *
 * Wraps routes that should only be accessible to unauthenticated users
 * (e.g. /login, /signup).
 *
 * - While auth state is still resolving, renders nothing (avoids flash).
 * - If the user IS authenticated, redirects them to wherever they tried to
 *   go before (state.from) or falls back to the home page.
 * - Otherwise renders the guest page via <Outlet />.
 */
export default function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still hydrating — render nothing to avoid a jarring flash redirect
  if (loading) return null;

  // Already logged in → send them home (or back to their intended destination)
  if (user) {
    const destination = location.state?.from?.pathname ?? "/";
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
