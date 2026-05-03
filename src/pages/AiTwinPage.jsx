import { Cpu, Gauge, LockKeyhole, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HudHero, HudRadar, HudSystemStatus, HudThreatLog } from "../components/dashboard/HudUI.jsx";
import EnergyTwinSimulator from "../components/EnergyTwinSimulator.jsx";
import { formatCurrency, formatEnergy, MetricCard } from "../components/ui.jsx";
import { LoadingPanel, PageScaffold, useReadyDashboard } from "./pageShared.jsx";

export default function AiTwinPage() {
  const navigate = useNavigate();
  const { actions, dashboard, loading, mode, ready } = useReadyDashboard();

  if (!ready && loading) return <LoadingPanel title="Loading AI twin" />;

  const scenarios = dashboard?.twinScenarios || [];
  const recommendedScenario = scenarios.find((item) => item.id === "full-ai-optimization") || scenarios[0] || {};
  const previewItems = [
    "Reduce AC usage after office hours",
    "Turn off lighting in unused zones",
    "Shift equipment usage to lower-cost hours",
    "Compare zone efficiency",
    "Simulate occupancy changes"
  ];

  if (mode !== "enterprise") {
    return (
      <PageScaffold
        eyebrow="AI Twin"
        title="Industry simulation locked"
        description="AI Twin is available for Industry-tier users. Book an energy assessment to unlock facility-level simulation."
      >
        <section className="grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)]">
          <div className="hud-card dashboard-hero rounded-2xl border border-cyan-300/20 p-6 sm:p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
              <LockKeyhole size={22} aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-3xl font-semibold leading-tight text-white">AI Twin is available for Industry-tier users.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Book an energy assessment to unlock facility-level simulation with panel, gateway, multi-zone, and schedule data.
            </p>
            <button type="button" className="hud-button-primary mt-6 inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition">
              Book Energy Assessment
            </button>
          </div>

          <div className="hud-card rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/65">Industry preview</p>
            <h3 className="mt-2 text-xl font-semibold text-white">What AI Twin can simulate</h3>
            <div className="mt-4 grid gap-3">
              {previewItems.map((item) => (
                <div key={item} className="hud-tile rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm font-semibold text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </PageScaffold>
    );
  }

  return (
    <PageScaffold
      eyebrow="AI Twin · Tactical HUD"
      title="Simulation Command Center"
      description="Pre-action analysis interface. Select a scenario, run projection, approve only after sim confidence meets threshold."
    >
      <div data-theme-skin="hud" className="theme-skin theme-skin--hud">
        <HudHero scenarios={scenarios} recommendedScenario={recommendedScenario} mode={mode} />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Scenarios" value={scenarios.length} detail="Available twin models" icon={Cpu} />
          <MetricCard label="Best Savings" value={formatEnergy(recommendedScenario.savingsKwh || 0)} detail="Projected kWh reduction" icon={Zap} tone="green" />
          <MetricCard
            label="Cost Impact"
            value={formatCurrency(recommendedScenario.savingsCost || 0, dashboard?.summary?.currency)}
            detail="Scenario estimate"
            icon={Sparkles}
            tone="green"
          />
          <MetricCard label="Confidence" value={`${recommendedScenario.confidence || 0}%`} detail="Model confidence" icon={Gauge} />
        </section>

        <section className="hud-grid">
          <HudRadar
            scenarios={scenarios}
            onSelectScenario={(scenario) => {
              // Scroll to the simulator and store selection in a custom event
              // the simulator listens for. This avoids invasive refactor.
              if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("twin:select-scenario", { detail: scenario }));
                const target = document.querySelector(".hud-grid")?.nextElementSibling;
                if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          />
          <HudSystemStatus
            devices={dashboard?.devices || []}
            summary={dashboard?.summary}
          />
          <HudThreatLog
            notifications={dashboard?.notifications || []}
            auditLog={dashboard?.auditLog || []}
          />
        </section>

        <EnergyTwinSimulator
          mode={mode}
          summary={dashboard?.summary}
          settings={dashboard?.settings}
          trends={dashboard?.trends}
          scenarios={dashboard?.twinScenarios || []}
          onSimulate={actions.simulateOptimization}
          onApply={actions.applyOptimization}
          onNavigate={navigate}
        />
      </div>
    </PageScaffold>
  );
}
