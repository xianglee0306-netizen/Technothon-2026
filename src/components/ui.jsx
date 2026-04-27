import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";

export function formatEnergy(value) {
  if (value >= 1000) {
    return `${Math.round(value).toLocaleString()} kWh`;
  }

  return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })} kWh`;
}

export function formatCurrency(value, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value >= 1000 ? 0 : 2
  }).format(value);
}

export function formatPercent(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${Number(value).toFixed(1)}%`;
}

export function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-slate-900/70 shadow-[0_20px_70px_rgba(2,6,23,0.34)] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHeader({ icon: Icon, eyebrow, title, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            <Icon size={18} aria-hidden="true" />
          </span>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/70">{eyebrow}</p> : null}
          <h2 className="truncate text-base font-semibold text-white">{title}</h2>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    Running: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
    Idle: "border-amber-300/30 bg-amber-400/10 text-amber-200",
    Standby: "border-slate-300/20 bg-slate-300/10 text-slate-300",
    Overconsuming: "border-rose-300/30 bg-rose-400/10 text-rose-200",
    Offline: "border-zinc-300/20 bg-zinc-300/10 text-zinc-300"
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] || styles.Standby}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const styles = {
    Critical: "border-rose-300/30 bg-rose-400/10 text-rose-200",
    High: "border-orange-300/30 bg-orange-400/10 text-orange-200",
    Medium: "border-amber-300/30 bg-amber-400/10 text-amber-200",
    Low: "border-slate-300/20 bg-slate-300/10 text-slate-300"
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[priority] || styles.Low}`}>
      {priority}
    </span>
  );
}

export function SeverityIcon({ severity }) {
  if (severity === "Critical") {
    return <ShieldAlert className="text-rose-300" size={18} aria-hidden="true" />;
  }

  if (severity === "High") {
    return <AlertTriangle className="text-amber-300" size={18} aria-hidden="true" />;
  }

  if (severity === "Normal") {
    return <CheckCircle2 className="text-emerald-300" size={18} aria-hidden="true" />;
  }

  return <Info className="text-slate-300" size={18} aria-hidden="true" />;
}
