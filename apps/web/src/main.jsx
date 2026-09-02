import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID &&
  import.meta.env.VITE_GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID"
    ? import.meta.env.VITE_GOOGLE_CLIENT_ID
    : "1000000000000-demo.apps.googleusercontent.com";

const root = createRoot(document.getElementById("root"));

root.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
