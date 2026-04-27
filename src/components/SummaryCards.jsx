import { Activity, Cloud, DollarSign, Gauge, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { formatCurrency, formatEnergy, formatPercent } from "./ui.jsx";

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      title: "Energy today",
      value: formatEnergy(summary.totalEnergyKwh),
      detail: `${formatPercent(summary.comparison.yesterday)} vs yesterday`,
      icon: Zap,
      positiveIsGood: false,
      delta: summary.comparison.yesterday
    },
    {
      title: "Estimated cost",
      value: formatCurrency(summary.estimatedCost, summary.currency),
      detail: `${formatPercent(summary.comparison.lastWeek)} vs last week`,
      icon: DollarSign,
      positiveIsGood: false,
      delta: summary.comparison.lastWeek
    },
    {
      title: "Carbon emission",
      value: `${Math.round(summary.carbonKg).toLocaleString()} kg`,
      detail: `${formatPercent(summary.comparison.monthlyAverage)} vs monthly avg`,
      icon: Cloud,
      positiveIsGood: false,
      delta: summary.comparison.monthlyAverage
    },
    {
      title: "Efficiency score",
      value: `${summary.efficiencyScore}/100`,
      detail: "Higher score means less waste",
      icon: Gauge,
      positiveIsGood: true,
      delta: summary.efficiencyScore - 75
    }
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Energy summary">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.delta <= 0 ? TrendingDown : TrendingUp;
        const good = card.positiveIsGood ? card.delta >= 0 : card.delta <= 0;

        return (
          <article
            key={card.title}
            className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-[0_20px_70px_rgba(2,6,23,0.28)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-400">{card.title}</p>
                <p className="mt-2 text-2xl font-semibold tracking-normal text-white">{card.value}</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                <Icon size={20} aria-hidden="true" />
              </span>
            </div>
            <div
              className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                good ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200" : "border-amber-300/30 bg-amber-400/10 text-amber-200"
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
