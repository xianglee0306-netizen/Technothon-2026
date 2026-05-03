import { Calculator, Gauge, Leaf, TrendingUp } from "lucide-react";
import { TerminalChart, TerminalHero, TerminalOrderBook, TerminalWatchlist } from "../components/dashboard/TerminalUI.jsx";
import ROICalculator from "../components/ROICalculator.jsx";
import { formatCurrency, MetricCard } from "../components/ui.jsx";
import { LoadingPanel, PageScaffold, useReadyDashboard } from "./pageShared.jsx";

export default function ROIPage() {
  const { actions, dashboard, loading, mode, ready } = useReadyDashboard();

  if (!ready && loading) return <LoadingPanel title="Loading ROI model" />;

  const model = dashboard?.roiModel || {};

  return (
    <PageScaffold
      eyebrow="ROI · Trading Terminal"
      title="Energy Position Manager"
      description="Track your GridSenseIQ deployment as a financial position. Monthly yield, IRR, breakeven path, and live tariff depth — like reading any other asset."
    >
      <div data-theme-skin="terminal" className="theme-skin theme-skin--terminal">
        <TerminalHero model={model} mode={mode} />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Retrofit Cost" value={formatCurrency(model.totalCost || 0, "MYR")} detail="Modeled deployment" icon={Calculator} />
          <MetricCard label="Monthly Saving" value={formatCurrency(model.estimatedMonthlySavingsCost || 0, "MYR")} detail="Projected savings" icon={TrendingUp} tone="green" />
          <MetricCard label="Payback" value={`${model.paybackMonths || 0} months`} detail="Estimated period" icon={Gauge} tone="amber" />
          <MetricCard label="Carbon Saved" value={`${Math.round(model.carbonSavingsPerMonthKg || 0).toLocaleString()} kg/mo`} detail="Monthly reduction" icon={Leaf} tone="green" />
        </section>

        <section className="term-grid">
          <TerminalChart
            monthlySaving={Number(model.estimatedMonthlySavingsCost || 0)}
            retrofitCost={Number(model.totalCost || 0)}
            paybackMonths={Number(model.paybackMonths || 0)}
          />
          <TerminalWatchlist mode={mode} devices={dashboard?.devices || []} currency={dashboard?.summary?.currency || "MYR"} />
        </section>

        <section className="term-grid term-grid--reverse">
          <TerminalOrderBook
            projectedMonthlyKwh={dashboard?.summary?.projectedMonthlyKwh || 0}
            mode={mode}
          />
          <ROICalculator mode={mode} summary={dashboard?.summary} roiModel={dashboard?.roiModel} onCalculate={actions.calculateRoi} />
        </section>
      </div>
    </PageScaffold>
  );
}
