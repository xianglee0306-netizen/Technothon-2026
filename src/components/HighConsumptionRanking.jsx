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
              className={`rounded-lg border p-3 ${
                isWorst ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                    isWorst ? "bg-red-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">{device.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{device.type}</p>
                    </div>
                    <StatusBadge status={device.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Usage</p>
                      <p className="font-semibold text-slate-950">{formatEnergy(device.usageKwh)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Cost</p>
                      <p className="font-semibold text-slate-950">{formatCurrency(device.costContribution, currency)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Share</p>
                      <p className="font-semibold text-slate-950">{device.sharePercent}%</p>
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
