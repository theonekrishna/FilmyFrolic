import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../utils/supabaseClient";
import { useAuth } from "../../../context/AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { signInWithToken } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check hash params first for recovery type
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash);
      const type = params.get("type");
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token") || "";

      if (type === "recovery" && accessToken) {
        navigate(`/reset-password?token=${accessToken}&refreshToken=${refreshToken}`, {
          replace: true,
        });
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (error || !data?.session) {
        console.error("AuthCallback session error:", error);
        navigate("/login", { replace: true });
        return;
      }

      // Check if session event is recovery
      const { access_token, refresh_token } = data.session;
      localStorage.setItem("refreshToken", refresh_token);
      signInWithToken(access_token);

      navigate("/", { replace: true });
    };

    handleAuthCallback();
  }, [navigate, signInWithToken]);

  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center text-white font-['Outfit']">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Authenticating session...</span>
      </div>
    </div>
  );
};

export default AuthCallback;
