import { AlertTriangle, DollarSign, Gauge, Leaf, TrendingDown, TrendingUp, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { formatCurrency, formatEnergy, formatPercent } from "./ui.jsx";

export const summaryCardOptions = [
  { key: "energy", label: "Energy Today" },
  { key: "cost", label: "Estimated Cost" },
  { key: "efficiency", label: "Efficiency Score" },
  { key: "alerts", label: "Active Alerts" },
  { key: "potentialSaving", label: "Potential Saving" },
  { key: "co2Reduction", label: "CO2 Reduction" },
  { key: "occupancyWaste", label: "Occupancy Waste" }
];

function AnimatedMetric({ value, formatter }) {
  const target = Number(value || 0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(target)) {
      setDisplayValue(0);
      return undefined;
    }

    if (typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      setDisplayValue(target);
      return undefined;
    }

    const duration = 720;
    const startedAt = performance.now();
    let frameId = 0;

    function step(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(target * eased);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    }

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return formatter(displayValue);
}

export default function SummaryCards({ summary, activeAlerts = 0, cardOrder = summaryCardOptions.map((item) => item.key), maxItems, includeKeys }) {
  if (!summary) return null;

  const cards = {
    energy: {
      title: "Energy Today",
      value: summary.totalEnergyKwh,
      formatter: formatEnergy,
      detail: `${formatPercent(summary.comparison?.yesterday || 0)} vs yesterday`,
      icon: Zap,
      positiveIsGood: false,
      delta: summary.comparison?.yesterday || 0
    },
    cost: {
      title: "Estimated Cost",
      value: summary.estimatedCost,
      formatter: (value) => formatCurrency(value, summary.currency),
      detail: `${formatPercent(summary.comparison?.lastWeek || 0)} vs last week`,
      icon: DollarSign,
      positiveIsGood: false,
      delta: summary.comparison?.lastWeek || 0
    },
    efficiency: {
      title: "Efficiency Score",
      value: summary.efficiencyScore,
      formatter: (value) => `${Math.round(value)}/100`,
      detail: "Higher score means less waste",
      icon: Gauge,
      positiveIsGood: true,
      delta: summary.efficiencyScore - 75
    },
    alerts: {
      title: "Active Alerts",
      value: activeAlerts,
      formatter: (value) => Math.round(value).toLocaleString(),
      detail: activeAlerts > 0 ? "Needs review today" : "All clear",
      icon: AlertTriangle,
      positiveIsGood: false,
      delta: activeAlerts
    },
    potentialSaving: {
      title: "Potential Saving",
      value: summary.potentialSavingsCost || 0,
      formatter: (value) => formatCurrency(value, summary.currency),
      detail: `${formatEnergy(summary.potentialSavingsKwh || 0)} avoidable`,
      icon: DollarSign,
      positiveIsGood: true,
      delta: summary.potentialSavingsKwh || 0
    },
    co2Reduction: {
      title: "CO2 Reduction",
      value: summary.carbonReductionPotentialKg || 0,
      formatter: (value) => `${Math.round(value).toLocaleString()} kg`,
      detail: "From AI optimization",
      icon: Leaf,
      positiveIsGood: true,
      delta: summary.carbonReductionPotentialKg || 0
    },
    occupancyWaste: {
      title: "Occupancy Waste",
      value: summary.occupancyWasteKwh || 0,
      formatter: formatEnergy,
      detail: `${formatCurrency(summary.occupancyWasteCost || 0, summary.currency)} empty-space waste`,
      icon: Users,
      positiveIsGood: false,
      delta: summary.occupancyWasteKwh || 0
    }
  };

  const orderedKeys = includeKeys?.length
    ? includeKeys
    : [...cardOrder, ...summaryCardOptions.map((item) => item.key).filter((key) => !cardOrder.includes(key))];
  const orderedCards = orderedKeys
    .map((key) => cards[key])
    .filter(Boolean)
    .slice(0, maxItems || undefined);

  return (
    <section className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Energy summary">
      {orderedCards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.delta <= 0 ? TrendingDown : TrendingUp;
        const good = card.positiveIsGood ? card.delta >= 0 : card.delta <= 0;

        return (
          <article
            key={card.title}
            className="hud-card hud-kpi-card group flex min-h-[160px] flex-col justify-between rounded-2xl border border-slate-700/60 bg-slate-900/75 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/65">{card.title}</p>
                <p className="hud-kpi-value mt-3 break-words font-headline-lg text-3xl font-semibold leading-tight tracking-normal text-white">
                  <AnimatedMetric value={card.value} formatter={card.formatter} />
                </p>
              </div>
              <span className="hud-kpi-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                <Icon size={20} aria-hidden="true" />
              </span>
            </div>
            <div
              className={`mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                good
                  ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                  : "border-amber-300/30 bg-amber-400/10 text-amber-200"
              }`}
            >
              <TrendIcon size={14} aria-hidden="true" />
              {card.detail}
            </div>
          </article>
        );
      })}
    </section>
  );
}
