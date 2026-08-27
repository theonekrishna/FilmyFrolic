import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Custom Hook: useAuthGate
 * Action-level authorization guard for gating WRITE/MODIFY/DELETE actions.
 * Allows unauthenticated guests to read content freely while prompting auth modal for user actions.
 */
export function useAuthGate() {
  const { user } = useAuth();
  const isLoggedIn = !!user && !!localStorage.getItem("accessToken");

  const [authPrompt, setAuthPrompt] = useState({
    isOpen: false,
    message: "",
    pendingCallback: null,
  });

  // Listen for global session expiration (e.g. 401 token refresh failure)
  useEffect(() => {
    const handleAuthExpired = () => {
      setAuthPrompt({
        isOpen: true,
        message: "Your session has expired. Please sign in again to continue.",
        pendingCallback: null,
      });
    };
    window.addEventListener("auth-expired", handleAuthExpired);
    return () => window.removeEventListener("auth-expired", handleAuthExpired);
  }, []);

  /**
   * Require authentication before executing a callback.
   * If logged in, executes callback immediately.
   * If guest, opens AuthPromptModal with custom prompt message and saves pending callback.
   *
   * @param {string} promptMessage - Contextual message explaining why sign-in is required
   * @param {Function} actionCallback - Intended action to execute after successful authentication
   * @returns {boolean} - true if blocked (opened modal), false if authorized (executed action)
   */
  const requireAuth = useCallback(
    (promptMessage, actionCallback) => {
      if (!isLoggedIn) {
        setAuthPrompt({
          isOpen: true,
          message:
            promptMessage ||
            "Sign in or create a free account to participate in discussions and interact with content.",
          pendingCallback: typeof actionCallback === "function" ? actionCallback : null,
        });
        return true; // Blocked
      }

      if (typeof actionCallback === "function") {
        actionCallback();
      }
      return false; // Authorized
    },
    [isLoggedIn]
  );

  const closeAuthPrompt = useCallback(() => {
    setAuthPrompt({ isOpen: false, message: "", pendingCallback: null });
  }, []);

  const handleAuthSuccess = useCallback(() => {
    if (authPrompt.pendingCallback) {
      authPrompt.pendingCallback();
    }
    closeAuthPrompt();
  }, [authPrompt, closeAuthPrompt]);

  return {
    isLoggedIn,
    requireAuth,
    authPromptProps: {
      isOpen: authPrompt.isOpen,
      onClose: closeAuthPrompt,
      message: authPrompt.message,
      onAuthSuccess: handleAuthSuccess,
    },
  };
}
