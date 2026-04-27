import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { controlDevice, getDashboard, getMeta, saveSettings } from "./api.js";
import ControlPanel from "./components/ControlPanel.jsx";
import CostAnalysis from "./components/CostAnalysis.jsx";
import DeviceBreakdown from "./components/DeviceBreakdown.jsx";
import EnergyTrendChart from "./components/EnergyTrendChart.jsx";
import Header from "./components/Header.jsx";
import HighConsumptionRanking from "./components/HighConsumptionRanking.jsx";
import NotificationsPanel from "./components/NotificationsPanel.jsx";
import RecommendationPanel from "./components/RecommendationPanel.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";
import SummaryCards from "./components/SummaryCards.jsx";
import SustainabilityMetrics from "./components/SustainabilityMetrics.jsx";

const initialMeta = {
  selectedName: "GridSense IQ",
  modes: {
    enterprise: {
      description: "Device, machine, department, and production-line analytics for facility and energy teams."
    },
    residential: {
      description: "Circuit-level monitoring for homes, retail units, offices, cafes, and small businesses."
    }
  }
};

function LoadingDashboard() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/75 p-6 text-center shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <RefreshCw className="mx-auto animate-spin text-cyan-200" size={28} aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold text-white">Loading energy telemetry</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">Connecting to the dashboard API and preparing live operating data.</p>
      </div>
    </div>
  );
}

function ErrorPanel({ message, onRetry }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-rose-300/25 bg-rose-500/10 p-4 text-rose-100 shadow-[0_20px_60px_rgba(127,29,29,0.2)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <WifiOff className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
            <div>
              <h2 className="font-semibold">Dashboard API unavailable</h2>
              <p className="mt-1 text-sm leading-6">{message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-rose-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("enterprise");
  const [range, setRange] = useState("daily");
  const [meta, setMeta] = useState(initialMeta);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [controlMessage, setControlMessage] = useState("");

  const criticalAlerts = useMemo(
    () => (dashboard?.notifications || []).filter((notification) => notification.severity === "Critical").length,
    [dashboard?.notifications]
  );

  async function loadDashboard(nextMode = mode, nextRange = range) {
    setLoading(true);
    setError("");

    try {
      const [metaResponse, dashboardResponse] = await Promise.all([getMeta(), getDashboard(nextMode, nextRange)]);
      setMeta(metaResponse);
      setDashboard(dashboardResponse);
    } catch (loadError) {
      setError(loadError.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard(mode, range);
  }, [mode, range]);

  async function handleSaveSettings(settings) {
    try {
      const response = await saveSettings(mode, settings);
      setDashboard((current) => ({
        ...current,
        settings: response.settings,
        summary: response.summary
      }));
      setSettingsOpen(false);
    } catch (saveError) {
      setError(saveError.message || "Unable to save settings.");
    }
  }

  async function handleControl(deviceId, action) {
    setControlMessage("");

    try {
      const response = await controlDevice(mode, deviceId, action);
      setDashboard((current) => ({
        ...current,
        devices: current.devices.map((device) => (device.id === deviceId ? { ...device, ...response.device } : device))
      }));
      setControlMessage(response.message);
    } catch (controlError) {
      setControlMessage(controlError.message || "Control command failed.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950/20 text-slate-100">
      <Header
        appName={meta.selectedName}
        mode={mode}
        meta={meta}
        onModeChange={setMode}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {error ? <ErrorPanel message={error} onRetry={() => loadDashboard(mode, range)} /> : null}

      {loading && !dashboard ? (
        <LoadingDashboard />
      ) : dashboard ? (
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <section className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_70px_rgba(2,6,23,0.32)] backdrop-blur-xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/75">Smart energy command center</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Live monitoring dashboard</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                    Track demand, cost, carbon impact, anomalies, and device-level controls from one operational view.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => loadDashboard(mode, range)}
                  className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-slate-100 transition-colors duration-200 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                >
                  <RefreshCw size={16} aria-hidden="true" />
                  Refresh
                </button>
              </div>
            </div>

            <aside className="rounded-2xl border border-amber-300/25 bg-amber-400/10 p-5 text-amber-100 shadow-[0_20px_70px_rgba(120,53,15,0.2)] backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-300/15 text-amber-200 ring-1 ring-amber-300/25">
                  <AlertTriangle size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Operations status</p>
                  <p className="mt-2 text-2xl font-semibold">{criticalAlerts} critical alerts</p>
                  <p className="mt-1 text-sm leading-6">
                    {criticalAlerts > 0 ? "Review abnormal load signatures before approving control actions." : "No critical events are open."}
                  </p>
                </div>
              </div>
            </aside>
          </section>

          <SummaryCards summary={dashboard.summary} />

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
            <EnergyTrendChart mode={mode} range={range} trends={dashboard.trends} onRangeChange={setRange} />
            <CostAnalysis summary={dashboard.summary} settings={dashboard.settings} />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.62fr)]">
            <DeviceBreakdown mode={mode} devices={dashboard.devices} currency={dashboard.summary.currency} />
            <HighConsumptionRanking devices={dashboard.devices} currency={dashboard.summary.currency} />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <RecommendationPanel mode={mode} recommendations={dashboard.recommendations} />
            <NotificationsPanel mode={mode} notifications={dashboard.notifications} />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <ControlPanel
              mode={mode}
              devices={dashboard.devices}
              settings={dashboard.settings}
              controlMessage={controlMessage}
              onControl={handleControl}
            />
            <SustainabilityMetrics summary={dashboard.summary} settings={dashboard.settings} />
          </div>
        </main>
      ) : null}

      <SettingsPanel
        open={settingsOpen}
        mode={mode}
        settings={dashboard?.settings}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
