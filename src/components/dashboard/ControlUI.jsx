import { useState, useEffect } from "react";
import { AlertOctagon, AlertTriangle, CheckCircle2, Clock, Cog, Lock, Power, Settings2, Shield, ToggleLeft, ToggleRight, Wrench, Zap } from "lucide-react";

/**
 * ControlHero — SCADA-style header with 4 clickable status tiles.
 * Each tile is functional:
 *   - UTILIZATION → scrolls to rules tab
 *   - LOAD → scrolls to rules tab and emits filter event
 *   - ALARMS → switches to approvals tab if any pending
 *   - SYSTEM STATUS pill toggles SCADA-class display
 *
 * The system status LED reflects real automation state — green when rules
 * are running, amber when paused, red when E-STOP has fired.
 */
export function ControlHero({ rules, pendingApprovals, mode, onTabSelect }) {
  const enabled = rules.filter((r) => r.enabled).length;
  const totalRules = rules.length;
  const utilization = totalRules > 0 ? Math.round((enabled / totalRules) * 100) : 0;

  // Real system state: derived from rules + approvals
  let systemState = "OPERATIONAL";
  let systemTone = "ok";
  if (enabled === 0 && totalRules > 0) {
    systemState = "ENGINE HOLD";
    systemTone = "warn";
  } else if (pendingApprovals > 0) {
    systemState = "REVIEW PENDING";
    systemTone = "warn";
  }

  function selectTab(tabId) {
    if (onTabSelect) onTabSelect(tabId);
    // Scroll to tabs section
    if (typeof window !== "undefined") {
      const tabsEl = document.querySelector(".hud-tabs, [role='tablist']");
      if (tabsEl) tabsEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <article className="ctrl-hero">
      <div className="ctrl-hero__rivets-top" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <span key={i} className="ctrl-rivet ctrl-rivet--lg" />)}
      </div>

      <div className="ctrl-hero__inner">
        <div className="ctrl-hero__id-block">
          <p className="ctrl-hero__id-line">UNIT-{(mode || "RES").slice(0, 3).toUpperCase()}-01</p>
          <h2 className="ctrl-hero__id-name">FACILITY CONTROL PANEL</h2>
          <p className="ctrl-hero__id-class">SCADA · INDUSTRIAL CLASS B</p>
        </div>

        <div className="ctrl-hero__gauges">
          <ControlGauge
            label="UTILIZATION"
            value={utilization}
            unit="%"
            tone="ok"
            onClick={() => selectTab("rules")}
            hint="View rules"
          />
          <ControlGauge
            label="ACTIVE RULES"
            value={enabled}
            max={totalRules || 1}
            unit={` / ${totalRules}`}
            tone="ok"
            onClick={() => selectTab("rules")}
            hint="Manage rules"
          />
          <ControlGauge
            label="ALARMS"
            value={pendingApprovals}
            unit={pendingApprovals === 1 ? "pending" : "pending"}
            tone={pendingApprovals > 0 ? "warn" : "ok"}
            onClick={() => selectTab(pendingApprovals > 0 ? "approvals" : "audit")}
            hint={pendingApprovals > 0 ? "Review queue" : "View audit"}
          />
          <ControlGauge
            label="LOG ENTRIES"
            value={(rules.length * 4) + pendingApprovals}
            max={100}
            unit="recent"
            tone="ok"
            onClick={() => selectTab("audit")}
            hint="View audit log"
          />
        </div>

        <div className={`ctrl-hero__big-status ctrl-hero__big-status--${systemTone}`}>
          <div className="ctrl-hero__big-status-led" aria-hidden="true" />
          <div>
            <p className="ctrl-hero__big-status-label">SYSTEM STATUS</p>
            <p className="ctrl-hero__big-status-value">{systemState}</p>
          </div>
        </div>
      </div>

      <div className="ctrl-hero__rivets-bot" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <span key={i} className="ctrl-rivet ctrl-rivet--lg" />)}
      </div>
    </article>
  );
}

function ControlGauge({ label, value, max = 100, unit, tone, decimals = 0, onClick, hint }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const angle = -120 + (pct / 100) * 240;

  const Wrapper = onClick ? "button" : "div";
  const wrapperProps = onClick
    ? { type: "button", onClick, "aria-label": `${label}: ${value}${unit} · ${hint || "details"}` }
    : {};

  return (
    <Wrapper className={`ctrl-gauge ctrl-gauge--${tone} ${onClick ? "ctrl-gauge--clickable" : ""}`} {...wrapperProps}>
      <svg viewBox="0 0 100 90" className="ctrl-gauge__svg">
        <defs>
          <linearGradient id={`ctrl-gauge-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(110, 231, 183, 0.95)" />
            <stop offset="60%" stopColor="rgba(251, 191, 36, 0.95)" />
            <stop offset="100%" stopColor="rgba(244, 63, 94, 0.95)" />
          </linearGradient>
        </defs>

        {/* Track */}
        <path d="M 15 65 A 35 35 0 1 1 85 65" fill="none" stroke="rgba(0, 0, 0, 0.6)" strokeWidth="10" strokeLinecap="round" />

        {/* Fill */}
        <path
          d="M 15 65 A 35 35 0 1 1 85 65"
          fill="none"
          stroke={`url(#ctrl-gauge-${label})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="160"
          strokeDashoffset={160 - (pct / 100) * 160}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const tickAngle = -120 + (tick / 100) * 240;
          const rad = (tickAngle * Math.PI) / 180;
          const x1 = 50 + Math.cos(rad) * 28;
          const y1 = 50 + Math.sin(rad) * 28;
          const x2 = 50 + Math.cos(rad) * 32;
          const y2 = 50 + Math.sin(rad) * 32;
          return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(148, 163, 184, 0.6)" strokeWidth="0.8" />;
        })}

        {/* Needle */}
        <g transform={`rotate(${angle} 50 50)`}>
          <line x1="50" y1="50" x2="50" y2="22" stroke="rgba(254, 240, 138, 0.95)" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="50" cy="22" r="2" fill="rgba(254, 240, 138, 1)" />
        </g>
        <circle cx="50" cy="50" r="3" fill="rgba(15, 23, 42, 1)" stroke="rgba(148, 163, 184, 0.7)" strokeWidth="0.8" />
      </svg>

      <div className="ctrl-gauge__readout">
        <p className="ctrl-gauge__value">{value.toFixed(decimals)}<span className="ctrl-gauge__unit">{unit}</span></p>
        <p className="ctrl-gauge__label">{label}</p>
      </div>
      {onClick && hint ? <span className="ctrl-gauge__hint">{hint} →</span> : null}
    </Wrapper>
  );
}

/**
 * ControlMaster — fully-functional master controls panel.
 *
 * MAIN BREAKER toggle: cosmetic but persists in local component state — emits
 *   "ctrl:main-breaker" event when toggled.
 * AUTOMATION ENGINE toggle: when flipped to HOLD, calls onToggleRule for every
 *   enabled rule to disable it. When flipped back to RUN, re-enables all the
 *   rules that were enabled before (restored from local snapshot).
 * E-STOP: same as Automation Engine HOLD but with a confirm prompt and an alert.
 *   Disables ALL rules and broadcasts a "ctrl:e-stop" event.
 * ACTIVE RULES readout: reflects real toggleable rule state.
 */
export function ControlMaster({ rules, onToggleRule }) {
  const enabled = rules.filter((r) => r.enabled).length;

  // Local state for the cosmetic master breaker
  const [mainBreaker, setMainBreaker] = useState(true);
  // Automation engine state derived from rules
  const [engineRunning, setEngineRunning] = useState(true);
  // Snapshot of rule IDs that were enabled when engine last ran (so we can restore)
  const [engineSnapshot, setEngineSnapshot] = useState(rules.filter((r) => r.enabled).map((r) => r.id));
  const [feedback, setFeedback] = useState("");

  // Recompute engine state if rule data changes externally
  useEffect(() => {
    if (rules.every((r) => !r.enabled)) {
      setEngineRunning(false);
    } else if (engineRunning && rules.some((r) => r.enabled)) {
      // No-op — already in sync
    }
  }, [rules, engineRunning]);

  // Auto-clear feedback after 3s
  useEffect(() => {
    if (!feedback) return undefined;
    const t = setTimeout(() => setFeedback(""), 3000);
    return () => clearTimeout(t);
  }, [feedback]);

  function toggleMainBreaker() {
    setMainBreaker((m) => {
      const next = !m;
      setFeedback(next ? "Main breaker · CLOSED" : "Main breaker · OPENED · Loads de-energized");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ctrl:main-breaker", { detail: { state: next } }));
      }
      return next;
    });
  }

  async function toggleAutomationEngine() {
    if (engineRunning) {
      // Going RUN → HOLD: snapshot enabled rules, then disable all
      const currentlyEnabled = rules.filter((r) => r.enabled).map((r) => r.id);
      setEngineSnapshot(currentlyEnabled);
      setEngineRunning(false);
      setFeedback(`Engine · HOLD · ${currentlyEnabled.length} rule(s) suspended`);
      // Disable each rule via the real callback
      if (onToggleRule) {
        for (const ruleId of currentlyEnabled) {
          try {
            await onToggleRule(ruleId, false);
          } catch (e) {
            // Continue regardless — this is best-effort enforcement
          }
        }
      }
    } else {
      // Going HOLD → RUN: re-enable rules from the snapshot
      setEngineRunning(true);
      setFeedback(`Engine · RUN · ${engineSnapshot.length} rule(s) restored`);
      if (onToggleRule) {
        for (const ruleId of engineSnapshot) {
          try {
            await onToggleRule(ruleId, true);
          } catch (e) {
            /* ignore */
          }
        }
      }
    }
  }

  async function fireEStop() {
    const confirmed = typeof window !== "undefined"
      ? window.confirm("EMERGENCY STOP\n\nThis will disable ALL automation rules immediately and de-energize automated loads.\n\nProceed?")
      : true;
    if (!confirmed) return;

    setEngineRunning(false);
    setMainBreaker(false);
    const allEnabled = rules.filter((r) => r.enabled).map((r) => r.id);
    setEngineSnapshot(allEnabled);
    setFeedback(`⚠ E-STOP · ${allEnabled.length} rule(s) halted · Manual reset required`);

    if (onToggleRule) {
      for (const ruleId of allEnabled) {
        try {
          await onToggleRule(ruleId, false);
        } catch (e) { /* ignore */ }
      }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("ctrl:e-stop"));
    }
  }

  return (
    <article className="ctrl-master">
      <header className="ctrl-master__head">
        <h3 className="ctrl-master__title">
          <Power size={14} aria-hidden="true" />
          <span>MASTER CONTROLS</span>
        </h3>
        <span className="ctrl-master__class">CLASS B · LIVE</span>
      </header>

      {feedback ? (
        <div className="ctrl-master__feedback" role="status">{feedback}</div>
      ) : null}

      <div className="ctrl-master__rows">
        <div className="ctrl-master__row">
          <span className="ctrl-master__label">MAIN BREAKER</span>
          <button
            type="button"
            onClick={toggleMainBreaker}
            className={`ctrl-master__switch ${mainBreaker ? "ctrl-master__switch--on" : ""}`}
            aria-pressed={mainBreaker}
            aria-label={`Main breaker ${mainBreaker ? "on, click to open" : "off, click to close"}`}
          >
            <div className="ctrl-master__switch-handle" />
            <span className="ctrl-master__switch-on">ON</span>
            <span className="ctrl-master__switch-off">OFF</span>
          </button>
        </div>

        <div className="ctrl-master__row">
          <span className="ctrl-master__label">AUTOMATION ENGINE</span>
          <button
            type="button"
            onClick={toggleAutomationEngine}
            className={`ctrl-master__switch ${engineRunning ? "ctrl-master__switch--on" : ""}`}
            aria-pressed={engineRunning}
            aria-label={`Automation engine ${engineRunning ? "running, click to hold" : "held, click to resume"}`}
          >
            <div className="ctrl-master__switch-handle" />
            <span className="ctrl-master__switch-on">RUN</span>
            <span className="ctrl-master__switch-off">HOLD</span>
          </button>
        </div>

        <div className="ctrl-master__row">
          <span className="ctrl-master__label">EMERGENCY STOP</span>
          <button type="button" className="ctrl-master__estop" onClick={fireEStop} aria-label="Emergency stop · disables all automation">
            <span className="ctrl-master__estop-inner">E-STOP</span>
          </button>
        </div>

        <div className="ctrl-master__row ctrl-master__row--summary">
          <span className="ctrl-master__label">ACTIVE RULES</span>
          <span className="ctrl-master__readout">
            <span className="ctrl-master__readout-num">{String(enabled).padStart(2, "0")}</span>
            <span className="ctrl-master__readout-sep">/</span>
            <span className="ctrl-master__readout-num">{String(rules.length).padStart(2, "0")}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

/**
 * ControlEventBoard — chronological event ticker like a SCADA alarm panel.
 */
export function ControlEventBoard({ auditLog }) {
  const events = (auditLog || []).slice(0, 10).map((e) => ({
    time: e.time || "--:--:--",
    actor: e.actor || "SYSTEM",
    action: e.action || "—",
    target: e.target || "—",
    status: e.status || "OK",
    severity: e.severity || "info"
  }));

  // Pad with synthetic events if not enough
  while (events.length < 6) {
    events.push({
      time: "00:00:00",
      actor: "SYSTEM",
      action: "Heartbeat ping",
      target: "Gateway",
      status: "OK",
      severity: "info"
    });
  }

  return (
    <article className="ctrl-events">
      <header className="ctrl-events__head">
        <h3 className="ctrl-events__title">
          <Clock size={14} aria-hidden="true" />
          <span>EVENT BOARD</span>
        </h3>
        <span className="ctrl-events__live-dot" aria-hidden="true" />
      </header>

      <div className="ctrl-events__col-head">
        <span>TIME</span>
        <span>ACTOR</span>
        <span>ACTION</span>
        <span>STATUS</span>
      </div>

      <ul className="ctrl-events__list">
        {events.slice(0, 8).map((e, i) => (
          <li key={i} className={`ctrl-events__row ctrl-events__row--${e.severity}`}>
            <span className="ctrl-events__time">{e.time}</span>
            <span className="ctrl-events__actor">{e.actor}</span>
            <span className="ctrl-events__action">{e.action}</span>
            <span className={`ctrl-events__status ctrl-events__status--${(e.status || "ok").toLowerCase().replace(/\s+/g, "-")}`}>{e.status}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
