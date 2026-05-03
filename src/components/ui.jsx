import { AlertTriangle, ArrowUpRight, CheckCircle2, ChevronDown, Info, ShieldAlert } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

export function formatEnergy(value) {
  if (value >= 1000) {
    return `${Math.round(value).toLocaleString()} kWh`;
  }

  return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })} kWh`;
}

export function formatCurrency(value, currency = "USD") {
  return new Intl.NumberFormat(currency === "MYR" ? "en-MY" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value >= 1000 ? 0 : 2
  }).format(value);
}

export function formatPercent(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${Number(value).toFixed(1)}%`;
}

function normalizeSelectOptions(options = []) {
  return (Array.isArray(options) ? options : []).map((option) => {
    if (typeof option === "string" || typeof option === "number") {
      return { value: String(option), label: String(option) };
    }

    return {
      value: String(option.value ?? option.id ?? option.label ?? ""),
      label: String(option.label ?? option.name ?? option.value ?? option.id ?? ""),
      disabled: Boolean(option.disabled)
    };
  });
}

export function AppSelect({ value, onChange, options = [], placeholder = "Select an option", disabled = false, className = "", buttonClassName = "" }) {
  const generatedId = useId();
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const normalizedOptions = useMemo(() => normalizeSelectOptions(options), [options]);
  const selectedOption = normalizedOptions.find((option) => String(option.value) === String(value));

  useEffect(() => {
    if (!open) return undefined;

    function updateMenuPosition() {
      const button = buttonRef.current;
      if (!button || typeof window === "undefined") return;

      const rect = button.getBoundingClientRect();
      const gutter = 8;
      const viewportWidth = window.innerWidth || 320;
      const viewportHeight = window.innerHeight || 640;
      const availableBelow = viewportHeight - rect.bottom - gutter;
      const availableAbove = rect.top - gutter;
      const openUp = availableBelow < 220 && availableAbove > availableBelow;
      const available = Math.max(openUp ? availableAbove : availableBelow, 140);
      const maxHeight = Math.max(128, Math.min(280, available - gutter));
      const width = Math.min(Math.max(rect.width, 180), Math.max(180, viewportWidth - gutter * 2));
      const left = Math.min(Math.max(gutter, rect.left), Math.max(gutter, viewportWidth - width - gutter));
      const top = openUp ? Math.max(gutter, rect.top - maxHeight - gutter) : Math.min(rect.bottom + gutter, viewportHeight - maxHeight - gutter);

      setMenuStyle({
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        maxHeight: `${maxHeight}px`
      });
    }

    function handlePointerDown(event) {
      if (buttonRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) return;
      setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    updateMenuPosition();
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  function choose(option) {
    if (option.disabled) return;
    onChange?.(option.value);
    setOpen(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
  }

  function handleButtonKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  const menu =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            id={`${generatedId}-listbox`}
            role="listbox"
            className="hud-panel fixed z-[90] overflow-y-auto rounded-2xl border border-cyan-300/20 bg-slate-950/98 p-1.5 text-sm text-slate-100 shadow-[0_24px_80px_rgba(2,6,23,0.62)] backdrop-blur-2xl"
            style={menuStyle}
          >
            {normalizedOptions.length ? (
              normalizedOptions.map((option) => {
                const selected = String(option.value) === String(value);
                return (
                  <button
                    key={`${option.value}-${option.label}`}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={option.disabled}
                    onClick={() => choose(option)}
                    className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition ${
                      selected
                        ? "hud-button-primary text-slate-950"
                        : "text-slate-200 hover:bg-cyan-300/10 hover:text-white"
                    } ${option.disabled ? "opacity-45" : ""}`}
                  >
                    <span className="min-w-0 break-words font-semibold">{option.label}</span>
                    {selected ? <CheckCircle2 size={15} aria-hidden="true" className="shrink-0" /> : null}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-slate-400">No options available</div>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${generatedId}-listbox`}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleButtonKeyDown}
        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-cyan-300/15 bg-white/[0.06] px-4 py-3 text-left text-sm font-semibold text-white outline-none transition hover:border-cyan-300/35 hover:bg-cyan-300/10 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-55 ${buttonClassName}`}
      >
        <span className={`min-w-0 truncate ${selectedOption ? "text-white" : "text-slate-400"}`}>{selectedOption?.label || placeholder}</span>
        <ChevronDown className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} size={18} aria-hidden="true" />
      </button>
      {menu}
    </div>
  );
}

export function PageShell({ children, className = "" }) {
  return <div className={`page-stack ${className}`}>{children}</div>;
}

export function Panel({ children, className = "" }) {
  return (
    <section className={`hud-panel h-full min-w-0 rounded-2xl border border-slate-700/60 bg-slate-900/75 ${className}`}>
      {children}
    </section>
  );
}

export function DashboardCard({ children, className = "" }) {
  return (
    <div className={`hud-card h-full min-w-0 rounded-2xl border border-slate-700/60 bg-white/[0.045] p-5 ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions, meta }) {
  return (
    <section className="page-header-soft min-w-0 rounded-3xl border border-slate-700/40 bg-slate-900/60 p-6 sm:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">{eyebrow}</p> : null}
          <h1 className="mt-3 max-w-5xl text-2xl font-semibold leading-tight tracking-[-0.005em] text-white sm:text-3xl">{title}</h1>
          {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300/95 sm:text-base">{description}</p> : null}
          {meta ? <div className="mt-4 flex flex-wrap gap-2">{meta}</div> : null}
        </div>
        {actions ? <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">{actions}</div> : null}
      </div>
    </section>
  );
}

export function MetricCard({ label, value, detail, icon: Icon, tone = "cyan" }) {
  const toneClass =
    tone === "green"
      ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
      : tone === "amber"
        ? "border-amber-300/25 bg-amber-400/10 text-amber-100"
        : tone === "rose"
          ? "border-rose-300/25 bg-rose-400/10 text-rose-100"
          : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";

  return (
    <DashboardCard className="group min-h-[152px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/65">{label}</p>
          <p className="hud-kpi-value mt-3 break-words text-3xl font-semibold leading-tight text-white">{value}</p>
          {detail ? <p className="mt-2 text-sm leading-5 text-slate-400">{detail}</p> : null}
        </div>
        {Icon ? (
          <span className={`hud-kpi-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneClass}`}>
            <Icon size={18} aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </DashboardCard>
  );
}

export function SectionHeader({ icon: Icon, eyebrow, title, action }) {
  return (
    <div className="hud-section-header flex flex-col gap-3 border-b border-cyan-300/12 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200 shadow-[0_0_22px_rgba(34,211,238,0.1)]">
            <Icon size={18} aria-hidden="true" />
          </span>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/75">{eyebrow}</p> : null}
          <h2 className="text-xl font-semibold leading-snug text-white">{title}</h2>
        </div>
      </div>
      {action ? <div className="w-full shrink-0 self-start sm:w-auto sm:self-center">{action}</div> : null}
    </div>
  );
}

export function SegmentedControl({ options = [], value, onChange, label = "Options", className = "" }) {
  const normalizedOptions = normalizeSelectOptions(options);

  function handleOptionClick(event, option, active) {
    event.preventDefault();
    if (active || option.disabled) return;
    onChange?.(option.value);
  }

  return (
    <div className={`max-w-full overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-950/40 p-1 ${className}`} role="group" aria-label={label}>
      <div className="flex w-max min-w-full gap-1">
        {normalizedOptions.map((option) => {
          const active = String(option.value) === String(value);

          return (
            <button
              key={`${option.value}-${option.label}`}
              type="button"
              onClick={(event) => handleOptionClick(event, option, active)}
              disabled={option.disabled}
              aria-pressed={active}
              className={`inline-flex min-h-9 flex-1 items-center justify-center whitespace-nowrap rounded-xl px-3 text-xs font-semibold capitalize transition ${
                active ? "hud-button-primary text-slate-950" : "text-slate-300 hover:bg-cyan-300/10 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ModuleCard({ to, icon: Icon, title, description, metric, status = "Ready", className = "" }) {
  return (
    <Link
      to={to}
      className={`hud-card module-card group flex min-h-[188px] flex-col justify-between rounded-2xl border border-slate-700/60 bg-slate-900/75 p-5 transition ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        {Icon ? (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/22 bg-cyan-300/10 text-cyan-200 transition group-hover:border-cyan-300/40 group-hover:text-cyan-100">
            <Icon size={19} aria-hidden="true" />
          </span>
        ) : null}
        <span className="hud-chip max-w-[58%] truncate rounded-full px-2.5 py-1 text-xs font-semibold text-cyan-50">{metric || status}</span>
      </div>
      <div className="mt-6 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold leading-tight text-white">{title}</h2>
          <ArrowUpRight className="shrink-0 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-100" size={17} aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
      </div>
    </Link>
  );
}

export function Tabs({ tabs, activeTab, onChange, label = "Section tabs" }) {
  const safeTabs = Array.isArray(tabs) ? tabs : [];

  function handleTabClick(event, tab, active) {
    event.preventDefault();
    if (active) return;
    onChange(tab.id);
  }

  return (
    <div className="hud-card max-w-full overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-950/40 p-1" role="tablist" aria-label={label}>
      <div className="flex w-max min-w-full gap-1">
        {safeTabs.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={(event) => handleTabClick(event, tab, active)}
              className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition ${
                active
                  ? "hud-button-primary text-slate-950 shadow-[0_10px_26px_rgba(34,211,238,0.16)]"
                  : "text-slate-300 hover:bg-cyan-300/10 hover:text-white"
              }`}
            >
              {Icon ? <Icon size={16} aria-hidden="true" /> : null}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Accordion({ title, eyebrow, children, defaultOpen = false, className = "" }) {
  return (
    <details className={`hud-card group rounded-2xl border border-cyan-300/15 bg-white/[0.04] ${className}`} open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left marker:hidden">
        <span>
          {eyebrow ? <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200/65">{eyebrow}</span> : null}
          <span className="block text-sm font-semibold text-white">{title}</span>
        </span>
        <ChevronDown className="shrink-0 text-slate-400 transition group-open:rotate-180" size={18} aria-hidden="true" />
      </summary>
      <div className="border-t border-cyan-300/10 px-4 py-4">{children}</div>
    </details>
  );
}

export function EmptyState({ title = "No data available", description = "This panel will update when data is available." }) {
  return (
    <div className="hud-card rounded-2xl border border-cyan-300/15 bg-white/[0.04] p-5 text-sm leading-6 text-slate-300">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-1 text-slate-400">{description}</p>
    </div>
  );
}

export function StatusBadge({ status }) {
  const normalized = String(status || "").trim().toLowerCase();
  const styles = {
    on: "border-emerald-300/35 bg-emerald-400/10 text-emerald-100",
    standby: "border-slate-300/20 bg-slate-300/10 text-slate-300",
    off: "border-rose-300/35 bg-rose-400/10 text-rose-100",
    warning: "border-amber-300/35 bg-amber-400/10 text-amber-100"
  };
  const tone = /\b(off|offline|stopped|disabled)\b/.test(normalized)
    ? "off"
    : /\b(standby|idle)\b/.test(normalized)
      ? "standby"
      : /\b(overconsuming|warning|critical|fault)\b/.test(normalized)
        ? "warning"
        : "on";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}>
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

  if (severity === "High" || severity === "Warning") {
    return <AlertTriangle className="text-amber-300" size={18} aria-hidden="true" />;
  }

  if (severity === "Normal") {
    return <CheckCircle2 className="text-emerald-300" size={18} aria-hidden="true" />;
  }

  if (severity === "Hardware") {
    return <Info className="text-blue-300" size={18} aria-hidden="true" />;
  }

  if (severity === "Info") {
    return <Info className="text-cyan-300" size={18} aria-hidden="true" />;
  }

  return <Info className="text-slate-300" size={18} aria-hidden="true" />;
}
