import { BarChart3 } from "lucide-react";
import { formatCurrency, formatEnergy, Panel, SectionHeader, StatusBadge } from "./ui.jsx";

const breakdownCopyByMode = {
  residential: { eyebrow: "Appliance breakdown", title: "Rooms, appliances, and plug loads" },
  business: { eyebrow: "Zone breakdown", title: "Customer zones, equipment, and circuits" },
  enterprise: { eyebrow: "Device-level breakdown", title: "Machines, departments, and zones" }
};

function deviceLocationLabel(mode, device) {
  if (mode === "enterprise" && device.department) {
    return `${device.department} - ${device.zone || ""}`.replace(/\s-\s$/, "");
  }
  return device.zone || device.department || device.type || "";
}

function statusGlowClass(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (/\b(off|offline|stopped|disabled)\b/.test(normalized)) return "status-glow-off";
  if (/\b(standby|idle)\b/.test(normalized)) return "status-glow-standby";
  if (/\b(overconsuming|warning|critical|fault)\b/.test(normalized)) return "status-glow-warning";
  return "status-glow-on";
}

export default function DeviceBreakdown({ mode, devices, currency }) {
  const sortedDevices = [...(devices || [])].sort((a, b) => b.usageKwh - a.usageKwh);
  const topDevices = sortedDevices.slice(0, 6);
  const maxUsage = Math.max(...topDevices.map((device) => Number(device.usageKwh || 0)), 1);
  const copy = breakdownCopyByMode[mode] || breakdownCopyByMode.residential;

  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon={BarChart3}
        eyebrow={copy.eyebrow}
        title={copy.title}
      />

      <div className="space-y-4 p-4 sm:p-5">
        <div className="hud-tile rounded-2xl border border-cyan-300/15 bg-slate-950/35 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Ranked load split</p>
              <p className="mt-1 text-xs text-slate-400">Highest-consuming machines by current kWh.</p>
            </div>
            <span className="hud-chip rounded-full px-2.5 py-1 text-xs font-semibold text-cyan-100">
              Top {topDevices.length}
            </span>
          </div>
          <div className="grid gap-3">
            {topDevices.map((device) => {
              const width = Math.max(5, (Number(device.usageKwh || 0) / maxUsage) * 100);
              return (
                <div key={device.id} className="grid gap-2 md:grid-cols-[minmax(150px,0.32fr)_minmax(0,1fr)_auto] md:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{device.name}</p>
                    <p className="truncate text-xs text-slate-500">{device.zone || device.department || device.type}</p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800 shadow-[inset_0_1px_6px_rgba(0,0,0,0.35)]">
                    <div className="h-full rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.28)]" style={{ width: `${width}%` }} />
                  </div>
                  <div className="text-right text-xs font-semibold text-cyan-100">{formatEnergy(device.usageKwh)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {sortedDevices.map((device) => (
            <div key={device.id} className={`hud-card device-card rounded-2xl border bg-white/[0.055] p-4 ${statusGlowClass(device.status)}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{device.name}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {deviceLocationLabel(mode, device)}
                  </p>
                </div>
                <StatusBadge status={device.status} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-white">{formatEnergy(device.usageKwh)}</span>
                <span className="text-slate-400">{formatCurrency(device.costContribution, currency)}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-800 shadow-[inset_0_1px_6px_rgba(0,0,0,0.35)]">
                <div className="h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.24)]" style={{ width: `${Math.min(device.sharePercent, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
