import { AlertTriangle, ArrowRight, Gauge } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency, formatEnergy, MetricCard, PriorityBadge } from "../components/ui.jsx";
import { LoadingPanel, PageScaffold, useReadyDashboard } from "./pageShared.jsx";

function severityTone(severity = "Medium") {
  if (severity === "Critical") return "border-rose-300/35 bg-rose-400/10 text-rose-100";
  if (severity === "High") return "border-orange-300/35 bg-orange-400/10 text-orange-100";
  if (severity === "Low") return "border-emerald-300/35 bg-emerald-400/10 text-emerald-100";
  return "border-amber-300/35 bg-amber-400/10 text-amber-100";
}

export default function FaultDetectionPage() {
  const { dashboard, loading, ready } = useReadyDashboard();

  if (!ready && loading) return <LoadingPanel title="Loading fault detection" />;

  const anomalies = dashboard?.anomalies || [];
  const criticalCount = anomalies.filter((item) => ["Critical", "High"].includes(item.severity)).length;
  const estimatedLoss = anomalies.reduce((sum, item) => sum + Number(item.estimatedLossKwh || 0), 0);

  return (
    <PageScaffold
      eyebrow="Fault detection"
      title="Diagnostic canvas"
      description="Review anomaly signals, likely causes, and operational impact. High-risk items can be addressed from the Actions or Automation workflows."
      actions={
        <Link to="/actions" className="hud-button-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition">
          Review actions
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      }
    >
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Open Risks" value={criticalCount} detail="Critical or high severity" icon={AlertTriangle} tone={criticalCount ? "amber" : "green"} />
        <MetricCard label="Estimated Loss" value={formatEnergy(estimatedLoss)} detail="Current anomaly load" icon={Gauge} tone="amber" />
        <MetricCard
          label="Avoidable Cost"
          value={formatCurrency(estimatedLoss * Number(dashboard?.summary?.tariffRate || 0.5), dashboard?.summary?.currency)}
          detail="Based on tariff assumptions"
          icon={Gauge}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {anomalies.map((anomaly) => (
          <article key={anomaly.id} className={`hud-card rounded-2xl border p-5 ${severityTone(anomaly.severity)}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">{anomaly.title || anomaly.deviceName || anomaly.target || "Detected anomaly"}</h2>
                  <PriorityBadge priority={anomaly.severity} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{anomaly.detectedPattern || anomaly.message || anomaly.description}</p>
              </div>
              <span className="hud-tile rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2 text-sm font-semibold text-white">
                {anomaly.confidence || 80}% confidence
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="hud-tile rounded-xl border border-white/10 bg-slate-950/35 p-3">
                <p className="text-xs text-slate-400">Deviation</p>
                <p className="mt-1 font-semibold text-white">{anomaly.deviationPercent || 0}%</p>
              </div>
              <div className="hud-tile rounded-xl border border-white/10 bg-slate-950/35 p-3">
                <p className="text-xs text-slate-400">Energy loss</p>
                <p className="mt-1 font-semibold text-white">{formatEnergy(anomaly.estimatedLossKwh || 0)}</p>
              </div>
              <div className="hud-tile rounded-xl border border-white/10 bg-slate-950/35 p-3">
                <p className="text-xs text-slate-400">Asset</p>
                <p className="mt-1 truncate font-semibold text-white">{anomaly.deviceName || anomaly.deviceId || "Facility zone"}</p>
              </div>
            </div>
            {anomaly.recommendedAction || anomaly.recommendation ? (
              <p className="hud-tile mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50">
                {anomaly.recommendedAction || anomaly.recommendation}
              </p>
            ) : null}
          </article>
        ))}
      </section>
    </PageScaffold>
  );
}
