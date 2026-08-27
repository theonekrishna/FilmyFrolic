import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import Login from "../modules/auth/pages/Login";

const AdminDashboard = lazy(() => import("../modules/admin/pages/AdminDashboard"));
const WriterDashboard = lazy(() => import("../modules/admin/pages/WriterDashboard"));

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

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin & Writer Routes */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/writer" element={<WriterDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
