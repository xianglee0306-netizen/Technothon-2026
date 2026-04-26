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
          <article key={recommendation.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <Sparkles size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-950">{recommendation.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{recommendation.message}</p>
                </div>
              </div>
              <PriorityBadge priority={recommendation.priority} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Confidence</span>
                  <span>{recommendation.confidence}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-teal-700" style={{ width: `${recommendation.confidence}%` }} />
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <p className="font-semibold text-slate-950">{recommendation.impact}</p>
                <p className="mt-1 text-xs text-slate-500">{recommendation.status}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
