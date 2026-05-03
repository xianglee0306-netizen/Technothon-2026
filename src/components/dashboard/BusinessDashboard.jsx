import { ArrowDownRight, ArrowUpRight, BarChart3, Building2, Check, Clock, Coffee, DoorClosed, DoorOpen, Power, Snowflake, Store, Sun, TrendingDown, TrendingUp, Users, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { dayGreeting, SoftCard, SoftChip, SoftLink, SoftStat } from "./HomeShell.jsx";
import FloorPlan from "./FloorPlan.jsx";
import WasteCounter from "./WasteCounter.jsx";

// Best-effort parser for the operatingHours string in the data ("9:00 AM - 10:00 PM").
// Falls back to a reasonable default if the format is unexpected.
function parseHoursWindow(hours) {
  if (!hours || typeof hours !== "string") return { open: 9, close: 22, label: "9:00 AM – 10:00 PM" };
  const match = hours.match(/(\d{1,2})(?::\d{2})?\s*(AM|PM)?\s*[-–]\s*(\d{1,2})(?::\d{2})?\s*(AM|PM)?/i);
  if (!match) return { open: 9, close: 22, label: hours };
  let open = Number(match[1]);
  let close = Number(match[3]);
  if (/PM/i.test(match[2] || "") && open < 12) open += 12;
  if (/PM/i.test(match[4] || "") && close < 12) close += 12;
  if (/AM/i.test(match[4] || "") && close === 12) close = 0;
  return { open, close, label: hours };
}

function shiftPhase(now, openHour, closeHour) {
  const hour = now.getHours();
  const minute = now.getMinutes();
  const decimalNow = hour + minute / 60;
  if (decimalNow < openHour - 0.5) return "before-open";
  if (decimalNow < openHour + 0.5) return "opening";
  if (decimalNow > closeHour - 1) return "closing-soon";
  if (decimalNow > closeHour) return "after-close";
  return "open";
}

const phaseCopy = {
  "before-open": { label: "Pre-open", message: "Waiting for opening time. Equipment in standby.", tone: "cool" },
  opening: { label: "Opening", message: "Doors are about to open. Pre-cool and lights ramping up.", tone: "default" },
  open: { label: "Open", message: "Customers in. Watching comfort vs cost balance.", tone: "default" },
  "closing-soon": { label: "Closing soon", message: "Closing-time automation will fire shortly.", tone: "warm" },
  "after-close": { label: "After hours", message: "Closing schedule complete. Holding only critical loads.", tone: "sage" }
};

export default function BusinessDashboard({ dashboard, mode, activeAlerts }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const summary = dashboard?.summary || {};
  const monthlyBill = dashboard?.monthlyBillRm || 0;
  const monthlySavingsRm = dashboard?.potentialSavingsRm || summary.potentialSavingsCost || 0;
  const carbonReductionKg = dashboard?.carbonReductionKg || 0;
  const wastePercent = dashboard?.estimatedWastePercent || 0;
  const zones = dashboard?.zones || dashboard?.occupancyZones || [];
  const operatingWindow = useMemo(() => parseHoursWindow(dashboard?.operatingHours), [dashboard?.operatingHours]);
  const phase = shiftPhase(now, operatingWindow.open, operatingWindow.close);
  const phaseDef = phaseCopy[phase];
  const automationRules = dashboard?.automationRules || [];
  const closingRule = automationRules.find((rule) => /closing|after.?close|shutdown/i.test(rule.name || rule.condition || ""));
  const recommendations = (dashboard?.recommendations || []).slice(0, 3);
  const peakInterval = dashboard?.peakPlan?.intervals?.[0];
  const greeting = dayGreeting();

  // Same-industry benchmark: simulated comparison vs typical SME baseline.
  // The current Business profile uses 2,850 kWh/month at ~17% waste; an
  // efficient peer would be 12% waste, an inefficient peer 24%. We compute
  // delta vs a 2,400 kWh peer baseline.
  const benchmarkPeerKwh = 2400;
  const benchmarkDelta = (dashboard?.monthlyUsageKwh || 2850) - benchmarkPeerKwh;
  const benchmarkPercent = benchmarkPeerKwh > 0
    ? Math.round(((dashboard?.monthlyUsageKwh || 2850) / benchmarkPeerKwh - 1) * 100)
    : 0;

  return (
    <div className="tier-dash tier-dash--business">
      {/* HERO — current shift phase, prominent and time-aware */}
      <SoftCard variant={phaseDef.tone} className="tier-hero">
        <div className="tier-hero__row">
          <div className="tier-hero__left">
            <SoftChip tone="cool" icon={Store}>Commercial</SoftChip>
            <h1 className="tier-hero__title">
              {greeting}.
              <br />
              <span className="tier-hero__title-soft">{phaseDef.message}</span>
            </h1>
            <p className="tier-hero__sub">
              Operating hours · {operatingWindow.label} ·
              <span className={`shift-pill shift-pill--${phase}`}>{phaseDef.label}</span>
            </p>
          </div>

          <div className="tier-hero__right">
            <div className="bill-display">
              <p className="bill-display__label">Bill so far this month</p>
              <p className="bill-display__value">RM {Number(monthlyBill).toLocaleString()}</p>
              <p className="bill-display__delta bill-display__delta--ok">
                <Wallet size={14} aria-hidden="true" />
                Potential save · RM {Number(monthlySavingsRm).toLocaleString()}/mo
              </p>
            </div>
          </div>
        </div>
      </SoftCard>

      {/* SHIFT FLOW — the signature Business feature */}
      <SoftCard variant="default" className="shift-card">
        <div className="shift-card__head">
          <div>
            <p className="card-eyebrow">Open / Close day flow</p>
            <h2 className="card-title">Shift-aware automation, so closing time is staff-proof</h2>
          </div>
          <SoftChip tone={phase === "closing-soon" ? "warm" : "neutral"}>
            <Clock size={13} aria-hidden="true" />
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </SoftChip>
        </div>

        <div className="shift-flow">
          <ShiftStep
            icon={DoorOpen}
            title="Pre-open"
            detail="Pre-cool starts 30 min before opening, lighting ramps gradually."
            active={phase === "before-open" || phase === "opening"}
            done={phase !== "before-open" && phase !== "opening"}
          />
          <ShiftStep
            icon={Coffee}
            title="Open hours"
            detail="Customer-area comfort matched to live occupancy. Refrigeration alerted only."
            active={phase === "open"}
            done={phase === "closing-soon" || phase === "after-close"}
          />
          <ShiftStep
            icon={DoorClosed}
            title="Closing time"
            detail={closingRule ? closingRule.condition : "10:15 PM lighting + signage shutdown, AC setback"}
            active={phase === "closing-soon"}
            done={phase === "after-close"}
            highlight
          />
          <ShiftStep
            icon={Snowflake}
            title="After hours"
            detail="Refrigeration and security only. Everything else off."
            active={phase === "after-close"}
            done={false}
          />
        </div>

        <div className="shift-card__rule">
          <div className="shift-card__rule-icon">
            <Power size={14} aria-hidden="true" />
          </div>
          <div className="shift-card__rule-body">
            <p className="shift-card__rule-title">{closingRule?.name || "Closing-time lighting shutdown"}</p>
            <p className="shift-card__rule-detail">
              {closingRule
                ? `${closingRule.condition} → ${closingRule.action}`
                : "IF time = 22:15 AND occupancy < 10% → THEN shut down customer-area lighting and dim signage"}
            </p>
          </div>
          <span className="shift-card__rule-state">
            {closingRule?.enabled === false ? "Off" : "Active"}
          </span>
        </div>
      </SoftCard>

      {/* QUICK STATS */}
      <section className="tier-stats tier-stats--four">
        <SoftStat
          icon={Wallet}
          label="Save next month"
          value={`RM ${Number(monthlySavingsRm).toLocaleString()}`}
          hint="If closing automation runs every night"
          tone="sage"
        />
        <SoftStat
          icon={Sun}
          label="Waste this month"
          value={`${wastePercent}%`}
          hint="Mostly after-hours and idle"
          tone="warm"
        />
        <SoftStat
          icon={Users}
          label="Active alerts"
          value={activeAlerts}
          hint={activeAlerts > 0 ? "Worth a quick check" : "All quiet"}
          tone={activeAlerts > 0 ? "warm" : "sage"}
        />
        <SoftStat
          icon={BarChart3}
          label="Peak window"
          value={peakInterval?.window || "2:00 – 4:00 PM"}
          hint={peakInterval ? peakInterval.cause : "AC + kitchen overlap"}
          tone="default"
        />
      </section>

      {/* ZONE FLOOR PLAN */}
      <FloorPlan mode={mode} zones={zones} />

      {/* BENCHMARK + LIVE WASTE — second row */}
      <section className="tier-split">
        <SoftCard variant="default">
          <p className="card-eyebrow">Versus similar businesses</p>
          <h2 className="card-title">How you compare to other commercial businesses</h2>
          <div className="benchmark-row">
            <div className="benchmark-col">
              <p className="benchmark-label">Your monthly use</p>
              <p className="benchmark-value">{(dashboard?.monthlyUsageKwh || 0).toLocaleString()} kWh</p>
            </div>
            <div className="benchmark-vs" aria-hidden="true">vs</div>
            <div className="benchmark-col">
              <p className="benchmark-label">Efficient peer</p>
              <p className="benchmark-value benchmark-value--peer">{benchmarkPeerKwh.toLocaleString()} kWh</p>
            </div>
          </div>
          <div className={`benchmark-bar benchmark-bar--${benchmarkDelta > 0 ? "over" : "under"}`}>
            <div className="benchmark-bar__fill" style={{ width: `${Math.min(100, Math.abs(benchmarkPercent) * 2 + 30)}%` }} />
          </div>
          <p className="benchmark-summary">
            {benchmarkDelta > 0 ? (
              <>
                <TrendingUp size={14} aria-hidden="true" />
                <span>{Math.abs(benchmarkPercent)}% above efficient peer · room to improve</span>
              </>
            ) : (
              <>
                <TrendingDown size={14} aria-hidden="true" />
                <span>{Math.abs(benchmarkPercent)}% below peer · doing well</span>
              </>
            )}
          </p>
        </SoftCard>

        <WasteCounter
          mode={mode}
          potentialSavingsRm={monthlySavingsRm}
          carbonReductionKg={carbonReductionKg}
        />
      </section>

      {/* TOP NUDGES */}
      <SoftCard variant="default">
        <p className="card-eyebrow">Top moves</p>
        <h2 className="card-title">Three changes that pay back fastest</h2>
        <div className="nudges-grid">
          {recommendations.map((rec) => (
            <SoftCard variant="plain" key={rec.id} className="nudge-card">
              <p className="nudge-card__title">{rec.title}</p>
              <p className="nudge-card__impact">RM {Number(rec.estimatedSavingsCost || 0).toFixed(0)}/mo · {rec.difficulty || "Easy"}</p>
              <p className="nudge-card__detail">{rec.message}</p>
            </SoftCard>
          ))}
        </div>
        <SoftLink to="/actions">Open all recommendations</SoftLink>
      </SoftCard>
    </div>
  );
}

function ShiftStep({ icon: Icon, title, detail, active, done, highlight }) {
  const className = [
    "shift-step",
    active ? "shift-step--active" : "",
    done ? "shift-step--done" : "",
    highlight ? "shift-step--highlight" : ""
  ].filter(Boolean).join(" ");
  return (
    <div className={className}>
      <span className="shift-step__icon">
        {done ? <Check size={16} aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}
      </span>
      <div className="shift-step__body">
        <p className="shift-step__title">{title}</p>
        <p className="shift-step__detail">{detail}</p>
      </div>
    </div>
  );
}
