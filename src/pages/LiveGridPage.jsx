import { Activity, Cpu, DollarSign, Leaf, Power, RotateCw } from "lucide-react";
import { useState } from "react";
import DeviceBreakdown from "../components/DeviceBreakdown.jsx";
import EnergyTrendChart from "../components/EnergyTrendChart.jsx";
import { formatCurrency, formatEnergy, MetricCard, StatusBadge } from "../components/ui.jsx";
import { LoadingPanel, PageScaffold, useReadyDashboard } from "./pageShared.jsx";

const POWER_BUTTON_BASE =
  "inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-slate-500/10 disabled:text-slate-500";

function statusGlowClass(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (/\b(off|offline|stopped|disabled)\b/.test(normalized)) return "status-glow-off";
  if (/\b(standby|idle)\b/.test(normalized)) return "status-glow-standby";
  if (/\b(overconsuming|warning|critical|fault)\b/.test(normalized)) return "status-glow-warning";
  return "status-glow-on";
}

function devicePowerState(device) {
  if (!device.controlEnabled) {
    return {
      action: "turn-on",
      className:
        "hud-button-muted inline-flex min-h-10 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold",
      disabled: true,
      label: "Control Disabled"
    };
  }

  const status = String(device.status || "").trim().toLowerCase();
  const isOffOrStandby = /\b(off|offline|standby|stopped|disabled)\b/.test(status);
  const isOnRunningOrOptimized = /\b(on|running|optimized|active|overconsuming|idle)\b/.test(status);
  const shouldTurnOn = isOffOrStandby || (!isOnRunningOrOptimized && !device.isOn);

  if (shouldTurnOn) {
    return {
      action: "turn-on",
      className: `${POWER_BUTTON_BASE} hud-button-success hover:bg-emerald-500/25 hover:text-emerald-50`,
      disabled: false,
      label: "Turn On"
    };
  }

  return {
    action: "turn-off",
    className: `${POWER_BUTTON_BASE} hud-button-danger hover:bg-rose-500/25 hover:text-rose-50`,
    disabled: false,
    label: "Turn Off"
  };
}

export default function LiveGridPage() {
  const { actions, dashboard, loading, mode, range, ready } = useReadyDashboard();
  const [busyKey, setBusyKey] = useState("");

  if (!ready && loading) return <LoadingPanel title="Loading live grid" />;

  async function runDeviceAction(deviceId, deviceAction) {
    setBusyKey(`${deviceId}-${deviceAction}`);
    try {
      await actions.controlDevice(deviceId, deviceAction);
    } finally {
      setBusyKey("");
    }
  }

  return (
    <PageScaffold
      eyebrow="Live grid"
      title="Device and demand telemetry"
      description="Use this page to inspect load, cost contribution, and safe device-level control simulations."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Current Load" value={formatEnergy(dashboard?.summary?.totalEnergyKwh || 0)} detail="Live device demand" icon={Activity} />
        <MetricCard
          label="Projected Cost"
          value={formatCurrency(dashboard?.summary?.projectedMonthlyCost || 0, dashboard?.summary?.currency)}
          detail="Monthly projection"
          icon={DollarSign}
          tone="amber"
        />
        <MetricCard
          label="Carbon Today"
          value={`${Math.round(dashboard?.summary?.carbonKg || 0).toLocaleString()} kg`}
          detail="Current CO2 estimate"
          icon={Leaf}
          tone="green"
        />
      </section>

      <EnergyTrendChart mode={mode} range={range} trends={dashboard?.trends} onRangeChange={actions.setRange} />

      <DeviceBreakdown mode={mode} devices={dashboard?.devices || []} currency={dashboard?.summary?.currency || "MYR"} />

      <section className="grid gap-3 lg:grid-cols-2">
        {(dashboard?.devices || []).map((device) => {
          const powerState = devicePowerState(device);
          const deviceBusy = busyKey.startsWith(`${device.id}-`);
          const powerBusy = busyKey === `${device.id}-${powerState.action}`;
          const aiBusy = busyKey === `${device.id}-simulate-ai`;

          return (
            <article key={device.id} className={`hud-card device-card rounded-2xl border bg-slate-900/75 p-5 ${statusGlowClass(device.status)}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">{device.name}</h3>
                    <StatusBadge status={device.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{device.zone || device.department || device.type}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{device.recommendation}</p>
                </div>
                <span className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.13)]">
                  {formatEnergy(device.usageKwh)}
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => runDeviceAction(device.id, powerState.action)}
                  disabled={powerState.disabled || deviceBusy}
                  className={powerState.className}
                >
                  {powerBusy ? <RotateCw className="animate-spin" size={16} aria-hidden="true" /> : <Power size={16} aria-hidden="true" />}
                  {powerBusy ? "Sending..." : powerState.label}
                </button>
                <button
                  type="button"
                  onClick={() => runDeviceAction(device.id, "simulate-ai")}
                  disabled={powerState.disabled || deviceBusy}
                  className="hud-button-primary inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed"
                >
                  {aiBusy ? <RotateCw className="animate-spin" size={16} aria-hidden="true" /> : <Cpu size={16} aria-hidden="true" />}
                  Simulate AI Control
                </button>
              </div>
              {!device.controlEnabled ? <p className="mt-3 text-xs font-semibold text-slate-500">Control disabled for protected load safety.</p> : null}
            </article>
          );
        })}
      </section>
    </PageScaffold>
  );
}
