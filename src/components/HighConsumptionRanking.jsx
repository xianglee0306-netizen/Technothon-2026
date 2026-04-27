import { Flame } from "lucide-react";
import { formatCurrency, formatEnergy, Panel, SectionHeader, StatusBadge } from "./ui.jsx";

export default function HighConsumptionRanking({ devices, currency }) {
  const rankedDevices = [...(devices || [])].sort((a, b) => b.usageKwh - a.usageKwh).slice(0, 5);

  return (
    <Panel className="overflow-hidden">
      <SectionHeader icon={Flame} eyebrow="Waste detection" title="High consumption ranking" />
      <div className="space-y-3 p-4 sm:p-5">
        {rankedDevices.map((device, index) => {
          const isWorst = index === 0;

          return (
            <article
              key={device.id}
              className={`rounded-xl border p-3 ${
                isWorst ? "border-rose-300/30 bg-rose-400/10" : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
                    isWorst ? "bg-rose-400 text-slate-950" : "bg-white/10 text-slate-200"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{device.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{device.type}</p>
                    </div>
                    <StatusBadge status={device.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">Usage</p>
                      <p className="font-semibold text-white">{formatEnergy(device.usageKwh)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Cost</p>
                      <p className="font-semibold text-white">{formatCurrency(device.costContribution, currency)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Share</p>
                      <p className="font-semibold text-white">{device.sharePercent}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}
