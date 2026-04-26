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
    <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-100 p-1" aria-label="User mode">
      {modeOptions.map((option) => {
        const Icon = option.icon;
        const active = mode === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
              active ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
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
