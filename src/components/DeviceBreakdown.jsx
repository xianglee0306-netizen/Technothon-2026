import { BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, formatEnergy, Panel, SectionHeader, StatusBadge } from "./ui.jsx";

export default function DeviceBreakdown({ mode, devices, currency }) {
  const sortedDevices = [...(devices || [])].sort((a, b) => b.usageKwh - a.usageKwh);
  const chartData = sortedDevices.map((device) => ({
    name: device.name,
    kwh: device.usageKwh
  }));

  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon={BarChart3}
        eyebrow={mode === "enterprise" ? "Device-level breakdown" : "Category breakdown"}
        title={mode === "enterprise" ? "Machines, departments, and zones" : "Circuit group usage"}
      />

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] sm:p-5">
        <div className="h-[280px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, left: 14, bottom: 4 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" strokeDasharray="4 4" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                width={118}
                tick={{ fill: "#cbd5e1", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                contentStyle={{
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "12px",
                  background: "rgba(15, 23, 42, 0.94)",
                  color: "#e2e8f0"
                }}
                formatter={(value) => [`${Number(value).toLocaleString()} kWh`, "Usage"]}
              />
              <Bar dataKey="kwh" fill="#22d3ee" radius={[0, 8, 8, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {sortedDevices.slice(0, 5).map((device) => (
            <div key={device.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{device.name}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {mode === "enterprise" ? `${device.department} - ${device.zone}` : device.zone}
                  </p>
                </div>
                <StatusBadge status={device.status} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-white">{formatEnergy(device.usageKwh)}</span>
                <span className="text-slate-400">{formatCurrency(device.costContribution, currency)}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-800">
                <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${Math.min(device.sharePercent, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
