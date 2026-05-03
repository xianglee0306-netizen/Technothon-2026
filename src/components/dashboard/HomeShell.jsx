import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Soft card — the new visual primitive. Replaces the dense HUD cards on the
 * dashboard pages with a calmer, Apple-Home / Nest-style block. Bigger radius,
 * softer borders, no neon glow, generous padding. Variants tint the background
 * gently for tonal grouping.
 */
export function SoftCard({ children, className = "", variant = "default", as: Tag = "div", ...rest }) {
  const variants = {
    default: "soft-card soft-card--default",
    accent: "soft-card soft-card--accent",
    warm: "soft-card soft-card--warm",
    cool: "soft-card soft-card--cool",
    sage: "soft-card soft-card--sage",
    plain: "soft-card soft-card--plain"
  };
  const base = variants[variant] || variants.default;
  return (
    <Tag className={`${base} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Stat block — single number with a quiet label. Minimal, no charts, no glow.
 * Used in row-of-stats configurations on each tier dashboard.
 */
export function SoftStat({ label, value, hint, tone = "default", icon: Icon, className = "" }) {
  const toneClass = `soft-stat soft-stat--${tone}`;
  return (
    <div className={`${toneClass} ${className}`}>
      <div className="soft-stat__head">
        {Icon ? (
          <span className="soft-stat__icon">
            <Icon size={16} aria-hidden="true" />
          </span>
        ) : null}
        <p className="soft-stat__label">{label}</p>
      </div>
      <p className="soft-stat__value">{value}</p>
      {hint ? <p className="soft-stat__hint">{hint}</p> : null}
    </div>
  );
}

/**
 * Soft chip — used for a "tier" badge in the hero.
 */
export function SoftChip({ children, tone = "neutral", icon: Icon }) {
  return (
    <span className={`soft-chip soft-chip--${tone}`}>
      {Icon ? <Icon size={13} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/**
 * Inline link styled as an action — used for "see details" links inside cards.
 * Keeps the soft aesthetic while remaining unmistakably tappable.
 */
export function SoftLink({ to, children, onClick, type = "button" }) {
  if (to) {
    return (
      <Link to={to} className="soft-link">
        <span>{children}</span>
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className="soft-link">
      <span>{children}</span>
      <ArrowRight size={14} aria-hidden="true" />
    </button>
  );
}

/**
 * Gives each tier dashboard a friendly greeting line based on time of day.
 * Pure date math; safe SSR fallback.
 */
export function dayGreeting() {
  if (typeof Date === "undefined") return "Hello";
  const hour = new Date().getHours();
  if (hour < 5) return "Good evening";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
