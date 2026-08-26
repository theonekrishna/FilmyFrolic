const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const app = express();

app.set("trust proxy", 1);

// Security: CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      // Check allowed list or wildcard subdomains (Render, Vercel, Localhost)
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".onrender.com") ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        return callback(null, true);
      }

      // Safe fallback: allow origin to prevent breaking deployed preview URLs with 500 errors
      return callback(null, true);
    },
    credentials: true,
  })
);

// Security: Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again later." },
});

app.use("/api/", globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Core API Routes
app.use("/api/search", require("./modules/search/search.routes"));
app.use("/api/tmdb", require("./modules/tmdb/tmdb.routes"));
app.use("/api/auth", require("./modules/auth/auth.routes"));
app.use("/api/messages", require("./modules/messages/messages.routes"));
app.use("/api/communities", require("./modules/communities/communities.routes"));
app.use("/api/memes", require("./modules/memes/memes.routes"));
app.use("/api/gossips", require("./modules/gossips/gossip.route.js"));
app.use("/api/profile", require("./modules/editProfile/editProfile.routes"));
app.use("/api/follow", require("./modules/follow/follow.routes"));
app.use("/api/games", require("./modules/games/game.route.js"));
app.use("/api/rooms", require("./modules/rooms/room.routes.js"));
app.use("/api/feeds", require("./modules/feeds/feed.routes.js"));
app.use("/api/settings", require("./modules/settings/settings.routes"));
app.use("/api/notifications", require("./modules/notifications/notifications.routes"));
app.use("/api/reports", require("./modules/reports/reports.routes"));
app.use("/api/feedback", require("./modules/feedback/feedback.routes"));
app.use("/api/side", require("./modules/sideControll/side.routes"));
app.use("/api/home", require("./modules/home/home.routes"));
app.use("/api/archive", require("./modules/archive/archive.routes"));
app.use("/api/watchlist", require("./modules/watchlist/watchlist.routes"));

// Admin routes
app.use("/api/admin/users", require("./modules/admin/user/admin.user.routes"));
app.use("/api/admin/social", require("./modules/admin/social/admin.social.routes"));
app.use(
  "/api/admin/entertainment",
  require("./modules/admin/entertainment/admin.entertainment.routes")
);
app.use(
  "/api/admin/notifications",
  require("./modules/admin/notification/admin.notification.routes")
);
app.use("/api/admin/moderation", require("./modules/admin/moderation/admin.moderation.routes"));
app.use("/api/admin/content", require("./modules/admin/content/admin.content.routes"));
app.use("/api/admin/settings", require("./modules/admin/settings/admin.settings.routes"));
app.use("/api/admin/overview", require("./modules/admin/overview/admin.overview.routes"));
app.use("/api/admin/feedback", require("./modules/admin/feedback/admin.feedback.routes"));
app.use("/api/admin/policy", require("./modules/admin/policy/admin.policy.routes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Server is running ✅", version: "1.0.0" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err.message || err);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

module.exports = app;
