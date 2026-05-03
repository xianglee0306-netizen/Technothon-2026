import { ArrowDownRight, ArrowUpRight, BedDouble, ChefHat, Home, Lamp, Moon, ShieldCheck, Sparkles, Sun, ThermometerSun, Wallet, Zap } from "lucide-react";
import { useMemo } from "react";
import { dayGreeting, SoftCard, SoftChip, SoftLink, SoftStat } from "./HomeShell.jsx";
import FloorPlan from "./FloorPlan.jsx";
import WasteCounter from "./WasteCounter.jsx";

const roomIcon = {
  "Living Area": Home,
  "Living Room": Home,
  "Hallway": Home,
  "Kitchen": ChefHat,
  "Home Office": Lamp,
  "Bedrooms": BedDouble,
  "Bedroom": BedDouble,
  "Bathroom": ThermometerSun,
  "Utility": Zap
};

function roomTone(zone) {
  const risk = String(zone?.risk || "").toLowerCase();
  if (risk === "critical") return "warm";
  if (risk === "high") return "warm";
  if (risk === "medium") return "default";
  return "sage";
}

function roomLine(zone) {
  if (!zone) return "Looking good";
  const risk = String(zone.risk || "").toLowerCase();
  const occupancy = Math.round(zone.occupancyPercent || 0);
  if (risk === "critical") return `Using more than usual right now`;
  if (risk === "high") return `Above normal · check in soon`;
  if (occupancy < 10 && (zone.wastedKwh || 0) > 0.5) return `Empty but still using power`;
  return `Calm · ${occupancy}% occupancy`;
}

export default function ResidentialDashboard({ dashboard, mode, activeAlerts }) {
  const summary = dashboard?.summary || {};
  const monthlyBill = dashboard?.monthlyBillRm || 0;
  const projectedBill = summary.projectedMonthlyCost || monthlyBill;
  const monthlySavingsRm = dashboard?.potentialSavingsRm || summary.potentialSavingsCost || 0;
  const carbonReductionKg = dashboard?.carbonReductionKg || 0;
  const wastePercent = dashboard?.estimatedWastePercent || 0;
  const zones = dashboard?.zones || dashboard?.occupancyZones || [];
  const recommendations = (dashboard?.recommendations || []).slice(0, 3);
  const topAlert = (dashboard?.notifications || []).find((alert) => alert.severity === "Critical")
    || (dashboard?.notifications || [])[0];
  const overUnderTarget = projectedBill > monthlyBill ? projectedBill - monthlyBill : 0;
  const greeting = dayGreeting();

  // Roll up the most common waste pattern in plain English — surfaces in the hero
  // so the homeowner doesn't have to interpret a chart.
  const heroInsight = useMemo(() => {
    if (overUnderTarget > 0) {
      return `On pace to spend RM ${overUnderTarget.toFixed(0)} above your usual bill this month.`;
    }
    return "Your home is using a little less than usual. Nice work.";
  }, [overUnderTarget]);

  return (
    <div className="tier-dash tier-dash--residential">
      {/* HERO — calm greeting, plain-English status */}
      <SoftCard variant="cool" className="tier-hero">
        <div className="tier-hero__row">
          <div className="tier-hero__left">
            <SoftChip tone="cool" icon={Home}>Home · Residential</SoftChip>
            <h1 className="tier-hero__title">
              {greeting}.
              <br />
              <span className="tier-hero__title-soft">{heroInsight}</span>
            </h1>
            <p className="tier-hero__sub">
              GridSenseIQ keeps an eye on your home so you don't have to think about it.
            </p>
          </div>

          <div className="tier-hero__right">
            <div className="bill-display">
              <p className="bill-display__label">This month so far</p>
              <p className="bill-display__value">RM {Number(monthlyBill).toLocaleString()}</p>
              <p className={`bill-display__delta ${overUnderTarget > 0 ? "bill-display__delta--over" : "bill-display__delta--ok"}`}>
                {overUnderTarget > 0 ? (
                  <>
                    <ArrowUpRight size={14} aria-hidden="true" />
                    RM {overUnderTarget.toFixed(0)} over usual
                  </>
                ) : (
                  <>
                    <ArrowDownRight size={14} aria-hidden="true" />
                    On track or below usual
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </SoftCard>

      {/* QUICK STATS — three soft tiles, no neon */}
      <section className="tier-stats">
        <SoftStat
          icon={Wallet}
          label="Could save this month"
          value={`RM ${Number(monthlySavingsRm).toLocaleString()}`}
          hint="With small nudges only"
          tone="sage"
        />
        <SoftStat
          icon={Sparkles}
          label="Energy waste"
          value={`${wastePercent}%`}
          hint="Avoidable across rooms"
          tone="warm"
        />
        <SoftStat
          icon={ShieldCheck}
          label="Active alerts"
          value={activeAlerts}
          hint={activeAlerts > 0 ? "One or two need a peek" : "All quiet"}
          tone={activeAlerts > 0 ? "warm" : "sage"}
        />
      </section>

      {/* ROOMS — the headline residential feature, plain-English status per room */}
      <SoftCard variant="default" className="rooms-card">
        <div className="rooms-card__head">
          <div>
            <p className="card-eyebrow">Your rooms</p>
            <h2 className="card-title">A quick walk through the house</h2>
          </div>
          <SoftChip tone="neutral">{zones.length} rooms monitored</SoftChip>
        </div>
        <div className="rooms-grid">
          {zones.map((zone) => {
            const Icon = roomIcon[zone.name] || Home;
            return (
              <SoftCard variant={roomTone(zone)} key={zone.id} className="room-tile">
                <div className="room-tile__head">
                  <span className="room-tile__icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <p className="room-tile__name">{zone.name}</p>
                </div>
                <p className="room-tile__line">{roomLine(zone)}</p>
                {(zone.wastedKwh || 0) > 0.3 ? (
                  <p className="room-tile__waste">{(zone.wastedKwh || 0).toFixed(1)} kWh avoidable</p>
                ) : null}
              </SoftCard>
            );
          })}
        </div>
      </SoftCard>

      {/* FLOOR PLAN — kept, but softer thanks to updated FloorPlan styles */}
      <FloorPlan mode={mode} zones={zones} />

      {/* SIDE-BY-SIDE: live waste + recommended nudges */}
      <section className="tier-split">
        <WasteCounter
          mode={mode}
          potentialSavingsRm={monthlySavingsRm}
          carbonReductionKg={carbonReductionKg}
        />

        <SoftCard variant="default">
          <p className="card-eyebrow">Friendly nudges</p>
          <h2 className="card-title">Three small things that help</h2>
          <ul className="nudge-list">
            {recommendations.map((rec) => (
              <li key={rec.id} className="nudge-item">
                <span className="nudge-bullet" aria-hidden="true" />
                <div className="nudge-body">
                  <p className="nudge-title">{rec.title}</p>
                  <p className="nudge-detail">
                    Saves about RM {Number(rec.estimatedSavingsCost || 0).toFixed(0)}/month · {rec.difficulty || "Easy"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <SoftLink to="/actions">See all suggestions</SoftLink>
        </SoftCard>
      </section>

      {/* ALERT — quiet, single most-important alert */}
      {topAlert ? (
        <SoftCard variant="warm" className="hero-alert">
          <div className="hero-alert__row">
            <div className="hero-alert__icon">
              <Sun size={18} aria-hidden="true" />
            </div>
            <div className="hero-alert__body">
              <p className="hero-alert__title">{topAlert.title}</p>
              <p className="hero-alert__msg">{topAlert.message}</p>
              {topAlert.suggestedAction ? (
                <p className="hero-alert__hint">Suggestion · {topAlert.suggestedAction}</p>
              ) : null}
            </div>
            <SoftLink to="/actions">Open</SoftLink>
          </div>
        </SoftCard>
      ) : (
        <SoftCard variant="sage" className="hero-alert">
          <div className="hero-alert__row">
            <div className="hero-alert__icon">
              <Moon size={18} aria-hidden="true" />
            </div>
            <div className="hero-alert__body">
              <p className="hero-alert__title">All quiet at home</p>
              <p className="hero-alert__msg">No urgent signals. Check back later or browse savings ideas.</p>
            </div>
          </div>
        </SoftCard>
      )}
    </div>
  );
}
