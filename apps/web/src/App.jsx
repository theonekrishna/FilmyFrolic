import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { SearchProvider } from "./context/SearchContext";
import { ModulesProvider } from "./context/ModulesContext";
import { ProfileProvider } from "./context/Profilecontext";
import { NotificationProvider } from "./context/NotificationContext";
import AppReadyGate from "./components/LoadingScreen/AppReadyGate";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <ModulesProvider>
            <ProfileProvider>
              <NotificationProvider>
                <AppReadyGate>
                  <AppRoutes />
                </AppReadyGate>
              </NotificationProvider>
            </ProfileProvider>
          </ModulesProvider>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
