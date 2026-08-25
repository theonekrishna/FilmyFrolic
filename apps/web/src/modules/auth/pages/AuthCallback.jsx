import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../utils/supabaseClient";
import { useAuth } from "../../../context/AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { signInWithToken } = useAuth();

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.log(error);
        return;
      }
      const { access_token, refresh_token } = data.session;
      console.log("Access Token:", access_token);
      console.log("Refresh Token:", refresh_token);
      // Sets accessToken in localStorage AND updates user state immediately
      localStorage.setItem("refreshToken", refresh_token);
      signInWithToken(access_token);

      console.log("Session:", data.session);

      console.log("User:", data.session?.user);

      navigate("/", { replace: true });
    };
    getSession();
  }, []);

  return <div>Loading...</div>;
};

export default AuthCallback;
