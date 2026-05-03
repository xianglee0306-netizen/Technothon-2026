import { AlertTriangle, CheckCircle2, ClipboardCheck, Sparkles } from "lucide-react";
import { QuestDailyChallenges, QuestHero, QuestPanelHeader } from "../components/dashboard/QuestUI.jsx";
import RecommendationPanel from "../components/RecommendationPanel.jsx";
import { formatCurrency, formatEnergy, MetricCard } from "../components/ui.jsx";
import { LoadingPanel, PageScaffold, useReadyDashboard } from "./pageShared.jsx";

export default function ActionsPage() {
  const { actions, dashboard, loading, mode, ready } = useReadyDashboard();

  if (!ready && loading) return <LoadingPanel title="Loading AI actions" />;

  const recommendations = dashboard?.recommendations || [];
  const approvalRequired = recommendations.filter((item) => item.requiresApproval || item.riskLevel === "Critical").length;
  const potentialSavingsKwh = recommendations.reduce((sum, item) => sum + Number(item.estimatedSavingsKwh || 0), 0);
  const potentialSavingsCost = recommendations.reduce((sum, item) => sum + Number(item.estimatedSavingsCost || 0), 0);
  const co2Reduction = recommendations.reduce((sum, item) => sum + Number(item.estimatedCo2ReductionKg || 0), 0);

  return (
    <PageScaffold
      eyebrow="Save Energy"
      title="Quest Board"
      description="Complete recommendation quests to level up. Each applied action saves real ringgit and earns XP toward unlocking deeper automation."
    >
      <div data-theme-skin="quest" className="theme-skin theme-skin--quest">
        <QuestHero recommendations={recommendations} summary={dashboard?.summary} mode={mode} />

        <section className="quest-stat-row">
          <MetricCard label="Active Quests" value={recommendations.length} detail="Ready to claim" icon={Sparkles} />
          <MetricCard label="Epic Quests" value={approvalRequired} detail="Approval required" icon={ClipboardCheck} tone={approvalRequired ? "amber" : "green"} />
          <MetricCard label="Potential Loot" value={formatEnergy(potentialSavingsKwh)} detail={formatCurrency(potentialSavingsCost, dashboard?.summary?.currency)} icon={CheckCircle2} tone="green" />
          <MetricCard label="Carbon XP" value={`${Math.round(co2Reduction).toLocaleString()} kg`} detail="CO₂ reduction reward" icon={AlertTriangle} tone="green" />
        </section>

        <QuestDailyChallenges
          mode={mode}
          recommendations={recommendations}
          onSimulate={actions.simulateRecommendation}
        />

        <section className="quest-main-quests">
          <QuestPanelHeader count={recommendations.length} />
          <RecommendationPanel
            mode={mode}
            recommendations={dashboard?.recommendations || []}
            currency={dashboard?.summary?.currency || "MYR"}
            onSimulate={actions.simulateRecommendation}
            onApply={actions.applyRecommendation}
            onRequestApproval={actions.requestApproval}
          />
        </section>
      </div>
    </PageScaffold>
  );
}
