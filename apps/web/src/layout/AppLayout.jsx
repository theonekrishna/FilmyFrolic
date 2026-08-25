import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import Sidebar from "../layout/SideBar";
import BottomTabBar from "../shared/BottomTabBar";
import SearchOverlay from "../shared/SearchOverLay";
import { ToastContainer, useToast } from "../shared/Toast";
import { useMobileSearch } from "../context/SearchContext";
import { privateAxios } from "../utils/AxiosInstance";

export default function AppLayout() {
  const toastApi = useToast();
  const { searchOpen, closeSearch } = useMobileSearch();
  const navigate = useNavigate();

  // 🔐 Verify token on app load
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        // privateAxios injects the Bearer token automatically via interceptor
        await privateAxios.get("/api/auth/me");
        // ✅ token valid
      } catch {
        // ❌ token invalid → logout
        localStorage.removeItem("accessToken");
        toastApi.error("Session expired", "Please login again.");
        navigate("/login");
      }
    };

    verifyToken();
  }, []);

  return (
    <>
      {/* Main Layout */}
      <div className="flex h-full w-full overflow-hidden bg-[#080810] font-outfit">
        {/* Sidebar for desktop */}
        <Sidebar className="hidden md:flex flex-shrink-0" />

        {/* Main content */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden relative">
          <Outlet />
        </main>
      </div>

      {/* Bottom tab bar for mobile */}
      <BottomTabBar className="md:hidden fixed bottom-0 w-full z-50" />

      {/* Toast notifications */}
      <ToastContainer toasts={toastApi.toasts} onDismiss={toastApi.dismiss} />

      {/* Global search overlay */}
      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </>
  );
}
