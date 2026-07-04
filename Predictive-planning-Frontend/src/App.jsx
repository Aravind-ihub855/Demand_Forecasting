import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import FestivalIntelligencePage from "./pages/FestivalIntelligencePage";
import FestivalDashboardPage from "./pages/FestivalDashboardPage";
import AiFestivalDemandForecastPage from "./pages/AiFestivalDemandForecastPage";
import DemandIntelligencePage from "./pages/DemandIntelligencePage";
import InventoryPage from "./pages/InventoryPage";
import MonthlyAnalysisPage from "./pages/MonthlyAnalysisPage";
import SpikeObservatoryPage from "./pages/SpikeObservatoryPage";
import ForecastsPage from "./pages/ForecastsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes — wrapped in AppShell layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/festival-intelligence" element={<FestivalIntelligencePage />} />
        <Route path="/festival-dashboard" element={<FestivalDashboardPage />} />
        <Route path="/ai-festival-demand-forecast" element={<AiFestivalDemandForecastPage />} />
        <Route path="/ai-powered-demand-forecast" element={<DemandIntelligencePage />} />
        <Route path="/spike-observatory" element={<SpikeObservatoryPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/monthly-analysis" element={<MonthlyAnalysisPage />} />
        <Route path="/forecasts" element={<ForecastsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}