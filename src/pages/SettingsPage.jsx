import { BellRing, Gauge, Leaf, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppSelect, DashboardCard, MetricCard } from "../components/ui.jsx";
import { LoadingPanel, PageScaffold, useReadyDashboard } from "./pageShared.jsx";

function listToText(items = []) {
  return items.join("\n");
}

function textToList(value = "") {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createForm(settings = {}) {
  // Try to load any user-calibrated values from localStorage first.
  // localStorage survives reloads — this is what makes "USER-CALIBRATED" sticky.
  let stored = null;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("gridsenseiq:user-profile");
      if (raw) stored = JSON.parse(raw);
    } catch (e) { /* ignore */ }
  }
  return {
    monthlyUsageKwh: stored?.monthlyUsageKwh ?? settings.monthlyUsageKwh ?? 620,
    monthlyBillRm: stored?.monthlyBillRm ?? settings.monthlyBillRm ?? 310,
    operatingHours: stored?.operatingHours ?? settings.operatingHours ?? "Home schedule with evening peak",
    roomsOrZones: stored?.roomsOrZones ?? settings.roomsOrZones ?? 6,
    approximateOccupancySchedule: stored?.approximateOccupancySchedule ?? settings.approximateOccupancySchedule ?? "Morning exit, evening peak, low overnight occupancy",
    tariffRate: stored?.tariffRate ?? settings.tariffRate ?? 0.5,
    energySavingTarget: stored?.energySavingTarget ?? settings.energySavingTarget ?? 18,
    co2ReductionTargetKg: stored?.co2ReductionTargetKg ?? settings.co2ReductionTargetKg ?? 90,
    notificationPreference: stored?.notificationPreference ?? settings.notificationPreference ?? "Smart reminders",
    automationPreference: stored?.automationPreference ?? settings.automationPreference ?? "Suggest Only",
    facilityName: stored?.facilityName ?? settings.facilityName ?? "",
    floorAreaSqm: stored?.floorAreaSqm ?? settings.floorAreaSqm ?? "",
    categories: listToText(settings.categories || settings.departments || []),
    zones: listToText(settings.zones || [])
  };
}

export default function SettingsPage() {
  const { pathname } = useLocation();
  const isSetupRoute = pathname.startsWith("/setup");
  const { actions, dashboard, loading, ready } = useReadyDashboard();
  const [form, setForm] = useState(() => createForm(dashboard?.settings));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (dashboard?.settings) {
      setForm(createForm(dashboard.settings));
    }
  }, [dashboard?.settings]);

  if (!ready && loading) return <LoadingPanel title="Loading settings" />;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const profile = {
        monthlyUsageKwh: Number(form.monthlyUsageKwh),
        monthlyBillRm: Number(form.monthlyBillRm),
        operatingHours: form.operatingHours,
        roomsOrZones: Number(form.roomsOrZones),
        approximateOccupancySchedule: form.approximateOccupancySchedule,
        tariffRate: Number(form.tariffRate),
        energySavingTarget: Number(form.energySavingTarget),
        co2ReductionTargetKg: Number(form.co2ReductionTargetKg),
        notificationPreference: form.notificationPreference,
        automationPreference: form.automationPreference,
        facilityName: form.facilityName,
        floorAreaSqm: form.floorAreaSqm ? Number(form.floorAreaSqm) : null,
        categories: textToList(form.categories),
        zones: textToList(form.zones)
      };
      const response = await actions.saveSettings(profile);

      // Persist to localStorage so Reports & other pages can use real values.
      // (in-memory dashboard state resets on reload, but localStorage survives — this
      // is what makes "USER-CALIBRATED" sticky.)
      if (typeof window !== "undefined") {
        try {
          const trimmed = { ...profile };
          if (!trimmed.facilityName) delete trimmed.facilityName;
          if (!trimmed.floorAreaSqm) delete trimmed.floorAreaSqm;
          window.localStorage.setItem("gridsenseiq:user-profile", JSON.stringify(trimmed));
          // Broadcast so any open page (e.g. Reports tab) can re-render with new values
          window.dispatchEvent(new CustomEvent("gridsenseiq:profile-updated", { detail: trimmed }));
        } catch (e) { /* ignore quota errors */ }
      }

      setMessage(response?.message || "Profile calibrated · Reports will use your real numbers.");
    } finally {
      setSaving(false);
    }
  }

  function clearProfile() {
    if (typeof window === "undefined") return;
    if (!window.confirm("Reset to demo profile?\n\nThis clears your calibrated values and the app reverts to illustrative tier defaults.")) return;
    window.localStorage.removeItem("gridsenseiq:user-profile");
    window.dispatchEvent(new CustomEvent("gridsenseiq:profile-updated", { detail: null }));
    setMessage("Profile cleared · using demo defaults.");
    setForm(createForm(dashboard?.settings));
  }

  return (
    <PageScaffold
      eyebrow={isSetupRoute ? "Setup" : "Settings"}
      title={isSetupRoute ? "Energy profile setup" : "Preferences and assumptions"}
      description={
        isSetupRoute
          ? "Walk through the baseline profile that powers cost, carbon, recommendations, alerts, and automation behavior."
          : "Adjust tariff, targets, notification preferences, and the zones used to drive the dashboard."
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Monthly kWh" value={`${Number(form.monthlyUsageKwh || 0).toLocaleString()} kWh`} detail="Bill baseline" icon={Zap} />
        <MetricCard label="Monthly Bill" value={`RM ${Number(form.monthlyBillRm || 0).toLocaleString()}`} detail="Cost baseline" icon={BellRing} tone="amber" />
        <MetricCard label="Saving Target" value={`${form.energySavingTarget}%`} detail="Efficiency goal" icon={Gauge} tone="green" />
        <MetricCard label="CO2 Target" value={`${Number(form.co2ReductionTargetKg || 0).toLocaleString()} kg`} detail="Monthly reduction" icon={Leaf} tone="green" />
      </section>

      <DashboardCard className="p-5">
        {message ? <div className="mb-4 rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100">{message}</div> : null}

        <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/65">Step 1</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Baseline energy profile</h2>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-200">Facility name (optional)</span>
            <input
              type="text"
              value={form.facilityName}
              onChange={(event) => update("facilityName", event.target.value)}
              placeholder="e.g. Klang Production Plant"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-200">Floor area (sqm, optional)</span>
            <input
              type="number"
              min="0"
              value={form.floorAreaSqm}
              onChange={(event) => update("floorAreaSqm", event.target.value)}
              placeholder="e.g. 1200"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-200">Monthly kWh</span>
            <input
              type="number"
              min="0"
              value={form.monthlyUsageKwh}
              onChange={(event) => update("monthlyUsageKwh", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-200">Monthly bill amount (RM)</span>
            <input
              type="number"
              min="0"
              value={form.monthlyBillRm}
              onChange={(event) => update("monthlyBillRm", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-200">Operating hours</span>
            <input
              type="text"
              value={form.operatingHours}
              onChange={(event) => update("operatingHours", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-200">Number of rooms/zones</span>
            <input
              type="number"
              min="1"
              value={form.roomsOrZones}
              onChange={(event) => update("roomsOrZones", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
            />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-semibold text-slate-200">Approximate occupancy schedule</span>
            <textarea
              rows={3}
              value={form.approximateOccupancySchedule}
              onChange={(event) => update("approximateOccupancySchedule", event.target.value)}
              className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
            />
          </label>
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/65">Step 2</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Savings, alerts, and automation assumptions</h2>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-200">Tariff rate (RM/kWh)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.tariffRate}
              onChange={(event) => update("tariffRate", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-200">Energy-saving target (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={form.energySavingTarget}
              onChange={(event) => update("energySavingTarget", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-200">Monthly CO2 reduction target (kg)</span>
            <input
              type="number"
              min="0"
              value={form.co2ReductionTargetKg}
              onChange={(event) => update("co2ReductionTargetKg", event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-200">Notification preference</span>
            <AppSelect
              value={form.notificationPreference}
              onChange={(value) => update("notificationPreference", value)}
              options={["Smart reminders", "Critical alerts and shift summaries", "High usage warnings only", "Daily summary only"]}
              buttonClassName="rounded-xl"
            />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-semibold text-slate-200">AI automation preference</span>
            <AppSelect
              value={form.automationPreference}
              onChange={(value) => update("automationPreference", value)}
              options={["Off", "Suggest Only", "Auto-Control Simulation"]}
              buttonClassName="rounded-xl"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-200">Categories / departments</span>
            <textarea
              rows={7}
              value={form.categories}
              onChange={(event) => update("categories", event.target.value)}
              className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-200">Zones</span>
            <textarea
              rows={7}
              value={form.zones}
              onChange={(event) => update("zones", event.target.value)}
              className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
            />
          </label>
          <div className="lg:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="hud-button-primary inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition disabled:bg-slate-500/10"
            >
              {saving ? "Saving..." : "Save & Calibrate Reports"}
            </button>
            <button
              type="button"
              onClick={clearProfile}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-slate-200 transition hover:border-rose-300/40 hover:bg-rose-300/10 hover:text-rose-200"
            >
              Reset to demo profile
            </button>
          </div>
        </form>
      </DashboardCard>
    </PageScaffold>
  );
}
