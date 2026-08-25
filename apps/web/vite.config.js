import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/tastedive-proxy": {
        target: "https://tastedive.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tastedive-proxy/, "/api/similar"),
        secure: true,
      },
    },
  },

  build: {
    target: "esnext", // no legacy polyfills → smaller output
    sourcemap: false, // skip sourcemaps in production
    chunkSizeWarningLimit: 900,

    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // ── Agora WebRTC SDK (~800 KB) — keep alone so other chunks stay small
          if (id.includes("agora-rtc-sdk-ng")) return "vendor-agora";

          // ── Supabase realtime client
          if (id.includes("@supabase")) return "vendor-supabase";

          // ── React core — almost never changes between deploys
          if (id.includes("react-dom") || id.includes("react-router")) return "vendor-react";
          if (id.includes("node_modules/react/")) return "vendor-react";

          // ── UI utilities
          if (id.includes("lucide-react")) return "vendor-ui";
          if (id.includes("emoji-picker-react")) return "vendor-ui";
          if (id.includes("react-toastify")) return "vendor-ui";

          // ── HTTP + QR code
          if (id.includes("axios")) return "vendor-http";
          if (id.includes("qrcode")) return "vendor-http";

          // ── Remaining node_modules → general vendor chunk
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
});
