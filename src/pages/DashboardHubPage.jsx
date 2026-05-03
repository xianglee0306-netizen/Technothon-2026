import { ArrowRight, ArrowUpRight, Bot, Cpu, FileText, Gauge, LayoutGrid, Leaf, LogOut, MapPin, RotateCcw, Settings, ShieldCheck, SlidersHorizontal, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDashboardData } from "../app/DashboardContext.jsx";

// Tier-aware live waste rate (RM / hour).
// Same numbers as the WasteCounter component — keeps the hero hero feeling
// consistent if both are visible at once.
const wasteRatePerHour = {
  residential: 1.6,
  business: 7.2,
  enterprise: 95.0
};

// Friendly tier labels (matches the rename to Commercial / Industry)
const tierLabels = {
  residential: "Residential",
  business: "Commercial",
  enterprise: "Industry"
};

// Tiles in display order. The first tile is large (the hero of the mosaic),
// the rest are standard size. Each gets its own animated visual identity.
const tiles = [
  {
    id: "floor-plan",
    to: "/dashboard/details",
    eyebrow: "Live operations",
    title: "Energy Command",
    detail: "Floor plan, zones, alerts. The full operations view for your tier.",
    icon: LayoutGrid,
    art: "floorplan",
    big: true
  },
  {
    id: "ai-twin",
    to: "/ai-twin",
    eyebrow: "Industry exclusive",
    title: "AI Twin",
    detail: "Simulate scheduling and zone changes before committing to action.",
    icon: Cpu,
    art: "twin",
    enterpriseOnly: true
  },
  {
    id: "save",
    to: "/actions",
    eyebrow: "Recommendations",
    title: "Save Energy",
    detail: "Tier-specific actions ranked by ringgit, kWh, and CO₂ impact.",
    icon: Sparkles,
    art: "save"
  },
  {
    id: "automation",
    to: "/automation",
    eyebrow: "Rules engine",
    title: "Automation",
    detail: "Closing-time shutdowns, after-hours enforcement, approval gates.",
    icon: ShieldCheck,
    art: "automation"
  },
  {
    id: "roi",
    to: "/roi",
    eyebrow: "Business case",
    title: "ROI",
    detail: "Payback math grounded in your hardware and tariff assumptions.",
    icon: Gauge,
    art: "roi"
  },
  {
    id: "reports",
    to: "/reports",
    eyebrow: "Operational summary",
    title: "Reports",
    detail: "Shift handover, monthly carbon, anomalies, and audit trail.",
    icon: FileText,
    art: "reports"
  }
];

function formatRm(value) {
  return value.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Computes the next 1st-of-month at 09:00 MYT — a stand-in for a real bill date.
// (In a real product this would come from user-set billing cycle data.)
function nextBillDate(now = new Date()) {
  const next = new Date(now);
  next.setDate(1);
  next.setHours(9, 0, 0, 0);
  // If today is past the 1st of this month, jump to next month
  if (next <= now) next.setMonth(next.getMonth() + 1);
  return next;
}

function diffParts(target, now) {
  let ms = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  ms -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  ms -= hours * (1000 * 60 * 60);
  const minutes = Math.floor(ms / (1000 * 60));
  ms -= minutes * (1000 * 60);
  const seconds = Math.floor(ms / 1000);
  return { days, hours, minutes, seconds };
}

export default function DashboardHubPage() {
  const navigate = useNavigate();
  const { actions, dashboard, mode } = useDashboardData();
  const tierLabel = tierLabels[mode] || tierLabels.residential;
  const monthlyBillRm = dashboard?.monthlyBillRm || 0;
  const potentialSavingsRm = dashboard?.potentialSavingsRm || 0;

  // Live waste counter — restarts when the tier changes so judges see the
  // rate visibly differ between Residential / Commercial / Industry demos.
  const [wastedRm, setWastedRm] = useState(0);
  const startedAtRef = useRef(performance.now());
  const previousModeRef = useRef(mode);

  useEffect(() => {
    if (previousModeRef.current !== mode) {
      previousModeRef.current = mode;
      startedAtRef.current = performance.now();
      setWastedRm(0);
    }
  }, [mode]);

  useEffect(() => {
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ratePerHour = wasteRatePerHour[mode] || wasteRatePerHour.residential;
    let frame = 0;
    function tick() {
      const elapsedHours = (performance.now() - startedAtRef.current) / 3_600_000;
      setWastedRm(elapsedHours * ratePerHour);
      frame = window.requestAnimationFrame(tick);
    }
    if (reduced) {
      const interval = window.setInterval(tick, 1000);
      return () => window.clearInterval(interval);
    }
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [mode]);

  // Bill countdown — re-evaluated every second
  const billDate = useMemo(() => nextBillDate(), []);
  const [parts, setParts] = useState(() => diffParts(billDate, new Date()));
  useEffect(() => {
    const id = setInterval(() => setParts(diffParts(billDate, new Date())), 1000);
    return () => clearInterval(id);
  }, [billDate]);

  function resetDemo() {
    // "Logout" equivalent: reset profile to residential and bounce to landing.
    actions.setMode("residential");
    navigate("/");
  }

  return (
    <div className="hub-page">
      {/* HERO COMMAND PANEL */}
      <section className="hub-hero">
        <div className="hub-hero__bg" aria-hidden="true">
          <HubGridBackdrop />
        </div>

        {/* Top-right corner controls */}
        <div className="hub-hero__corner">
          <span className="hub-corner-tier" aria-label={`Active tier: ${tierLabel}`}>
            <span className="hub-corner-tier__dot" aria-hidden="true" />
            {tierLabel}
          </span>
          <button type="button" onClick={resetDemo} className="hub-corner-btn" aria-label="Reset demo and return to landing">
            <RotateCcw size={14} aria-hidden="true" />
            <span>Reset demo</span>
          </button>
        </div>

        <div className="hub-hero__inner">
          <div className="hub-hero__left">
            <p className="hub-eyebrow">
              <span className="hub-eyebrow__dot" aria-hidden="true" />
              GridSenseIQ · Command Hub
            </p>
            <h1 className="hub-hero__title">
              Wasting <span className="hub-hero__money">RM {formatRm(wastedRm)}</span>
              <br />
              <span className="hub-hero__title-soft">in {tierLabel.toLowerCase()} loads right now.</span>
            </h1>

            <ul className="hub-bullets">
              <li><span className="hub-bullets__chev" aria-hidden="true">›</span> Hardware captures the evidence — kWh by zone, by device, by minute.</li>
              <li><span className="hub-bullets__chev" aria-hidden="true">›</span> Software finds the waste — bill projections, alerts, room-level patterns.</li>
              <li><span className="hub-bullets__chev" aria-hidden="true">›</span> AI recommends the action — ranked by RM, kWh, and CO₂ impact.</li>
            </ul>

            <div className="hub-hero__ctas">
              <Link to="/dashboard/details" className="hub-cta hub-cta--primary">
                <span>Open command view</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/actions" className="hub-cta hub-cta--ghost">
                <span>See recommendations</span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="hub-hero__right">
            <CountdownTile parts={parts} billDate={billDate} potentialSavingsRm={potentialSavingsRm} monthlyBillRm={monthlyBillRm} />
          </div>
        </div>
      </section>

      {/* TILE MOSAIC */}
      <section className="hub-mosaic">
        {tiles.map((tile) => (
          <HubTile key={tile.id} tile={tile} mode={mode} />
        ))}
      </section>

      {/* FOOTER STRIP */}
      <footer className="hub-foot">
        <div className="hub-foot__brand">GridSenseIQ · Hardware-software energy intelligence</div>
        <div className="hub-foot__links">
          <Link to="/setup">Setup</Link>
          <Link to="/settings">Settings</Link>
          <Link to="/reports">Reports</Link>
          <button type="button" onClick={resetDemo} className="hub-foot__btn">
            <LogOut size={12} aria-hidden="true" />
            Reset demo
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================
   HUB GRID BACKDROP — full-bleed animated SVG that suggests "video"
   without needing a video file. A fine grid pulses with cyan
   particles drifting through it, like a city electrical map.
   ============================================================ */

function HubGridBackdrop() {
  return (
    <svg className="hub-bg-svg" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="hub-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(56, 189, 248, 0.16)" strokeWidth="0.6" />
        </pattern>

        <radialGradient id="hub-spot-1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(56, 189, 248, 0.35)" />
          <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
        </radialGradient>

        <radialGradient id="hub-spot-2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(167, 139, 250, 0.32)" />
          <stop offset="100%" stopColor="rgba(167, 139, 250, 0)" />
        </radialGradient>

        <radialGradient id="hub-spot-3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(52, 211, 153, 0.28)" />
          <stop offset="100%" stopColor="rgba(52, 211, 153, 0)" />
        </radialGradient>
      </defs>

      <rect width="1600" height="700" fill="url(#hub-grid)" />

      {/* Floating warm spotlights — drift across the grid */}
      <circle cx="220" cy="180" r="240" fill="url(#hub-spot-1)" className="hub-bg-spot hub-bg-spot--1" />
      <circle cx="1280" cy="540" r="280" fill="url(#hub-spot-2)" className="hub-bg-spot hub-bg-spot--2" />
      <circle cx="780" cy="380" r="200" fill="url(#hub-spot-3)" className="hub-bg-spot hub-bg-spot--3" />

      {/* Sweeping scan line */}
      <line x1="0" y1="-10" x2="1600" y2="10" stroke="rgba(186, 230, 253, 0.18)" strokeWidth="1.2" className="hub-bg-scan" />
    </svg>
  );
}

/* ============================================================
   COUNTDOWN TILE
   ============================================================ */

function CountdownTile({ parts, billDate, potentialSavingsRm, monthlyBillRm }) {
  const dateLabel = billDate.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
  return (
    <div className="hub-countdown">
      <p className="hub-countdown__eyebrow">Until your next bill</p>
      <p className="hub-countdown__date">{dateLabel}</p>

      <div className="hub-countdown__grid">
        <CountdownCell value={parts.days} label="days" />
        <CountdownCell value={parts.hours} label="hours" />
        <CountdownCell value={parts.minutes} label="min" />
        <CountdownCell value={parts.seconds} label="sec" />
      </div>

      <div className="hub-countdown__split">
        <div>
          <p className="hub-countdown__split-label">Projected</p>
          <p className="hub-countdown__split-value">RM {Number(monthlyBillRm).toLocaleString("en-MY")}</p>
        </div>
        <div>
          <p className="hub-countdown__split-label">Could avoid</p>
          <p className="hub-countdown__split-value hub-countdown__split-value--good">RM {Number(potentialSavingsRm).toLocaleString("en-MY")}</p>
        </div>
      </div>
    </div>
  );
}

function CountdownCell({ value, label }) {
  const padded = String(value).padStart(2, "0");
  return (
    <div className="hub-countdown-cell">
      <span className="hub-countdown-cell__value">{padded}</span>
      <span className="hub-countdown-cell__label">{label}</span>
    </div>
  );
}

/* ============================================================
   HUB TILE — one card in the mosaic
   ============================================================ */

function HubTile({ tile, mode }) {
  const Icon = tile.icon;
  const enterpriseLocked = tile.enterpriseOnly && mode !== "enterprise";

  // The Link wraps everything so the whole tile is clickable.
  // For enterprise-only tiles when on a non-enterprise tier we still link to
  // /ai-twin so the user lands on the locked preview screen (consistent UX).
  return (
    <Link to={tile.to} className={`hub-tile ${tile.big ? "hub-tile--big" : ""} ${enterpriseLocked ? "hub-tile--locked" : ""}`}>
      <span className="hub-tile__art" aria-hidden="true">
        <TileArt kind={tile.art} />
      </span>

      <span className="hub-tile__lift" aria-hidden="true" />

      <div className="hub-tile__top">
        <span className="hub-tile__icon">
          <Icon size={tile.big ? 22 : 18} aria-hidden="true" />
        </span>
        <span className="hub-tile__eyebrow">{tile.eyebrow}</span>
      </div>

      <div className="hub-tile__bottom">
        <h2 className="hub-tile__title">{tile.title}</h2>
        <p className="hub-tile__detail">{tile.detail}</p>
        <span className="hub-tile__cta">
          {enterpriseLocked ? "Preview locked" : "Open"}
          <ArrowUpRight size={14} aria-hidden="true" />
        </span>
      </div>

      {enterpriseLocked ? (
        <span className="hub-tile__lock-badge">Industry only</span>
      ) : null}
    </Link>
  );
}

/* ============================================================
   TILE ART — one mini animation per tile, lightweight SVG
   ============================================================ */

function TileArt({ kind }) {
  if (kind === "floorplan") {
    return (
      <svg viewBox="0 0 200 140" className="tile-art tile-art--floorplan" preserveAspectRatio="xMidYMid slice">
        <rect x="6" y="6" width="80" height="60" rx="3" className="tile-art__room tile-art__room--1" />
        <rect x="92" y="6" width="56" height="40" rx="3" className="tile-art__room tile-art__room--2" />
        <rect x="154" y="6" width="40" height="60" rx="3" className="tile-art__room tile-art__room--3" />
        <rect x="6" y="72" width="60" height="60" rx="3" className="tile-art__room tile-art__room--4" />
        <rect x="72" y="52" width="80" height="80" rx="3" className="tile-art__room tile-art__room--5" />
        <rect x="158" y="72" width="36" height="60" rx="3" className="tile-art__room tile-art__room--6" />
      </svg>
    );
  }
  if (kind === "twin") {
    // Network of nodes connected by lines — pulses
    return (
      <svg viewBox="0 0 200 140" className="tile-art tile-art--twin" preserveAspectRatio="xMidYMid slice">
        <line x1="40" y1="40" x2="100" y2="70" className="tile-art__edge" />
        <line x1="100" y1="70" x2="160" y2="40" className="tile-art__edge" />
        <line x1="100" y1="70" x2="60" y2="110" className="tile-art__edge" />
        <line x1="100" y1="70" x2="160" y2="110" className="tile-art__edge" />
        <circle cx="40" cy="40" r="4" className="tile-art__node" />
        <circle cx="160" cy="40" r="4" className="tile-art__node" />
        <circle cx="100" cy="70" r="6" className="tile-art__node tile-art__node--center" />
        <circle cx="60" cy="110" r="4" className="tile-art__node" />
        <circle cx="160" cy="110" r="4" className="tile-art__node" />
      </svg>
    );
  }
  if (kind === "save") {
    // Stack of upward bars + sparkle
    return (
      <svg viewBox="0 0 200 140" className="tile-art tile-art--save" preserveAspectRatio="xMidYMid slice">
        <rect x="30" y="92" width="22" height="36" rx="2" className="tile-art__bar tile-art__bar--1" />
        <rect x="62" y="76" width="22" height="52" rx="2" className="tile-art__bar tile-art__bar--2" />
        <rect x="94" y="56" width="22" height="72" rx="2" className="tile-art__bar tile-art__bar--3" />
        <rect x="126" y="36" width="22" height="92" rx="2" className="tile-art__bar tile-art__bar--4" />
        <path d="M 30 80 L 62 60 L 94 42 L 126 22" className="tile-art__path" fill="none" />
      </svg>
    );
  }
  if (kind === "automation") {
    // Looping wire path
    return (
      <svg viewBox="0 0 200 140" className="tile-art tile-art--automation" preserveAspectRatio="xMidYMid slice">
        <path
          d="M 10 70 Q 50 20 100 70 Q 150 120 190 70"
          className="tile-art__wire"
          fill="none"
        />
        <circle r="4" className="tile-art__pulse">
          <animateMotion dur="3.4s" repeatCount="indefinite" path="M 10 70 Q 50 20 100 70 Q 150 120 190 70" />
        </circle>
      </svg>
    );
  }
  if (kind === "roi") {
    // Ascending arc + percentage tick marks
    return (
      <svg viewBox="0 0 200 140" className="tile-art tile-art--roi" preserveAspectRatio="xMidYMid slice">
        <path d="M 12 120 Q 60 60 110 90 T 188 24" className="tile-art__curve" fill="none" />
        <circle cx="12" cy="120" r="3" className="tile-art__tick" />
        <circle cx="60" cy="76" r="3" className="tile-art__tick" />
        <circle cx="110" cy="90" r="3" className="tile-art__tick" />
        <circle cx="160" cy="44" r="3" className="tile-art__tick" />
        <circle cx="188" cy="24" r="4" className="tile-art__tick tile-art__tick--end" />
      </svg>
    );
  }
  if (kind === "reports") {
    // Stacked sheets
    return (
      <svg viewBox="0 0 200 140" className="tile-art tile-art--reports" preserveAspectRatio="xMidYMid slice">
        <rect x="30" y="40" width="100" height="70" rx="4" className="tile-art__sheet tile-art__sheet--1" />
        <rect x="50" y="30" width="100" height="70" rx="4" className="tile-art__sheet tile-art__sheet--2" />
        <rect x="70" y="20" width="100" height="70" rx="4" className="tile-art__sheet tile-art__sheet--3" />
        <line x1="80" y1="38" x2="160" y2="38" className="tile-art__line" />
        <line x1="80" y1="50" x2="150" y2="50" className="tile-art__line" />
        <line x1="80" y1="62" x2="155" y2="62" className="tile-art__line" />
        <line x1="80" y1="74" x2="140" y2="74" className="tile-art__line" />
      </svg>
    );
  }
  return null;
}
