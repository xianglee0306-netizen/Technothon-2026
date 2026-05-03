import { Plus, ShieldCheck, ToggleLeft, ToggleRight, Workflow } from "lucide-react";
import { useState } from "react";
import { Accordion, AppSelect, EmptyState, formatEnergy, Panel, SectionHeader } from "./ui.jsx";

function evaluateAutomationRules(rules = []) {
  return rules.map((rule) => ({
    ...rule,
    evaluation: rule.enabled ? (rule.status?.includes("Triggered") ? "Triggered" : "Monitoring") : "Disabled"
  }));
}

function createAutomationRule(form = {}) {
  return {
    name: form.name || "New simulated rule",
    condition: form.condition || "IF usage exceeds baseline by 15%",
    action: form.action || "THEN notify energy manager",
    enabled: true,
    riskLevel: form.riskLevel || "Medium",
    requiresApproval: Boolean(form.requiresApproval),
    estimatedSavingsKwh: Number(form.estimatedSavingsKwh || 0),
    lastTriggered: "Not yet",
    status: "Monitoring"
  };
}

function riskClass(risk) {
  const styles = {
    Critical: "border-rose-300/35 bg-rose-400/15 text-rose-100",
    High: "border-orange-300/35 bg-orange-400/15 text-orange-100",
    Medium: "border-amber-300/35 bg-amber-400/15 text-amber-100",
    Low: "border-emerald-300/35 bg-emerald-400/15 text-emerald-100"
  };

  return styles[risk] || styles.Medium;
}

const defaultSavingsByMode = {
  residential: 1.4,
  business: 18,
  enterprise: 120
};

function defaultSavingsKwh(mode) {
  return defaultSavingsByMode[mode] ?? defaultSavingsByMode.residential;
}

export default function AutomationRulesPanel({ mode, rules, onToggle, onSave }) {
  const [form, setForm] = useState({
    name: "",
    condition: "",
    action: "",
    riskLevel: "Medium",
    requiresApproval: false,
    estimatedSavingsKwh: defaultSavingsKwh(mode)
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savingRule, setSavingRule] = useState(false);
  const [busyRuleId, setBusyRuleId] = useState("");
  const evaluatedRules = evaluateAutomationRules(rules || []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSavingRule(true);
    try {
      const rule = createAutomationRule(form);
      const response = onSave ? await onSave(rule) : null;
      setMessage(response?.message || "Automation rule created.");
      setForm({
        name: "",
        condition: "",
        action: "",
        riskLevel: "Medium",
        requiresApproval: false,
        estimatedSavingsKwh: defaultSavingsKwh(mode)
      });
    } catch (saveError) {
      setError(saveError?.message || "Automation rule could not be saved.");
    } finally {
      setSavingRule(false);
    }
  }

  async function handleToggle(rule) {
    setBusyRuleId(rule.id);
    setMessage("");
    setError("");
    try {
      const response = onToggle ? await onToggle(rule.id, !rule.enabled) : null;
      setMessage(response?.message || `${rule.name} updated.`);
    } catch (toggleError) {
      setError(toggleError?.message || `${rule.name} could not be updated.`);
    } finally {
      setBusyRuleId("");
    }
  }

  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon={Workflow}
        eyebrow="Smart automation rule engine"
        title="Safe simulated automation rules"
        action={
          <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
            {evaluatedRules.filter((rule) => rule.enabled).length} enabled
          </span>
        }
      />

      <div className="space-y-4 p-4 sm:p-5">
        {message ? <div className="rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100">{message}</div> : null}
        {error ? <div className="rounded-xl border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-100">{error}</div> : null}

        <div className="grid gap-3 lg:grid-cols-2">
          {evaluatedRules.length ? null : (
            <div className="lg:col-span-2">
              <EmptyState title="No automation rules yet" description="Create a simulated rule below to start monitoring occupancy, peak demand, or safety conditions." />
            </div>
          )}

          {evaluatedRules.map((rule) => (
            <article key={rule.id} className="hud-card rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-white">{rule.name}</p>
                  <p className="mt-1 text-xs text-slate-400">Last triggered: {rule.lastTriggered}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(rule)}
                  disabled={busyRuleId === rule.id}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
                    rule.enabled
                      ? "hud-button-success"
                      : "btn-secondary text-slate-300"
                  }`}
                >
                  {rule.enabled ? <ToggleRight size={18} aria-hidden="true" /> : <ToggleLeft size={18} aria-hidden="true" />}
                  {rule.enabled ? "On" : "Off"}
                </button>
              </div>

              <div className="mt-4 grid gap-2">
                <div className="hud-tile rounded-xl border border-white/10 bg-slate-950/30 p-3 text-sm leading-6 text-slate-200">{rule.condition}</div>
                <div className="hud-tile rounded-xl border border-white/10 bg-slate-950/30 p-3 text-sm leading-6 text-slate-200">{rule.action}</div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${riskClass(rule.riskLevel)}`}>{rule.riskLevel}</span>
                <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                  {formatEnergy(rule.estimatedSavingsKwh)} saving
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">{rule.evaluation}</span>
                {rule.requiresApproval ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/25 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-100">
                    <ShieldCheck size={13} aria-hidden="true" />
                    Approval guard
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <Accordion title="Create a simulated rule" eyebrow="Advanced control setup" defaultOpen={evaluatedRules.length === 0}>
          <form onSubmit={submit} className="hud-tile rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Rule name</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="Empty-room plug load timeout"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Risk level</span>
                <AppSelect
                  value={form.riskLevel}
                  onChange={(nextValue) => update("riskLevel", nextValue)}
                  options={["Low", "Medium", "High", "Critical"]}
                  buttonClassName="rounded-xl px-3"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">IF condition</span>
                <input
                  required
                  value={form.condition}
                  onChange={(event) => update("condition", event.target.value)}
                  placeholder="IF occupancy = 0 for 10 minutes"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">THEN action</span>
                <input
                  required
                  value={form.action}
                  onChange={(event) => update("action", event.target.value)}
                  placeholder="THEN turn off lighting"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Estimated savings (kWh)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.estimatedSavingsKwh}
                  onChange={(event) => update("estimatedSavingsKwh", event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
                />
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <input
                  type="checkbox"
                  checked={form.requiresApproval}
                  onChange={(event) => update("requiresApproval", event.target.checked)}
                  className="h-4 w-4 accent-cyan-300"
                />
                <span className="text-sm font-semibold text-slate-200">Requires approval before control</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={savingRule}
              className="hud-button-primary mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition sm:w-auto"
            >
              <Plus size={17} aria-hidden="true" />
              {savingRule ? "Creating..." : "Create simulated rule"}
            </button>
          </form>
        </Accordion>
      </div>
    </Panel>
  );
}
