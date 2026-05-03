import { Activity, AlertOctagon, BarChart3, Brain, Building2, CircuitBoard, ClipboardList, Cpu, Factory, Gauge, Layers, Lock, Power, Radio, ShieldCheck, Wifi, Wrench, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { dayGreeting, SoftCard, SoftChip, SoftLink, SoftStat } from "./HomeShell.jsx";
import FloorPlan from "./FloorPlan.jsx";

// Pretend ops clock — drives the schedule view bar.
function shiftLabel(now) {
  const hour = now.getHours();
  if (hour >= 7 && hour < 15) return "Day shift";
  if (hour >= 15 && hour < 23) return "Evening shift";
  return "Night shift";
}

function ScheduleBar({ now }) {
  // 24 cells, one per hour. Production zones run 8–19, night cleanup 19–22, only critical loads otherwise.
  const cells = Array.from({ length: 24 }, (_, hour) => {
    let kind = "idle";
    if (hour >= 8 && hour < 19) kind = "production";
    else if (hour >= 19 && hour < 22) kind = "wind-down";
    else kind = "critical-only";
    if (now.getHours() === hour) kind = `${kind} current`;
    return { hour, kind };
  });
  return (
    <div className="ops-schedule">
      {cells.map((cell) => (
        <div
          key={cell.hour}
          className={`ops-schedule__cell ops-schedule__cell--${cell.kind.split(" ")[0]}${cell.kind.includes("current") ? " ops-schedule__cell--now" : ""}`}
          title={`${String(cell.hour).padStart(2, "0")}:00 — ${cell.kind.split(" ")[0].replace("-", " ")}`}
        >
          <span className="ops-schedule__cell-hour">{String(cell.hour).padStart(2, "0")}</span>
        </div>
      ))}
    </div>
  );
}

export default function EnterpriseDashboard({ dashboard, mode, activeAlerts }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const summary = dashboard?.summary || {};
  const monthlyBill = dashboard?.monthlyBillRm || 0;
  const monthlySavingsRm = dashboard?.potentialSavingsRm || summary.potentialSavingsCost || 0;
  const wastePercent = dashboard?.estimatedWastePercent || 0;
  const monthlyUsageKwh = dashboard?.monthlyUsageKwh || 0;
  const zones = dashboard?.zones || dashboard?.occupancyZones || [];
  const hardware = dashboard?.hardwareStatus || [];
  const anomalies = dashboard?.anomalies || [];
  const automationRules = dashboard?.automationRules || [];
  const approvalQueue = dashboard?.approvalQueue || [];
  const twinScenarios = dashboard?.twinScenarios || [];
  const recommendedScenario = twinScenarios.find((s) => s.id === "full-ai-optimization") || twinScenarios[1] || twinScenarios[0];
  const greeting = dayGreeting();
  const energyScore = dashboard?.energyScore?.overall || summary.efficiencyScore || 0;
  const operatingHours = dashboard?.operatingHours || "8:00 AM – 7:00 PM";

  // Hardware online ratio for the ops health pill.
  const hardwareOnline = hardware.filter((item) => /online|connected/i.test(item.status || "")).length;
  const hardwareReady = hardware.filter((item) => /ready|waiting/i.test(item.status || "")).length;

  // Worst critical zone for the alert tile.
  const criticalZone = useMemo(() => {
    return zones.slice().sort((a, b) => Number(b.wastedKwh || 0) - Number(a.wastedKwh || 0))[0];
  }, [zones]);

  return (
    <div className="tier-dash tier-dash--enterprise">
      {/* OPS HERO — denser than residential/business, but soft */}
      <SoftCard variant="default" className="tier-hero ops-hero">
        <div className="tier-hero__row">
          <div className="tier-hero__left">
            <SoftChip tone="cool" icon={Factory}>Facility · Industry</SoftChip>
            <h1 className="tier-hero__title ops-hero__title">
              {greeting}, operations.
              <br />
              <span className="tier-hero__title-soft">{shiftLabel(now)} in progress · {hardwareOnline} systems online</span>
            </h1>
            <p className="tier-hero__sub">
              Operating window · {operatingHours} · Selected loads run 24/7
            </p>
          </div>

          <div className="ops-hero__metrics">
            <div className="ops-hero__metric">
              <p className="ops-hero__metric-label">Energy score</p>
              <p className="ops-hero__metric-value">{Math.round(energyScore)}/100</p>
            </div>
            <div className="ops-hero__divider" aria-hidden="true" />
            <div className="ops-hero__metric">
              <p className="ops-hero__metric-label">Monthly load</p>
              <p className="ops-hero__metric-value">{(monthlyUsageKwh / 1000).toFixed(1)}k kWh</p>
            </div>
            <div className="ops-hero__divider" aria-hidden="true" />
            <div className="ops-hero__metric">
              <p className="ops-hero__metric-label">Monthly save</p>
              <p className="ops-hero__metric-value ops-hero__metric-value--accent">RM {(monthlySavingsRm / 1000).toFixed(1)}k</p>
            </div>
          </div>
        </div>
      </SoftCard>

      {/* SCHEDULE — multi-zone ops window across 24h, signature Enterprise feature */}
      <SoftCard variant="default" className="ops-card">
        <div className="ops-card__head">
          <div>
            <p className="card-eyebrow">Operations schedule</p>
            <h2 className="card-title">24-hour zone load plan</h2>
          </div>
          <SoftChip tone="cool"><Activity size={13} aria-hidden="true" />Live</SoftChip>
        </div>
        <ScheduleBar now={now} />
        <div className="ops-schedule-legend">
          <span><span className="ops-legend-dot ops-legend-dot--production" /> Production</span>
          <span><span className="ops-legend-dot ops-legend-dot--wind-down" /> Wind-down</span>
          <span><span className="ops-legend-dot ops-legend-dot--critical-only" /> Critical loads only</span>
          <span><span className="ops-legend-dot ops-legend-dot--idle" /> Idle</span>
        </div>
      </SoftCard>

      {/* ROW: After-hours enforcement + AI Twin recommendation */}
      <section className="tier-split">
        <SoftCard variant="warm" className="ops-enforcement">
          <p className="card-eyebrow">After-hours enforcement</p>
          <h2 className="card-title">Big loads can't be left on</h2>
          <div className="enforcement-grid">
            <EnforcementRow
              icon={Power}
              title="Zone B HVAC"
              status="Auto-shutdown at 19:30"
              tone="active"
            />
            <EnforcementRow
              icon={CircuitBoard}
              title="Production Zone 3"
              status="Locked out without approval"
              tone="active"
            />
            <EnforcementRow
              icon={Lock}
              title="Compressor Bank"
              status="Safety-gated · approval required"
              tone="locked"
            />
            <EnforcementRow
              icon={Wrench}
              title="Lighting Zone (Warehouse)"
              status="Off if no occupancy 30 min"
              tone="active"
            />
          </div>
          <SoftLink to="/automation">Manage rules</SoftLink>
        </SoftCard>

        <SoftCard variant="cool" className="ops-twin">
          <div className="ops-twin__head">
            <span className="ops-twin__icon">
              <Brain size={18} aria-hidden="true" />
            </span>
            <SoftChip tone="cool">Industry exclusive</SoftChip>
          </div>
          <p className="card-eyebrow">AI Twin recommendation</p>
          <h2 className="card-title">{recommendedScenario?.name || "Reduce after-hours HVAC"}</h2>
          <p className="ops-twin__detail">{recommendedScenario?.description || "Tune HVAC runtime against operating hours and zone demand."}</p>
          <div className="ops-twin__metrics">
            <div className="ops-twin__metric">
              <p className="ops-twin__metric-label">Projected save</p>
              <p className="ops-twin__metric-value">RM {Number(recommendedScenario?.savingsCost || 0).toLocaleString()}</p>
            </div>
            <div className="ops-twin__metric">
              <p className="ops-twin__metric-label">Confidence</p>
              <p className="ops-twin__metric-value">{recommendedScenario?.confidence || 0}%</p>
            </div>
            <div className="ops-twin__metric">
              <p className="ops-twin__metric-label">CO₂</p>
              <p className="ops-twin__metric-value">{Math.round(recommendedScenario?.co2ReductionKg || 0)} kg/cycle</p>
            </div>
          </div>
          <SoftLink to="/ai-twin">Open AI Twin simulator</SoftLink>
        </SoftCard>
      </section>

      {/* FLOOR PLAN — facility-wide */}
      <FloorPlan mode={mode} zones={zones} />

      {/* OPS HEALTH ROW: hardware + anomalies + approvals */}
      <section className="tier-stats tier-stats--four">
        <SoftStat
          icon={Wifi}
          label="Hardware online"
          value={`${hardwareOnline}/${hardware.length}`}
          hint={`${hardwareReady} ready / pending`}
          tone={hardwareOnline >= hardware.length - 1 ? "sage" : "warm"}
        />
        <SoftStat
          icon={AlertOctagon}
          label="Open anomalies"
          value={anomalies.filter((a) => /critical|high/i.test(a.severity || "")).length}
          hint="Critical + high severity"
          tone="warm"
        />
        <SoftStat
          icon={ClipboardList}
          label="Approvals queue"
          value={approvalQueue.filter((a) => a.status === "Pending").length}
          hint="Need facility-manager review"
          tone="default"
        />
        <SoftStat
          icon={Layers}
          label="Active rules"
          value={automationRules.filter((r) => r.enabled).length}
          hint={`Out of ${automationRules.length} configured`}
          tone="default"
        />
      </section>

      {/* SHIFT HANDOVER — quick narrative summary the facility manager can show their boss */}
      <SoftCard variant="default" className="ops-handover">
        <p className="card-eyebrow">Shift handover · {shiftLabel(now)}</p>
        <h2 className="card-title">What the next shift needs to know</h2>
        <ul className="handover-list">
          <li className="handover-item">
            <span className="handover-bullet handover-bullet--ok" aria-hidden="true" />
            <span><strong>{hardwareOnline}/{hardware.length} systems online.</strong> {hardwareReady ? `${hardwareReady} on standby (smart-meter ready).` : "All telemetry healthy."}</span>
          </li>
          {criticalZone ? (
            <li className="handover-item">
              <span className="handover-bullet handover-bullet--warn" aria-hidden="true" />
              <span><strong>{criticalZone.name}</strong> is the highest-waste zone right now ({(criticalZone.wastedKwh || 0).toFixed(1)} kWh avoidable). {criticalZone.recommendation || "Worth a closer look."}</span>
            </li>
          ) : null}
          <li className="handover-item">
            <span className="handover-bullet handover-bullet--info" aria-hidden="true" />
            <span><strong>AI Twin</strong> projects RM {Number(recommendedScenario?.savingsCost || 0).toLocaleString()} additional savings if {recommendedScenario?.name?.toLowerCase() || "the optimization scenario"} is approved.</span>
          </li>
          <li className="handover-item">
            <span className="handover-bullet handover-bullet--ok" aria-hidden="true" />
            <span><strong>Bill on track.</strong> RM {Number(monthlyBill).toLocaleString()}/month projected with {wastePercent}% avoidable.</span>
          </li>
        </ul>
        <div className="handover-actions">
          <SoftLink to="/reports">Generate full report</SoftLink>
          <SoftLink to="/automation">Review approvals</SoftLink>
        </div>
      </SoftCard>
    </div>
  );
}

function EnforcementRow({ icon: Icon, title, status, tone }) {
  return (
    <div className={`enforcement-row enforcement-row--${tone}`}>
      <span className="enforcement-row__icon">
        <Icon size={15} aria-hidden="true" />
      </span>
      <div className="enforcement-row__body">
        <p className="enforcement-row__title">{title}</p>
        <p className="enforcement-row__status">{status}</p>
      </div>
      <span className="enforcement-row__pulse" aria-hidden="true" />
    </div>
  );
}
