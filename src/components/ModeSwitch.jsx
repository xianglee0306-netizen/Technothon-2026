import { Building2, Home } from "lucide-react";

const modeOptions = [
  {
    id: "enterprise",
    label: "Enterprise / Industrial",
    shortLabel: "Enterprise",
    icon: Building2
  },
  {
    id: "residential",
    label: "Residential / SME",
    shortLabel: "Residential",
    icon: Home
  }
];

export default function ModeSwitch({ mode, onChange }) {
  return (
    <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-white/5 p-1" aria-label="User mode">
      {modeOptions.map((option) => {
        const Icon = option.icon;
        const active = mode === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold transition ${
              active ? "bg-cyan-300 text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.18)]" : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            aria-pressed={active}
            title={option.label}
          >
            <Icon size={17} aria-hidden="true" />
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
