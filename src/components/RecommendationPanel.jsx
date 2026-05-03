import { Bot, CheckCircle2, ClipboardCheck, PlayCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { Accordion, EmptyState, formatCurrency, formatEnergy, Panel, PriorityBadge, SectionHeader } from "./ui.jsx";

function requiresApproval(recommendation) {
  return Boolean(recommendation.requiresApproval || recommendation.riskLevel === "Critical" || recommendation.priority === "Critical");
}

function metricValue(value, fallback = 0) {
  return Number(value ?? fallback);
}

function difficultyFor(recommendation) {
  if (recommendation.difficulty) return recommendation.difficulty;
  if (recommendation.requiresApproval || recommendation.riskLevel === "Critical" || recommendation.riskLevel === "High") return "Medium";
  if (metricValue(recommendation.estimatedSavingsKwh) > 100) return "Medium";
  return "Easy";
}

function simulateRecommendationImpact(recommendation, tariffRate = 0.5) {
  const projectedSavingsKwh = metricValue(recommendation?.estimatedSavingsKwh);
  return {
    recommendationId: recommendation?.id,
    projectedSavingsKwh,
    projectedSavingsCost: metricValue(recommendation?.estimatedSavingsCost, projectedSavingsKwh * tariffRate),
    projectedCo2ReductionKg: metricValue(recommendation?.estimatedCo2ReductionKg, projectedSavingsKwh * 0.67),
    projectedEfficiencyScore: Math.min(100, 80 + Math.round(projectedSavingsKwh))
  };
}

const advisorCopyByMode = {
  residential: { eyebrow: "AI savings advisor", title: "Smart home recommendations" },
  business: { eyebrow: "AI operations advisor", title: "Premise optimization recommendations" },
  enterprise: { eyebrow: "AI operations advisor", title: "Facility optimization recommendations" }
};

export default function RecommendationPanel({ mode, recommendations, currency = "MYR", onSimulate, onApply, onRequestApproval }) {
  const [simulations, setSimulations] = useState({});
  const [messages, setMessages] = useState({});
  const [busy, setBusy] = useState({});
  const advisorCopy = advisorCopyByMode[mode] || advisorCopyByMode.residential;

  async function runAction(recommendation, type, action) {
    const id = recommendation.id;
    setBusy((current) => ({ ...current, [`${type}-${id}`]: true }));
    setMessages((current) => ({ ...current, [id]: "" }));
    try {
      const response = await action();
      if (type === "simulate") {
        setSimulations((current) => ({ ...current, [id]: response || simulateRecommendationImpact(recommendation) }));
        setMessages((current) => ({ ...current, [id]: response?.message || "Recommendation impact simulated." }));
      } else {
        setMessages((current) => ({ ...current, [id]: response?.message || "Action completed." }));
      }
      return response;
    } catch (error) {
      setMessages((current) => ({ ...current, [id]: error.message || "Action failed." }));
      return null;
    } finally {
      setBusy((current) => ({ ...current, [`${type}-${id}`]: false }));
    }
  }

  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon={Bot}
        eyebrow={advisorCopy.eyebrow}
        title={advisorCopy.title}
      />

      <div className="space-y-3 p-4 sm:p-5">
        {(recommendations || []).length ? null : (
          <EmptyState title="No AI recommendations yet" description="Recommendations will appear when the simulated dashboard identifies a safe optimization action." />
        )}

        {(recommendations || []).map((recommendation) => {
          const simulation = simulations[recommendation.id];
          const approvalNeeded = requiresApproval(recommendation);
          const applied = recommendation.status === "Applied";
          const pendingApproval = String(recommendation.status || "").includes("Pending");

          return (
            <article key={recommendation.id} className="hud-card rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                    <Sparkles size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{recommendation.title}</p>
                      <span className="rounded-full border border-white/10 bg-slate-950/35 px-2.5 py-1 text-xs font-semibold text-slate-300">
                        {recommendation.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{recommendation.message}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                        {formatEnergy(metricValue(recommendation.estimatedSavingsKwh))}
                      </span>
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                        {recommendation.confidence}% confidence
                      </span>
                      <span className="rounded-full border border-white/10 bg-slate-950/35 px-2.5 py-1 text-xs font-semibold text-slate-300">
                        {formatCurrency(metricValue(recommendation.estimatedSavingsCost), currency)}
                      </span>
                      <span className="rounded-full border border-blue-300/20 bg-blue-400/10 px-2.5 py-1 text-xs font-semibold text-blue-100">
                        {difficultyFor(recommendation)} difficulty
                      </span>
                    </div>
                  </div>
                </div>
                <PriorityBadge priority={recommendation.priority} />
              </div>

              <Accordion title="Impact details" eyebrow="Savings model" className="mt-4" defaultOpen={Boolean(simulation || messages[recommendation.id])}>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)]">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span>Confidence</span>
                      <span>{recommendation.confidence}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-800">
                      <div className="h-2 rounded-full bg-cyan-300" style={{ width: `${recommendation.confidence}%` }} />
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <div className="hud-tile rounded-xl border border-white/10 bg-slate-950/30 p-3">
                        <p className="text-xs text-slate-400">kWh saving</p>
                        <p className="mt-1 font-semibold text-white">{formatEnergy(metricValue(recommendation.estimatedSavingsKwh))}</p>
                      </div>
                      <div className="hud-tile rounded-xl border border-white/10 bg-slate-950/30 p-3">
                        <p className="text-xs text-slate-400">MYR saving</p>
                        <p className="mt-1 font-semibold text-white">{formatCurrency(metricValue(recommendation.estimatedSavingsCost), currency)}</p>
                      </div>
                      <div className="hud-tile rounded-xl border border-white/10 bg-slate-950/30 p-3">
                        <p className="text-xs text-slate-400">CO2 cut</p>
                        <p className="mt-1 font-semibold text-white">{metricValue(recommendation.estimatedCo2ReductionKg).toLocaleString()} kg</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="hud-tile rounded-xl border border-amber-300/18 bg-amber-400/10 p-3">
                        <p className="text-xs text-amber-100/75">Before</p>
                        <p className="mt-1 text-sm leading-5 text-slate-200">
                          {recommendation.before || recommendation.message || "Current schedule allows avoidable runtime."}
                        </p>
                      </div>
                      <div className="hud-tile rounded-xl border border-emerald-300/18 bg-emerald-400/10 p-3">
                        <p className="text-xs text-emerald-100/75">After</p>
                        <p className="mt-1 text-sm leading-5 text-slate-200">
                          {recommendation.after || recommendation.impact || "Recommended change reduces waste while preserving comfort and operations."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="hud-tile rounded-xl border border-white/10 bg-slate-950/35 p-3 text-sm">
                    <p className="font-semibold text-white">{recommendation.impact}</p>
                    <p className="mt-1 text-xs text-slate-400">{recommendation.target || "Dashboard-level optimization"}</p>
                    {simulation ? (
                      <div className="mt-3 rounded-lg border border-emerald-300/20 bg-emerald-400/10 p-3 text-emerald-50">
                        <p className="font-semibold">Projected impact</p>
                        <p className="mt-1 text-xs leading-5">
                          {formatEnergy(simulation.projectedSavingsKwh)} saved, {formatCurrency(simulation.projectedSavingsCost, currency)} reduced, score moves to{" "}
                          {simulation.projectedEfficiencyScore}/100.
                        </p>
                      </div>
                    ) : null}
                    {messages[recommendation.id] ? (
                      <div className="mt-3 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3 text-xs font-semibold leading-5 text-cyan-50">
                        {messages[recommendation.id]}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Accordion>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => runAction(recommendation, "simulate", () => onSimulate?.(recommendation.id))}
                  disabled={busy[`simulate-${recommendation.id}`]}
                  className="hud-button-primary inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition"
                >
                  <PlayCircle size={16} aria-hidden="true" />
                  {busy[`simulate-${recommendation.id}`] ? "Simulating..." : "Simulate Impact"}
                </button>
                <button
                  type="button"
                  onClick={() => runAction(recommendation, "apply", () => onApply?.(recommendation.id))}
                  disabled={busy[`apply-${recommendation.id}`] || applied}
                  className="hud-button-success inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition"
                >
                  <CheckCircle2 size={16} aria-hidden="true" />
                  {busy[`apply-${recommendation.id}`] ? "Applying..." : applied ? "Applied" : "Apply AI Action"}
                </button>
                {approvalNeeded ? (
                  <button
                    type="button"
                    onClick={() => runAction(recommendation, "approval", () => onRequestApproval?.(recommendation.id))}
                    disabled={busy[`approval-${recommendation.id}`] || pendingApproval || applied}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-amber-300/25 bg-amber-400/10 px-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/15 disabled:border-white/10 disabled:bg-white/5 disabled:text-slate-500"
                  >
                    <ClipboardCheck size={16} aria-hidden="true" />
                    {busy[`approval-${recommendation.id}`] ? "Requesting..." : pendingApproval ? "Approval Pending" : "Request Approval"}
                  </button>
                ) : null}
              </div>
              {applied || pendingApproval ? (
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {applied ? "This action has already been applied to the simulated dashboard." : "This action is waiting in the safety approval queue."}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </Panel>
  );
}
