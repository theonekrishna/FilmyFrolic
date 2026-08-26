import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useModules } from "../context/ModulesContext";

// ── Eager imports (small / always-needed) ────────────────────────────────────
import AppLayout from "../layout/AppLayout";

// ── Route-level lazy imports (split by feature area) ─────────────────────────
// Auth
const Login = lazy(() => import("../modules/auth/pages/Login"));
const Signup = lazy(() => import("../modules/auth/pages/SignUp"));
const ForgotPasswordPage = lazy(() => import("../modules/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../modules/auth/pages/ResetPasswordPage"));
const AuthCallbackPage = lazy(() => import("../modules/auth/pages/Authcallbackpage"));

// Core
const Home = lazy(() => import("../modules/Home/Pages/Home"));

// Social
const SocialFeed = lazy(() => import("../modules/Feed/pages/Feed"));
const SinglePostPage = lazy(() => import("../modules/Feed/pages/SinglePostPage"));
const Messages = lazy(() => import("../modules/messages/pages/Message"));
const Rooms = lazy(() => import("../modules/rooms/pages/Rooms"));
const RoomDetails = lazy(() => import("../modules/rooms/pages/RoomDetails"));
const Communities = lazy(() => import("../modules/communities/pages/Communities"));
const CommunitySingleItem = lazy(() => import("../modules/communities/pages/CommunitySingleItem"));
const Notifications = lazy(() => import("../modules/notifications/pages/Notifications"));

// Content
const Archive = lazy(() => import("../modules/archive/pages/Archive"));
const ArchiveItemDetails = lazy(() => import("../modules/archive/pages/ArchiveItemDetails"));
const Articles = lazy(() => import("../modules/articles/pages/Articles"));
const ArticleItemDetailsView = lazy(
  () => import("../modules/articles/pages/ArticleItemDetailsView")
);
const Gossips = lazy(() => import("../modules/gossips/pages/Gossips"));
const SingleGossip = lazy(() => import("../modules/gossips/pages/SingleGossip"));

// Entertainment  ← the heavy modules we are optimising
const Games = lazy(() => import("../modules/games/pages/Games"));
const Memes = lazy(() => import("../modules/memes/pages/Memes"));
const SingleMemePage = lazy(() => import("../modules/memes/pages/SingleMemePage"));

// User
const UserHistory = lazy(() => import("../modules/UserHistory/pages/UserHistory"));
const UserPolicies = lazy(() => import("../modules/policy/pages/UserPoliciesPage"));
const UserProfile = lazy(() => import("../modules/userProfile/pages/UserProfile"));
const Watchlist = lazy(() => import("../modules/userProfile/pages/Watchlist"));

// Settings
const SettingsLayout = lazy(() => import("../modules/settings/layout/SettingsLayout"));
const AccountPage = lazy(() => import("../modules/settings/pages/AccountPage"));
const PreferencesPage = lazy(() => import("../modules/settings/pages/PreferencesPage"));
const PrivacyPage = lazy(() => import("../modules/settings/pages/PrivacyPage"));
const BlockedUsersPage = lazy(() => import("../modules/settings/pages/BlockedUsersPage"));
const WatchHistoryPage = lazy(() => import("../modules/settings/pages/WatchHistoryPage"));
const SessionsPage = lazy(() => import("../modules/settings/pages/SessionsPage"));
const DataExportPage = lazy(() => import("../modules/settings/pages/DataExportPage"));
const AboutPage = lazy(() => import("../modules/settings/pages/AboutPage"));

// Not found
const NotFound = lazy(() => import("../modules/notFound/pages/NotFound"));

// ── Global Suspense fallback ──────────────────────────────────────────────────
function PageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080810",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "3px solid rgba(124,92,252,0.2)",
          borderTopColor: "#7c5cfc",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  const { isEnabled } = useModules();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Auth routes ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ── App Layout ── */}
        <Route element={<AppLayout />}>
          {/* ── PUBLIC READ ROUTES (Accessible by unauthenticated guests) ── */}
          {isEnabled("core") && <Route path="/" element={<Home />} />}
          
          {isEnabled("content") && (
            <>
              <Route path="content/archive" element={<Archive />} />
              <Route path="content/movie/:id" element={<ArchiveItemDetails />} />
              <Route path="content/articles" element={<Articles />} />
              <Route path="content/articles/:id" element={<ArticleItemDetailsView />} />
              <Route path="content/gossip" element={<Gossips />} />
              <Route path="content/gossips/:id" element={<SingleGossip />} />
            </>
          )}

          {isEnabled("social") && (
            <>
              <Route path="social/feed" element={<SocialFeed />} />
              <Route path="social/feed/post/:id" element={<SinglePostPage />} />
              <Route path="social/rooms" element={<Rooms />} />
              <Route path="social/rooms/:id" element={<RoomDetails />} />
              <Route path="social/communities" element={<Communities />} />
              <Route path="social/communities/:id" element={<CommunitySingleItem />} />
            </>
          )}

          {isEnabled("entertainment") && (
            <>
              <Route path="entertain/games" element={<Games />} />
              <Route path="entertain/memes" element={<Memes />} />
              <Route path="entertain/memes/:id" element={<SingleMemePage />} />
            </>
          )}

          {isEnabled("user") && (
            <Route path="user/profile" element={<UserProfile />} />
          )}

          {/* ── PROTECTED USER ROUTES (Require Login / Active Session) ── */}
          <Route element={<ProtectedRoute />}>
            {isEnabled("social") && (
              <>
                <Route path="notifications" element={<Notifications />} />
                <Route path="social/messages" element={<Messages />} />
              </>
            )}

            {isEnabled("user") && (
              <>
                <Route path="user/history" element={<UserHistory />} />
                <Route path="user/watchlist" element={<Watchlist />} />
              </>
            )}

            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="account" replace />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="preferences" element={<PreferencesPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="blocked-users" element={<BlockedUsersPage />} />
              <Route path="watch-history" element={<WatchHistoryPage />} />
              <Route path="sessions" element={<SessionsPage />} />
              <Route path="data-export" element={<DataExportPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="policies" element={<UserPolicies />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
