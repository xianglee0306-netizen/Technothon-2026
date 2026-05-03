import { Building2, Cloud, Coins, Globe2 } from "lucide-react";

const stats = [
  {
    icon: Coins,
    label: "TNB Tariff",
    value: "RM 0.218 – 0.571 / kWh",
    detail: "Tiered domestic rates (2026)"
  },
  {
    icon: Cloud,
    label: "Grid Carbon",
    value: "≈ 0.585 kg CO₂ / kWh",
    detail: "Malaysia national grid intensity"
  },
  {
    icon: Building2,
    label: "Commercial businesses",
    value: "1.2M+ businesses",
    detail: "Most still without energy intelligence"
  },
  {
    icon: Globe2,
    label: "SDG Alignment",
    value: "SDG 7 · 11 · 12 · 13",
    detail: "Affordable energy, sustainable cities, climate"
  }
];

export default function MalaysiaContext() {
  return (
    <section className="malaysia-strip relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-900/70 p-5 sm:p-6">
      <div className="malaysia-strip__glow" aria-hidden="true" />
      <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/70">
            <span className="malaysia-flag" aria-hidden="true" />
            Built for Malaysia
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Local tariffs. Local grid. Local impact.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            GridSenseIQ uses Malaysia-specific tariff bands and grid carbon intensity so every recommendation translates to real ringgit and real CO₂.
          </p>
        </div>
      </div>

      <div className="relative mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="malaysia-stat-card hud-tile rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/22 bg-cyan-300/10 text-cyan-100">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/70">{stat.label}</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-400">{stat.detail}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
