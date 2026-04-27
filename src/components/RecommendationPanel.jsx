import { Bot, Sparkles } from "lucide-react";
import { Panel, PriorityBadge, SectionHeader } from "./ui.jsx";

export default function RecommendationPanel({ mode, recommendations }) {
  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon={Bot}
        eyebrow={mode === "enterprise" ? "AI operations advisor" : "AI savings advisor"}
        title={mode === "enterprise" ? "AI recommendations for facility action" : "AI recommendations"}
      />

      <div className="space-y-3 p-4 sm:p-5">
        {(recommendations || []).map((recommendation) => (
          <article key={recommendation.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                  <Sparkles size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-white">{recommendation.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{recommendation.message}</p>
                </div>
              </div>
              <PriorityBadge priority={recommendation.priority} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Confidence</span>
                  <span>{recommendation.confidence}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${recommendation.confidence}%` }} />
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2 text-sm">
                <p className="font-semibold text-white">{recommendation.impact}</p>
                <p className="mt-1 text-xs text-slate-400">{recommendation.status}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
