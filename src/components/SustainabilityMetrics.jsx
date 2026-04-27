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
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">CO2 today</p>
            <p className="mt-2 text-xl font-semibold text-white">{Math.round(summary.carbonKg).toLocaleString()} kg</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Monthly target</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {Number(settings.co2ReductionTargetKg).toLocaleString()} kg
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Saving score</p>
            <p className="mt-2 text-xl font-semibold text-white">{summary.efficiencyScore}/100</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-950/35 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-cyan-200" aria-hidden="true" />
              <p className="font-semibold text-white">CO2 reduction progress</p>
            </div>
            <span className="text-sm font-semibold text-cyan-200">{progress}%</span>
          </div>
          <div className="mt-3 h-3 rounded-full bg-slate-800">
            <div className="h-3 rounded-full bg-cyan-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Target combines projected savings from AI recommendations, schedule changes, and high-load maintenance actions.
          </p>
        </div>
      </div>
    </Panel>
  );
}
