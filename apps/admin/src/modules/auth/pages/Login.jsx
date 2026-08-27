import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../services/supabase";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Verify role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "user") {
        await supabase.auth.signOut();
        setError("Access denied: Standard user accounts cannot access Admin Console.");
        setLoading(false);
        return;
      }

      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = (role = "admin") => {
    localStorage.setItem("ff_admin_auth", JSON.stringify({
      user: { email: `${role}@filmyfrolic.com`, name: "Demo Admin" },
      role,
    }));
    navigate("/");
  };

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
          width: "100%",
          maxWidth: 420,
          background: "#12121e",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: 36,
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: 38,
              letterSpacing: 3,
              color: "#f5c518",
              marginBottom: 4,
            }}
          >
            FILMY FROLIC
          </div>
          <div style={{ fontSize: 13, color: "#7c5cfc", fontWeight: 600, letterSpacing: 1 }}>
            ADMIN & MODERATION CONSOLE
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(232,69,69,0.15)",
              border: "1px solid rgba(232,69,69,0.4)",
              color: "#e84545",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(240,240,248,0.5)", marginBottom: 6 }}>
              ADMIN EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@filmyfrolic.com"
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#f0f0f8",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(240,240,248,0.5)", marginBottom: 6 }}>
              PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px 14px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#f0f0f8",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 10,
              padding: "14px",
              background: "linear-gradient(135deg,#7c5cfc,#4d91ff)",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {loading ? "Authenticating..." : "Sign In to Admin Console"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: 11, color: "rgba(240,240,248,0.3)" }}>LOCAL DEMO ACCESS</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => handleDemoSignIn("admin")}
            style={{
              flex: 1,
              padding: "10px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              color: "#f5c518",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Demo Admin
          </button>
          <button
            type="button"
            onClick={() => handleDemoSignIn("article_writer")}
            style={{
              flex: 1,
              padding: "10px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              color: "#1fd1a8",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Demo Writer
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
