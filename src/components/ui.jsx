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
  return <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

export function SectionHeader({ icon: Icon, eyebrow, title, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Icon size={18} aria-hidden="true" />
          </span>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p> : null}
          <h2 className="truncate text-base font-semibold text-slate-950">{title}</h2>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    Running: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Idle: "border-amber-200 bg-amber-50 text-amber-700",
    Standby: "border-slate-200 bg-slate-50 text-slate-600",
    Overconsuming: "border-red-200 bg-red-50 text-red-700",
    Offline: "border-zinc-300 bg-zinc-100 text-zinc-600"
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] || styles.Standby}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const styles = {
    Critical: "border-red-200 bg-red-50 text-red-700",
    High: "border-orange-200 bg-orange-50 text-orange-700",
    Medium: "border-amber-200 bg-amber-50 text-amber-700",
    Low: "border-slate-200 bg-slate-50 text-slate-600"
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[priority] || styles.Low}`}>
      {priority}
    </span>
  );
}

export function SeverityIcon({ severity }) {
  if (severity === "Critical") {
    return <ShieldAlert className="text-red-600" size={18} aria-hidden="true" />;
  }

  if (severity === "High") {
    return <AlertTriangle className="text-amber-600" size={18} aria-hidden="true" />;
  }

  if (severity === "Normal") {
    return <CheckCircle2 className="text-teal-700" size={18} aria-hidden="true" />;
  }

  return <Info className="text-slate-500" size={18} aria-hidden="true" />;
}
