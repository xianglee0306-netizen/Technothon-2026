import { Calculator } from "lucide-react";
import { formatCurrency, formatEnergy, Panel, SectionHeader } from "./ui.jsx";

export default function CostAnalysis({ summary, settings }) {
  if (!summary || !settings) return null;

  const values = [
    {
      label: "Estimated cost today",
      value: formatCurrency(summary.estimatedCost, summary.currency)
    },
    {
      label: "Projected monthly cost",
      value: formatCurrency(summary.projectedMonthlyCost, summary.currency)
    },
    {
      label: "Potential savings",
      value: formatCurrency(summary.potentialSavingsCost, summary.currency)
    },
    {
      label: "Savings energy impact",
      value: formatEnergy(summary.potentialSavingsKwh)
    }
  ];

  return (
    <Panel className="overflow-hidden">
      <SectionHeader icon={Calculator} eyebrow="Tariff model" title="Cost analysis" />
      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
        {values.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600 sm:px-5">
        Current tariff: <span className="font-semibold text-slate-950">{formatCurrency(settings.tariffRate, settings.currency)}</span> per kWh.
        Update it from settings for local tariff simulation.
      </div>
    </Panel>
  );
}
