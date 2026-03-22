import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import PreferenceSettingsPage from "@/pages/PreferenceSettingsPage";
import SearchResultsPage from "@/pages/SearchResultsPage";
import ReportGenerationPage from "@/pages/ReportGenerationPage";
import LoginPage from "@/pages/LoginPage";
import UserCenterPage from "@/pages/UserCenterPage";
import { AuthContext } from "@/contexts/authContext";
import { applyGuestDefaults, applyUserPreferences, fetchCurrentUser, logout as clearAuthStorage } from "@/lib/api";

export default function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    preferences?: {
      theme?: "light" | "dark" | "auto";
      language?: string;
      notifications?: boolean;
    };
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const userRaw = localStorage.getItem("authUser") || sessionStorage.getItem("authUser");

    if (!token) {
      applyGuestDefaults();
      return;
    }

    setIsAuthenticated(true);

    if (userRaw) {
      try {
        const parsedUser = JSON.parse(userRaw);
        setUser(parsedUser);
        applyUserPreferences(parsedUser?.preferences);
      } catch {
        setUser(null);
      }
    }

    fetchCurrentUser()
      .then((freshUser) => {
        setUser(freshUser);
        const storage = localStorage.getItem("authToken") ? localStorage : sessionStorage;
        storage.setItem("authUser", JSON.stringify(freshUser));
        applyUserPreferences(freshUser?.preferences);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUser(null);
        clearAuthStorage();
      });
  }, []);

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    clearAuthStorage();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, setUser, setIsAuthenticated, logout }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preferences" element={<PreferenceSettingsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user-center" element={<UserCenterPage />} />
        <Route
          path="/search"
          element={
            isAuthenticated ? (
              <SearchResultsPage />
            ) : (
              <Navigate to={`/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`} replace />
            )
          }
        />
        <Route path="/report" element={<ReportGenerationPage />} />
      </Routes>
    </AuthContext.Provider>
  );
}
