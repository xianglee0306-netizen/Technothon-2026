import { Leaf, Target } from "lucide-react";
import { Panel, SectionHeader } from "./ui.jsx";

export default function SustainabilityMetrics({ summary, settings }) {
  if (!summary || !settings) return null;

  const progress = Math.min(summary.co2TargetProgress || 0, 100);

  return (
    <Panel className="overflow-hidden">
      <SectionHeader icon={Leaf} eyebrow="Sustainability" title="Carbon and savings progress" />
      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">CO2 today</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{Math.round(summary.carbonKg).toLocaleString()} kg</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Monthly target</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">
              {Number(settings.co2ReductionTargetKg).toLocaleString()} kg
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Saving score</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{summary.efficiencyScore}/100</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-teal-700" aria-hidden="true" />
              <p className="font-semibold text-slate-950">CO2 reduction progress</p>
            </div>
            <span className="text-sm font-semibold text-teal-700">{progress}%</span>
          </div>
          <div className="mt-3 h-3 rounded-full bg-slate-200">
            <div className="h-3 rounded-full bg-teal-700" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Target combines projected savings from AI recommendations, schedule changes, and high-load maintenance actions.
          </p>
        </div>
      </div>
    </Panel>
  );
}
