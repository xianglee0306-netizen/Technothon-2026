import { useState } from "react";
import { Activity, AlertCircle, Brain, Cpu, Crosshair, Database, Eye, Radar, Radio, Shield, Wifi, Zap } from "lucide-react";

/**
 * HudHero — full-width HUD command bar above the simulator.
 * Shows fake telemetry as if it's a tactical display.
 */
export function HudHero({ scenarios, recommendedScenario, mode }) {
  const confidence = recommendedScenario?.confidence || 0;
  const scenarioCount = scenarios?.length || 0;

  return (
    <article className="hud-hero">
      <div className="hud-hero__bg" aria-hidden="true">
        <svg viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="hud-hero-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(167, 139, 250, 0.18)" />
              <stop offset="100%" stopColor="rgba(167, 139, 250, 0)" />
            </radialGradient>
          </defs>
          <rect width="800" height="200" fill="rgba(2, 6, 23, 0)" />
          <ellipse cx="400" cy="100" rx="280" ry="80" fill="url(#hud-hero-grad)" />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={50 + i * 60} y1="0" x2={50 + i * 60} y2="200" stroke="rgba(167, 139, 250, 0.06)" strokeWidth="0.5" />
          ))}
        </svg>
      </div>

      <div className="hud-hero__corners" aria-hidden="true">
        <span className="hud-hero__corner hud-hero__corner--tl" />
        <span className="hud-hero__corner hud-hero__corner--tr" />
        <span className="hud-hero__corner hud-hero__corner--bl" />
        <span className="hud-hero__corner hud-hero__corner--br" />
      </div>

      <div className="hud-hero__inner">
        <div className="hud-hero__title-block">
          <p className="hud-hero__id">UNIT-{(mode || "RES").slice(0, 3).toUpperCase()}-01 · OPERATIONAL</p>
          <h2 className="hud-hero__title">AI TWIN COMMAND</h2>
          <p className="hud-hero__sub">Tactical simulation interface · Pre-action analysis</p>
        </div>

        <div className="hud-hero__telem">
          <HudTelem label="SCENARIOS" value={scenarioCount} unit="loaded" icon={Database} />
          <HudTelem label="CONFIDENCE" value={confidence} unit="%" icon={Brain} pulse />
          <HudTelem label="UPLINK" value="2.4ms" unit="latency" icon={Radio} ok />
          <HudTelem label="CORE" value="ONLINE" unit="status" icon={Cpu} ok />
        </div>
      </div>
    </article>
  );
}

function HudTelem({ label, value, unit, icon: Icon, ok, pulse }) {
  return (
    <div className={`hud-telem ${ok ? "hud-telem--ok" : ""} ${pulse ? "hud-telem--pulse" : ""}`}>
      <span className="hud-telem__icon">
        <Icon size={12} aria-hidden="true" />
      </span>
      <div className="hud-telem__body">
        <p className="hud-telem__label">{label}</p>
        <p className="hud-telem__value-row">
          <span className="hud-telem__value">{value}</span>
          <span className="hud-telem__unit">{unit}</span>
        </p>
      </div>
    </div>
  );
}

/**
 * HudRadar — circular radar plotting scenarios. Clicking a target
 * fires the onSelectScenario callback so the simulator below can pick it.
 */
export function HudRadar({ scenarios, onSelectScenario }) {
  const targets = (scenarios || []).slice(0, 8).map((s, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 30 + (100 - (s.confidence || 50)) * 0.6;
    return {
      id: s.id || i,
      x: 100 + Math.cos(angle) * radius,
      y: 100 + Math.sin(angle) * radius,
      label: s.name?.slice(0, 12) || `TGT-${i}`,
      priority: s.savingsCost > 200 ? "high" : s.savingsCost > 50 ? "med" : "low",
      raw: s
    };
  });

  return (
    <article className="hud-radar">
      <header className="hud-radar__head">
        <h3 className="hud-radar__title">
          <Radar size={14} aria-hidden="true" />
          <span>SCENARIO RADAR</span>
        </h3>
        <span className="hud-radar__count">{targets.length} TGT</span>
      </header>

      <div className="hud-radar__display">
        <svg viewBox="0 0 200 200" className="hud-radar__svg">
          {/* Concentric rings */}
          {[30, 60, 90].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="rgba(167, 139, 250, 0.18)" strokeWidth="0.5" strokeDasharray="2,3" />
          ))}
          {/* Cross hairs */}
          <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(167, 139, 250, 0.18)" strokeWidth="0.4" />
          <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(167, 139, 250, 0.18)" strokeWidth="0.4" />

          {/* Sweeping cone */}
          <g className="hud-radar__sweep">
            <defs>
              <linearGradient id="hud-sweep-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(167, 139, 250, 0.7)" />
                <stop offset="100%" stopColor="rgba(167, 139, 250, 0)" />
              </linearGradient>
            </defs>
            <path d="M 100 100 L 100 10 A 90 90 0 0 1 180 75 Z" fill="url(#hud-sweep-grad)" />
          </g>

          {/* Center */}
          <circle cx="100" cy="100" r="3" fill="rgba(196, 181, 253, 1)" />
          <circle cx="100" cy="100" r="6" fill="none" stroke="rgba(196, 181, 253, 0.7)" strokeWidth="1">
            <animate attributeName="r" values="6;14;6" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0;1" dur="2.4s" repeatCount="indefinite" />
          </circle>

          {/* Targets */}
          {targets.map((t) => {
            const fill = t.priority === "high" ? "rgba(244, 63, 94, 0.95)" : t.priority === "med" ? "rgba(251, 191, 36, 0.95)" : "rgba(110, 231, 183, 0.95)";
            return (
              <g key={t.id}
                 className={onSelectScenario ? "hud-radar__target--clickable" : ""}
                 onClick={onSelectScenario ? () => onSelectScenario(t.raw) : undefined}
                 style={onSelectScenario ? { cursor: "pointer" } : undefined}
              >
                {/* Larger invisible hit area for click */}
                {onSelectScenario ? (
                  <circle cx={t.x} cy={t.y} r="10" fill="transparent" />
                ) : null}
                <circle cx={t.x} cy={t.y} r="4" fill={fill}>
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="1.6s" repeatCount="indefinite" />
                </circle>
                <text x={t.x + 6} y={t.y + 3} fill="rgba(196, 181, 253, 0.9)" fontSize="6" fontFamily="JetBrains Mono, monospace">
                  {t.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <footer className="hud-radar__foot">
        <span className="hud-radar__leg hud-radar__leg--high">HIGH</span>
        <span className="hud-radar__leg hud-radar__leg--med">MED</span>
        <span className="hud-radar__leg hud-radar__leg--low">LOW</span>
      </footer>
    </article>
  );
}

/**
 * HudThreatLog — real-time event feed pulling from the dashboard's
 * notifications array (live alerts) and auditLog (recent actions).
 * Maps severity → tactical level (info/ok/warn/crit) so the visual
 * stays HUD-themed but every row is real backend data.
 */
export function HudThreatLog({ notifications = [], auditLog = [] }) {
  // Severity → HUD level mapping
  function severityToLvl(sev) {
    const s = String(sev || "").toLowerCase();
    if (s === "critical" || s === "high") return "CRIT";
    if (s === "warning" || s === "warn" || s === "hardware") return "WARN";
    if (s === "applied" || s === "active" || s === "operational" || s === "completed") return "OK";
    return "INFO";
  }

  // Combine notifications + audit events into a single tactical feed.
  // Notifications come first (live alerts). Audit log fills the rest.
  const notifEvents = notifications.slice(0, 5).map((n, i) => ({
    t: n.timestamp || n.time || `00:0${i}:${String(i * 12).padStart(2, "0")}`,
    lvl: severityToLvl(n.severity),
    msg: `${n.title || "Event"}${n.affectedZone ? ` · ${n.affectedZone}` : ""}`
  }));

  const auditEvents = auditLog.slice(0, 4).map((a, i) => ({
    t: a.time || `00:0${i + 5}:${String(i * 18).padStart(2, "0")}`,
    lvl: severityToLvl(a.status || "OK"),
    msg: `${a.actor || "System"} · ${a.action || "Action"}${a.target ? ` → ${a.target}` : ""}`
  }));

  const events = [...notifEvents, ...auditEvents].slice(0, 8);

  // Fallback if no real events yet (very early load state)
  if (events.length === 0) {
    events.push({ t: "00:00:00", lvl: "INFO", msg: "Telemetry channel idle · awaiting events" });
  }

  return (
    <article className="hud-threat-log">
      <header className="hud-threat-log__head">
        <h3 className="hud-threat-log__title">
          <Activity size={14} aria-hidden="true" />
          <span>EVENT LOG · LIVE</span>
        </h3>
        <span className="hud-threat-log__live-dot" aria-hidden="true" />
      </header>

      <ul className="hud-threat-log__list">
        {events.map((e, i) => (
          <li key={i} className={`hud-threat-log__row hud-threat-log__row--${e.lvl.toLowerCase()}`}>
            <span className="hud-threat-log__time">{e.t}</span>
            <span className="hud-threat-log__lvl">[{e.lvl}]</span>
            <span className="hud-threat-log__msg">{e.msg}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/**
 * HudSystemStatus — Sensor Health table. Each row is a real device from
 * dashboard.devices, showing its current consumption, status, and zone.
 * Clicking a row opens a detail drawer with control state + recommendation.
 *
 * Tone is derived from real status:
 *   "Running" / "Active" → ok (green bar)
 *   "Idle" / "Standby" → info (cyan bar)
 *   "Anomaly" / status containing "Warning" → warn (amber)
 *   "Offline" / "Fault" → crit (red)
 */
export function HudSystemStatus({ devices = [], summary }) {
  const [selected, setSelected] = useState(null);

  function deviceTone(d) {
    const s = String(d.status || "").toLowerCase();
    if (s.includes("anomaly") || s.includes("warning") || s.includes("warn")) return "warn";
    if (s.includes("offline") || s.includes("fault") || s.includes("error")) return "crit";
    if (s.includes("idle") || s.includes("standby")) return "info";
    return "ok";
  }

  // Use real devices, sorted by usage (highest first) — top 5 most active
  const rows = [...devices]
    .sort((a, b) => Number(b.usageKwh || 0) - Number(a.usageKwh || 0))
    .slice(0, 5);

  const nowStamp = new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const anyWarn = rows.some((d) => deviceTone(d) === "warn" || deviceTone(d) === "crit");
  // Compute "online" count
  const onlineCount = devices.filter((d) => {
    const tone = deviceTone(d);
    return tone === "ok" || tone === "info";
  }).length;

  // For each row, scale the bar to its share of total usage
  const totalUsage = rows.reduce((s, d) => s + Number(d.usageKwh || 0), 0) || 1;

  return (
    <article className="hud-sysstat">
      <header className="hud-sysstat__head">
        <h3 className="hud-sysstat__title">
          <Shield size={14} aria-hidden="true" />
          <span>SENSOR HEALTH</span>
        </h3>
        <span className="hud-sysstat__time">UPDATED {nowStamp}</span>
      </header>

      <ul className="hud-sysstat__list">
        {rows.map((d) => {
          const tone = deviceTone(d);
          const usage = Number(d.usageKwh || 0);
          const widthPct = Math.max(8, Math.round((usage / totalUsage) * 100));
          const isSelected = selected?.id === d.id;
          return (
            <li
              key={d.id}
              className={`hud-sysstat__row hud-sysstat__row--${tone} hud-sysstat__row--clickable ${isSelected ? "hud-sysstat__row--selected" : ""}`}
              onClick={() => setSelected(isSelected ? null : d)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(isSelected ? null : d); } }}
              aria-pressed={isSelected}
            >
              <div className="hud-sysstat__row-top">
                <span className="hud-sysstat__row-label">{(d.name || "Sensor").slice(0, 22).toUpperCase()}</span>
                <span className="hud-sysstat__row-value">{usage.toFixed(1)} kWh</span>
              </div>
              <div className="hud-sysstat__row-bar">
                <div className="hud-sysstat__row-fill" style={{ width: `${widthPct}%` }} />
              </div>
              <div className="hud-sysstat__row-foot">
                <span className="hud-sysstat__row-zone">{d.zone || "—"}</span>
                <span className="hud-sysstat__row-status">{d.status || "—"}</span>
              </div>
            </li>
          );
        })}
        {rows.length === 0 ? (
          <li className="hud-sysstat__empty">No sensor data · awaiting telemetry</li>
        ) : null}
      </ul>

      {selected ? (
        <div className="hud-sysstat__detail" role="region" aria-label="Selected sensor details">
          <div className="hud-sysstat__detail-head">
            <h4>{selected.name}</h4>
            <button type="button" onClick={() => setSelected(null)} aria-label="Close">×</button>
          </div>
          <dl className="hud-sysstat__detail-rows">
            <div><dt>Type</dt><dd>{selected.type || "—"}</dd></div>
            <div><dt>Zone</dt><dd>{selected.zone || "—"}</dd></div>
            <div><dt>Status</dt><dd>{selected.status || "—"}</dd></div>
            <div><dt>Usage</dt><dd>{Number(selected.usageKwh || 0).toFixed(1)} kWh</dd></div>
            <div><dt>Trend</dt><dd className={Number(selected.trendPercent || 0) >= 0 ? "hud-sysstat__detail-up" : "hud-sysstat__detail-down"}>
              {Number(selected.trendPercent || 0) >= 0 ? "+" : ""}{Number(selected.trendPercent || 0).toFixed(1)}%
            </dd></div>
            <div><dt>Control</dt><dd>{selected.controlEnabled ? "Available" : "View only"}</dd></div>
          </dl>
          {selected.recommendation ? (
            <p className="hud-sysstat__detail-rec">{selected.recommendation}</p>
          ) : null}
        </div>
      ) : null}

      <footer className="hud-sysstat__foot">
        <span className="hud-sysstat__foot-dot" />
        <span>{anyWarn ? `REVIEW · ${rows.filter((d) => deviceTone(d) === "warn" || deviceTone(d) === "crit").length} ANOMAL${rows.filter((d) => deviceTone(d) === "warn" || deviceTone(d) === "crit").length === 1 ? "Y" : "IES"}` : `${onlineCount} OF ${devices.length} SENSORS NOMINAL`}</span>
      </footer>
    </article>
  );
}
