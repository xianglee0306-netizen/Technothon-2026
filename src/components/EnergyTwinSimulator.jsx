import { ArrowRight, Cpu, Play, Rocket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Accordion, formatCurrency, formatEnergy, Panel, SectionHeader } from "./ui.jsx";

function calculateBeforeAfterSavings(scenario, tariffRate = 0.5) {
  const beforeKwh = Number(scenario?.beforeKwh || 0);
  const afterKwh = Number(scenario?.afterKwh || 0);
  const savingsKwh = Number(scenario?.savingsKwh ?? Math.max(beforeKwh - afterKwh, 0));
  const savingsPercent = beforeKwh ? Number(((savingsKwh / beforeKwh) * 100).toFixed(1)) : 0;

  return {
    beforeKwh,
    afterKwh,
    savingsKwh,
    savingsPercent,
    savingsCost: Number((scenario?.savingsCost ?? savingsKwh * tariffRate).toFixed(2)),
    co2ReductionKg: Number((scenario?.co2ReductionKg ?? savingsKwh * 0.67).toFixed(1)),
    scoreBefore: Number(scenario?.scoreBefore || 0),
    scoreAfter: Number(scenario?.scoreAfter || 0),
    confidence: Number(scenario?.confidence || 0)
  };
}

function generateOptimizedTrend(trends = [], scenario) {
  const beforeKwh = Number(scenario?.beforeKwh || 1);
  const afterKwh = Number(scenario?.afterKwh || beforeKwh);
  const ratio = beforeKwh ? afterKwh / beforeKwh : 1;

  return (trends || []).map((point) => ({
    label: point.label,
    current: Number(point.kwh || 0),
    optimized: Number((Number(point.kwh || 0) * ratio).toFixed(2))
  }));
}

function simulateOptimization(scenarios = [], scenarioId, summary, settings, trends = []) {
  const aliases = {
    "peak-shaving": "peak-demand-shaving",
    "hvac-schedule": "hvac-schedule-optimization",
    "compressor-maintenance": "fault-maintenance",
    "full-ai": "full-ai-optimization"
  };
  const normalizedId = aliases[scenarioId] || scenarioId;
  const scenario =
    scenarios.find((item) => item.id === normalizedId) ||
    scenarios.find((item) => item.id === scenarioId) ||
    scenarios.find((item) => item.id === "full-ai-optimization") ||
    scenarios[0];
  if (!scenario) return null;

  return {
    ...scenario,
    ...calculateBeforeAfterSavings(scenario, Number(settings?.tariffRate || summary?.tariffRate || 0.5)),
    optimizedTrend: generateOptimizedTrend(trends, scenario)
  };
}

function Metric({ label, value, tone = "cyan" }) {
  const toneClass =
    tone === "green"
      ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
      : tone === "amber"
        ? "border-amber-300/25 bg-amber-400/10 text-amber-100"
        : "border-cyan-300/25 bg-cyan-400/10 text-cyan-100";

  return (
    <div className={`hud-tile rounded-xl border p-3 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-75">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function ComparisonMetric({ label, value }) {
  return (
    <div className="hud-tile rounded-xl border border-white/10 bg-slate-950/30 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function timeStamp() {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());
}

function WorkflowStep({ label, active, complete }) {
  return (
    <div
      className={`hud-tile flex min-h-12 items-center gap-3 rounded-2xl border px-3 py-2 ${
        active
          ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-50"
          : complete
            ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
            : "border-white/10 bg-white/[0.035] text-slate-400"
      }`}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${active ? "bg-cyan-300" : complete ? "bg-emerald-300" : "bg-slate-600"}`} />
      <span className="text-xs font-semibold">{label}</span>
    </div>
  );
}

export default function EnergyTwinSimulator({ mode, summary, settings, trends, scenarios, onSimulate, onApply, onNavigate, compact = false }) {
  const scenarioList = scenarios?.length ? scenarios : [];
  const [selectedScenarioId, setSelectedScenarioId] = useState(scenarioList.find((item) => item.id === "full-ai-optimization")?.id || scenarioList[0]?.id || "");
  const [simulation, setSimulation] = useState(null);
  const [applied, setApplied] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState("ready");
  const [lastSimulatedAt, setLastSimulatedAt] = useState("");
  const [appliedAt, setAppliedAt] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [applyBusy, setApplyBusy] = useState(false);
  const fallbackSimulation = useMemo(
    () => simulateOptimization(scenarioList, selectedScenarioId, summary, settings, trends?.data || []),
    [scenarioList, selectedScenarioId, summary, settings, trends]
  );
  const activeSimulation = simulation || fallbackSimulation;
  const selectedScenario = scenarioList.find((item) => item.id === selectedScenarioId) || activeSimulation;
  const hasRunSimulation = Boolean(simulation);
  const beforeAfterData = activeSimulation
    ? [
        { label: "Current", kwh: activeSimulation.beforeKwh },
        { label: "Optimized", kwh: activeSimulation.afterKwh }
      ]
    : [];
  const currency = summary?.currency || settings?.currency || "MYR";

  useEffect(() => {
    if (scenarioList.length && (!selectedScenarioId || !scenarioList.some((item) => item.id === selectedScenarioId))) {
      setSelectedScenarioId(scenarioList.find((item) => item.id === "full-ai-optimization")?.id || scenarioList[0].id);
    }
  }, [scenarioList, selectedScenarioId]);

  // Listen for scenario picks from the HUD radar above. When a target is clicked
  // there, the radar dispatches "twin:select-scenario" — we sync that into local
  // state so the simulator immediately reflects the choice.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    function handleRadarSelect(event) {
      const scenario = event.detail;
      if (scenario?.id && scenarioList.some((s) => s.id === scenario.id)) {
        setSelectedScenarioId(scenario.id);
        setSimulation(null);
        setApplied(false);
        setFeedback(`Selected from radar: ${scenario.name || scenario.id}`);
      }
    }
    window.addEventListener("twin:select-scenario", handleRadarSelect);
    return () => window.removeEventListener("twin:select-scenario", handleRadarSelect);
  }, [scenarioList]);

  function selectScenario(scenarioId) {
    setSelectedScenarioId(scenarioId);
    setSimulation(null);
    setApplied(false);
    setWorkflowStatus("ready");
    setLastSimulatedAt("");
    setAppliedAt("");
    setFeedback("");
    setError("");
  }

  async function runSimulation() {
    if (!selectedScenarioId) return;
    setBusy(true);
    setApplied(false);
    setSimulation(null);
    setWorkflowStatus("running");
    setAppliedAt("");
    setFeedback("");
    setError("");
    try {
      const response = onSimulate ? await onSimulate(selectedScenarioId) : null;
      const nextSimulation = response?.simulation
        ? { ...(response.scenario || fallbackSimulation), ...response.simulation }
        : response?.scenario || response || fallbackSimulation;
      setSimulation(nextSimulation);
      setLastSimulatedAt(timeStamp());
      setWorkflowStatus("complete");
      setFeedback(response?.message || `${nextSimulation?.name || "Selected scenario"} simulation complete.`);
    } catch (simulationError) {
      setWorkflowStatus("error");
      setError(simulationError?.message || "Simulation failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function applyScenario() {
    if (!selectedScenarioId || !hasRunSimulation) return;
    setApplyBusy(true);
    setWorkflowStatus("applying");
    setError("");
    try {
      const response = onApply ? await onApply(selectedScenarioId) : null;
      setApplied(Boolean(response?.dashboard || response?.message || !onApply));
      setAppliedAt(timeStamp());
      setWorkflowStatus("applied");
      setFeedback(response?.message || `${activeSimulation.name} applied to the simulated dashboard.`);
    } catch (applyError) {
      setWorkflowStatus("error");
      setError(applyError?.message || "Apply scenario failed. Please try again.");
    } finally {
      setApplyBusy(false);
    }
  }

  if (!activeSimulation) {
    return null;
  }

  const currentCost = Number((Number(activeSimulation.beforeKwh || 0) * Number(settings?.tariffRate || summary?.tariffRate || 0.5)).toFixed(2));
  const currentCo2 = Number((Number(activeSimulation.beforeKwh || 0) * 0.67).toFixed(1));
  const scoreLift = Math.max(0, Number(activeSimulation.scoreAfter || 0) - Number(activeSimulation.scoreBefore || 0));
  const resultTone =
    workflowStatus === "applied"
      ? "border-emerald-300/35 bg-emerald-400/10"
      : workflowStatus === "complete"
        ? "border-cyan-300/35 bg-cyan-300/10"
        : "border-emerald-300/20 bg-emerald-400/10";

  const twinEyebrowByMode = {
    residential: "Home energy twin",
    business: "Premise energy twin",
    enterprise: "AI energy twin"
  };
  const twinLoadTitleByMode = {
    residential: "Current home load",
    business: "Current premise load",
    enterprise: "Current facility load"
  };
  const twinEyebrow = twinEyebrowByMode[mode] || twinEyebrowByMode.residential;
  const twinLoadTitle = twinLoadTitleByMode[mode] || twinLoadTitleByMode.residential;

  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon={Cpu}
        eyebrow={twinEyebrow}
        title="AI Energy Twin Simulator"
        action={
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
            {activeSimulation.confidence}% confidence
          </span>
        }
      />

      <div className="space-y-4 p-4 sm:p-5">
        <div className="hud-tile rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
          <p className="text-sm font-semibold text-white">Choose a scenario, preview the expected impact, then run the simulation before applying it.</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Selected scenario: <span className="font-semibold text-cyan-100">{selectedScenario?.name || activeSimulation.name}</span>
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            <WorkflowStep label="Scenario selected" complete={Boolean(selectedScenarioId)} active={workflowStatus === "ready"} />
            <WorkflowStep label={busy ? "Simulation running" : "Simulation ready"} complete={hasRunSimulation || applied} active={workflowStatus === "running"} />
            <WorkflowStep label="Simulation complete" complete={hasRunSimulation || applied} active={workflowStatus === "complete"} />
            <WorkflowStep label={applyBusy ? "Applying scenario" : "Scenario applied"} complete={applied} active={workflowStatus === "applying" || workflowStatus === "applied"} />
          </div>
        </div>

        <section aria-labelledby="scenario-selector-title" className="space-y-3">
          <div>
            <p id="scenario-selector-title" className="text-sm font-semibold text-white">Scenario selector</p>
            <p className="mt-1 text-sm text-slate-400">These cards set the scenario used by Run Simulation.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {scenarioList.map((scenario) => {
              const selected = scenario.id === selectedScenarioId;
              const impact = calculateBeforeAfterSavings(scenario, Number(settings?.tariffRate || summary?.tariffRate || 0.5));
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => selectScenario(scenario.id)}
                  aria-pressed={selected}
                  className={`hud-card min-h-32 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${
                    selected
                      ? "border-cyan-300/45 bg-cyan-300/15 shadow-[0_18px_50px_rgba(34,211,238,0.1)]"
                      : "border-white/10 bg-white/[0.04] hover:border-cyan-300/25 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{scenario.name}</p>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${selected ? "border-cyan-300/30 bg-cyan-300 text-slate-950" : "border-white/10 bg-slate-950/35 text-slate-300"}`}>
                      {selected ? "Selected" : `${scenario.confidence || 0}%`}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">{scenario.description}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <span className="rounded-xl border border-white/10 bg-slate-950/30 p-2 text-xs font-semibold text-emerald-100">{formatEnergy(impact.savingsKwh)}</span>
                    <span className="rounded-xl border border-white/10 bg-slate-950/30 p-2 text-xs font-semibold text-amber-100">{formatCurrency(impact.savingsCost, currency)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="hud-tile rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-stretch">
            <div className="hud-tile rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Current / Baseline State</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{twinLoadTitle}</h3>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <ComparisonMetric label="Current kWh" value={formatEnergy(activeSimulation.beforeKwh)} />
                <ComparisonMetric label="Current cost" value={formatCurrency(currentCost, currency)} />
                <ComparisonMetric label="Current CO2" value={`${currentCo2.toLocaleString()} kg`} />
                <ComparisonMetric label="Current score" value={`${activeSimulation.scoreBefore}/100`} />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="hud-tile inline-flex min-h-16 min-w-36 items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 px-4 text-sm font-semibold text-cyan-50">
                Twin model
                <ArrowRight size={18} aria-hidden="true" />
              </div>
            </div>

            <div className={`hud-tile rounded-2xl border p-4 transition ${resultTone}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100/75">Optimized / Predicted State</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-white">{applied ? "Applied simulation result" : hasRunSimulation ? "Simulation result" : "Preview before simulation"}</h3>
                {lastSimulatedAt ? (
                  <span className="rounded-full border border-white/10 bg-slate-950/30 px-2.5 py-1 text-xs font-semibold text-slate-300">
                    Last simulated {lastSimulatedAt}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <ComparisonMetric label="Optimized kWh" value={formatEnergy(activeSimulation.afterKwh)} />
                <ComparisonMetric label="Cost saved" value={formatCurrency(activeSimulation.savingsCost, currency)} />
                <ComparisonMetric label="CO2 reduced" value={`${Number(activeSimulation.co2ReductionKg).toLocaleString()} kg`} />
                <ComparisonMetric label="Score lift" value={`+${scoreLift} points`} />
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="hud-tile rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-white">{activeSimulation.name}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{activeSimulation.description}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Metric label="Saved" value={formatEnergy(activeSimulation.savingsKwh)} tone="green" />
              <Metric label="Cost saved" value={formatCurrency(activeSimulation.savingsCost, currency)} tone="amber" />
              {!compact ? <Metric label="CO2 reduced" value={`${Number(activeSimulation.co2ReductionKg).toLocaleString()} kg`} tone="green" /> : null}
              {!compact ? <Metric label="Confidence" value={`${activeSimulation.confidence}%`} /> : null}
            </div>
            <div className="hud-tile mt-4 rounded-xl border border-white/10 bg-slate-950/35 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">Result status</p>
              <p className="mt-1 text-sm font-semibold text-white">
                {workflowStatus === "running"
                  ? "Simulation running..."
                  : workflowStatus === "applying"
                    ? "Applying scenario..."
                    : workflowStatus === "applied"
                      ? `Applied at ${appliedAt}`
                      : workflowStatus === "complete"
                        ? `Simulation complete at ${lastSimulatedAt}`
                        : "Ready to simulate"}
              </p>
              {feedback ? <p className="mt-2 text-sm leading-5 text-slate-400">{feedback}</p> : null}
              {error ? <p className="mt-2 text-sm font-semibold leading-5 text-rose-200">{error}</p> : null}
            </div>
          </div>

          <div className={`hud-chart-shell hud-chart-grid ${compact ? "h-[240px]" : "h-[250px] sm:h-[290px]"} min-w-0 rounded-2xl border border-white/10 bg-slate-950/35 p-3`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={beforeAfterData} margin={{ top: 12, right: 8, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="twinBarFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.96" />
                    <stop offset="62%" stopColor="#22d3ee" stopOpacity="0.72" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.44" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" strokeDasharray="4 4" />
                <XAxis dataKey="label" tick={{ fill: "#cbd5e1", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={46} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "12px",
                    background: "rgba(15, 23, 42, 0.94)",
                    color: "#e2e8f0"
                  }}
                  formatter={(value) => [`${Number(value).toLocaleString()} kWh`, "Energy"]}
                />
                <Bar dataKey="kwh" fill="url(#twinBarFill)" radius={[8, 8, 0, 0]} barSize={52} isAnimationActive animationDuration={850} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {!compact ? (
          <div className="space-y-3">
            <Accordion title="How the twin works" eyebrow="Secondary explanation">
              <p className="text-sm leading-6 text-slate-400">
                The simulator uses deterministic mock telemetry for the selected profile. It compares the current baseline against an optimized prediction,
                then estimates kWh, MYR cost, CO2, confidence, and score impact before the action changes the dashboard state.
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Twin output examples</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {(activeSimulation.actions || []).map((action) => (
                  <div key={action} className="rounded-xl border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-slate-300">
                    <span className="mr-2 text-cyan-300/70" aria-hidden="true">-</span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </Accordion>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={runSimulation}
                disabled={busy}
                className="hud-button-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition"
              >
                <Play size={16} aria-hidden="true" />
                {busy ? "Running..." : "Run Simulation"}
              </button>
              <button
                type="button"
                onClick={applyScenario}
                disabled={applyBusy || !hasRunSimulation || applied}
                className="hud-button-success inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition"
                title={!hasRunSimulation ? "Run the selected simulation before applying it." : undefined}
              >
                <Rocket size={16} aria-hidden="true" />
                {applyBusy ? "Applying..." : applied ? "Applied" : "Apply Scenario"}
              </button>
            </div>
            {!hasRunSimulation ? (
              <p className="text-right text-xs font-semibold text-slate-500">Run Simulation first to unlock Apply Scenario.</p>
            ) : null}
            {applied ? (
              <div className="hud-tile rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-100">Scenario applied to the mock dashboard at {appliedAt}.</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      Updated dashboard metrics, trend projections, notification state, and audit history are available in the connected pages.
                    </p>
                  </div>
                  {onNavigate ? (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button type="button" onClick={() => onNavigate("/dashboard")} className="btn-secondary min-h-10 rounded-xl px-3 text-sm font-semibold transition">
                        View Dashboard
                      </button>
                      <button type="button" onClick={() => onNavigate("/reports")} className="btn-secondary min-h-10 rounded-xl px-3 text-sm font-semibold transition">
                        View Reports
                      </button>
                      <button type="button" onClick={() => onNavigate("/automation")} className="hud-button-success min-h-10 rounded-xl border px-3 text-sm font-semibold transition">
                        View Automation
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={runSimulation}
            disabled={busy}
            className="hud-button-primary inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition"
          >
            <Play size={16} aria-hidden="true" />
            {busy ? "Running..." : "Run Simulation"}
          </button>
        )}

      </div>
    </Panel>
  );
}
