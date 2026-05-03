import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { DashboardProvider } from "./app/DashboardContext.jsx";
import AppShell from "./components/AppShell.jsx";
import CursorEffect from "./components/effects/CursorEffect.jsx";
import EnergyParticles from "./components/effects/EnergyParticles.jsx";
import ActionsPage from "./pages/ActionsPage.jsx";
import AiTwinPage from "./pages/AiTwinPage.jsx";
import AutomationPage from "./pages/AutomationPage.jsx";
import DashboardHubPage from "./pages/DashboardHubPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import FaultDetectionPage from "./pages/FaultDetectionPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import ROIPage from "./pages/ROIPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  // Add a class to <html> only on the landing route so we can scope the
  // soft scroll-snap CSS without affecting other pages (dashboard etc).
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const isLanding = pathname === "/" || pathname === "";
    document.documentElement.classList.toggle("landing-snap", isLanding);
    return () => {
      document.documentElement.classList.remove("landing-snap");
    };
  }, [pathname]);

  // Tag the body with a per-page theme key so each subpage can have its own
  // accent color, hero strip, and ambient identity. Falls back to "default".
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const themes = {
      "/": "landing",
      "/dashboard": "hub",
      "/dashboard/details": "command",
      "/ai-twin": "twin",
      "/actions": "save",
      "/automation": "automation",
      "/roi": "roi",
      "/fault-detection": "impact",
      "/reports": "reports",
      "/setup": "setup",
      "/settings": "settings"
    };
    const normalized = pathname.replace(/\/+$/, "") || "/";
    const theme = themes[normalized] || "default";
    document.body.dataset.pageTheme = theme;
    return () => {
      delete document.body.dataset.pageTheme;
    };
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <EnergyParticles density={0.55} />
      <CursorEffect />
      <DashboardProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardHubPage />} />
            <Route path="/dashboard/details" element={<DashboardPage />} />
            <Route path="/live-grid" element={<Navigate replace to="/dashboard" />} />
            <Route path="/ai-twin" element={<AiTwinPage />} />
            <Route path="/actions" element={<ActionsPage />} />
            <Route path="/automation" element={<AutomationPage />} />
            <Route path="/fault-detection" element={<FaultDetectionPage />} />
            <Route path="/roi" element={<ROIPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/setup" element={<SettingsPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            <Route path="/simulation" element={<Navigate replace to="/ai-twin" />} />
            <Route path="/recommendations" element={<Navigate replace to="/actions" />} />
            <Route path="/business-case" element={<Navigate replace to="/roi" />} />
            <Route path="/demo" element={<Navigate replace to="/dashboard" />} />
            <Route path="/system-log" element={<Navigate replace to="/fault-detection" />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Route>
        </Routes>
      </DashboardProvider>
    </BrowserRouter>
  );
}
