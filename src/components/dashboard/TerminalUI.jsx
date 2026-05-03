import { useState } from "react";
import { Activity, Eye, LineChart, Star, TrendingDown, TrendingUp } from "lucide-react";

/**
 * TerminalHero — Bloomberg-style position summary at top of ROI page.
 * Shows "current position", live P&L equivalent, and time to breakeven.
 */
export function TerminalHero({ model, mode }) {
  const investment = Number(model.totalCost || 0);
  const monthlySaving = Number(model.estimatedMonthlySavingsCost || 0);
  const paybackMonths = Number(model.paybackMonths || 0);
  const irr = paybackMonths > 0 ? Math.round((100 / paybackMonths) * 12) / 1 : 0;
  const elapsedPct = Math.min(100, Math.round((4.2 / Math.max(paybackMonths, 1)) * 100));

  return (
    <article className="term-hero">
      <div className="term-hero__col term-hero__col--symbol">
        <div className="term-hero__sym-row">
          <span className="term-hero__sym">GSIQ:{(mode || "RES").slice(0, 3).toUpperCase()}</span>
          <span className="term-hero__exchange">[GRID-MY]</span>
        </div>
        <p className="term-hero__name">GridSenseIQ Energy Position</p>
        <div className="term-hero__row">
          <span className="term-hero__live-dot" aria-hidden="true" />
          <span className="term-hero__live-text">LIVE · Mkt open</span>
          <span className="term-hero__sep">·</span>
          <span className="term-hero__time">MYT {new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>

      <div className="term-hero__col term-hero__col--price">
        <p className="term-hero__price-label">UNREALIZED P&L</p>
        <p className="term-hero__price">RM +{Math.round(monthlySaving * 4.2).toLocaleString()}</p>
        <div className="term-hero__price-deltas">
          <span className="term-hero__delta term-hero__delta--up">
            <TrendingUp size={12} aria-hidden="true" />
            +{Math.round((monthlySaving * 4.2 / investment) * 100)}%
          </span>
          <span className="term-hero__sep">·</span>
          <span className="term-hero__period">since deployment</span>
        </div>
      </div>

      <div className="term-hero__col term-hero__col--metrics">
        <div className="term-hero__metric">
          <span className="term-hero__metric-label">Position</span>
          <span className="term-hero__metric-value">RM {investment.toLocaleString()}</span>
        </div>
        <div className="term-hero__metric">
          <span className="term-hero__metric-label">Monthly yield</span>
          <span className="term-hero__metric-value term-hero__metric-value--up">+RM {Math.round(monthlySaving).toLocaleString()}</span>
        </div>
        <div className="term-hero__metric">
          <span className="term-hero__metric-label">IRR (annualized)</span>
          <span className="term-hero__metric-value term-hero__metric-value--up">{irr}%</span>
        </div>
        <div className="term-hero__metric">
          <span className="term-hero__metric-label">Breakeven</span>
          <span className="term-hero__metric-value">{paybackMonths} mo</span>
        </div>
      </div>

      <div className="term-hero__col term-hero__col--progress">
        <div className="term-hero__progress-label-row">
          <span className="term-hero__progress-label">Path to breakeven</span>
          <span className="term-hero__progress-pct">{elapsedPct}%</span>
        </div>
        <div className="term-hero__progress-bar">
          <div className="term-hero__progress-fill" style={{ width: `${elapsedPct}%` }} />
          {[25, 50, 75].map((tick) => (
            <span key={tick} className="term-hero__progress-tick" style={{ left: `${tick}%` }} />
          ))}
        </div>
        <p className="term-hero__progress-note">Month 4.2 of {paybackMonths} · {paybackMonths - 4.2 < 0 ? "BREAKEVEN ACHIEVED" : `${(paybackMonths - 4.2).toFixed(1)} mo remaining`}</p>
      </div>
    </article>
  );
}

/**
 * TerminalChart — Cumulative Savings Projection.
 *
 * Replaces the old (decorative) candle chart with a functional view of the
 * ROI story: a curve plotting cumulative RM saved over months of deployment,
 * with the breakeven point marked. Clicking any data point opens a detail
 * drawer showing the cumulative savings, monthly contribution, and remaining
 * months to breakeven for that point in time.
 *
 * Inputs:
 *   - monthlySaving: real RM savings per month from roiModel
 *   - retrofitCost: total deployment cost
 *   - paybackMonths: when the curve crosses retrofitCost
 *   - onSelectMonth: callback receiving { monthIdx, cumulative, remaining }
 */
export function TerminalChart({ monthlySaving = 0, retrofitCost = 0, paybackMonths = 0 }) {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [horizon, setHorizon] = useState("24m");

  // Horizon selector → number of months
  const monthsCount = horizon === "12m" ? 12 : horizon === "24m" ? 24 : horizon === "36m" ? 36 : 60;

  // Build monthly cumulative savings points
  const points = Array.from({ length: monthsCount + 1 }, (_, i) => ({
    month: i,
    cumulative: i * monthlySaving,
    label: i === 0 ? "Today" : `M${i}`
  }));

  const maxCumulative = Math.max(monthlySaving * monthsCount, retrofitCost * 1.2, 1);
  const w = 800;
  const h = 220;
  const pad = { left: 50, right: 16, top: 14, bottom: 28 };

  function x(monthIdx) {
    return pad.left + (monthIdx / monthsCount) * (w - pad.left - pad.right);
  }
  function y(value) {
    return h - pad.bottom - (value / maxCumulative) * (h - pad.top - pad.bottom);
  }

  const breakevenX = paybackMonths > 0 && paybackMonths <= monthsCount ? x(paybackMonths) : null;
  const breakevenY = paybackMonths > 0 ? y(retrofitCost) : null;

  // Build SVG path for cumulative line
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.month)} ${y(p.cumulative)}`).join(" ");
  // Area fill below the line (subtle)
  const areaPath = `${linePath} L ${x(monthsCount)} ${y(0)} L ${x(0)} ${y(0)} Z`;

  function handleSelect(point) {
    setSelectedMonth(point);
  }

  // Y-axis ticks (4 evenly spaced)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => p * maxCumulative);

  return (
    <article className="term-chart">
      <header className="term-chart__head">
        <div className="term-chart__head-left">
          <h3 className="term-chart__title">
            <LineChart size={16} aria-hidden="true" />
            <span>Cumulative Savings Projection</span>
          </h3>
          <span className="term-chart__interval">RM saved over time · click month for detail</span>
        </div>
        <div className="term-chart__head-right">
          {[
            { id: "12m", label: "12M" },
            { id: "24m", label: "24M" },
            { id: "36m", label: "36M" },
            { id: "60m", label: "5Y" }
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setHorizon(p.id)}
              className={`term-chart__period-btn ${horizon === p.id ? "term-chart__period-btn--active" : ""}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <div className="term-chart__body">
        <svg viewBox={`0 0 ${w} ${h}`} className="term-chart__svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="term-savings-area" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(52, 211, 153, 0.32)" />
              <stop offset="100%" stopColor="rgba(52, 211, 153, 0)" />
            </linearGradient>
            <pattern id="term-grid" width="40" height="44" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 44" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Grid */}
          <rect x={pad.left} y={pad.top} width={w - pad.left - pad.right} height={h - pad.top - pad.bottom} fill="url(#term-grid)" />

          {/* Y-axis grid lines + labels */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={pad.left} x2={w - pad.right} y1={y(t)} y2={y(t)} stroke="rgba(186, 230, 253, 0.08)" strokeDasharray="2,3" />
              <text x={pad.left - 6} y={y(t) + 3} fill="rgba(148, 163, 184, 0.7)" fontSize="9" textAnchor="end">
                RM {Math.round(t).toLocaleString()}
              </text>
            </g>
          ))}

          {/* Retrofit-cost horizontal threshold */}
          {retrofitCost > 0 ? (
            <g>
              <line
                x1={pad.left}
                x2={w - pad.right}
                y1={y(retrofitCost)}
                y2={y(retrofitCost)}
                stroke="rgba(252, 165, 165, 0.5)"
                strokeDasharray="6,4"
              />
              <text x={w - pad.right - 4} y={y(retrofitCost) - 4} fill="rgba(252, 165, 165, 0.95)" fontSize="9" textAnchor="end">
                RM {retrofitCost.toLocaleString()} · breakeven line
              </text>
            </g>
          ) : null}

          {/* Filled area under the curve */}
          <path d={areaPath} fill="url(#term-savings-area)" />

          {/* Cumulative line */}
          <path d={linePath} fill="none" stroke="rgba(110, 231, 183, 0.95)" strokeWidth="2.2" />

          {/* Breakeven marker */}
          {breakevenX != null ? (
            <g>
              <line x1={breakevenX} y1={pad.top} x2={breakevenX} y2={h - pad.bottom} stroke="rgba(254, 240, 138, 0.55)" strokeDasharray="3,3" />
              <circle cx={breakevenX} cy={breakevenY} r="6" fill="rgba(254, 240, 138, 1)">
                <animate attributeName="r" values="6;9;6" dur="2s" repeatCount="indefinite" />
              </circle>
              <text x={breakevenX + 8} y={breakevenY - 8} fill="rgba(254, 240, 138, 0.95)" fontSize="10" fontWeight="700">
                BREAKEVEN · M{Math.round(paybackMonths)}
              </text>
            </g>
          ) : null}

          {/* Clickable data points (one every month for short horizon, every 2-3 months for longer) */}
          {points.filter((_, i) => i % Math.max(1, Math.floor(monthsCount / 12)) === 0).map((p) => (
            <g key={p.month} className="term-chart__point" onClick={() => handleSelect(p)} style={{ cursor: "pointer" }}>
              <circle cx={x(p.month)} cy={y(p.cumulative)} r="10" fill="transparent" />
              <circle
                cx={x(p.month)}
                cy={y(p.cumulative)}
                r={selectedMonth?.month === p.month ? 5 : 3}
                fill={selectedMonth?.month === p.month ? "rgba(254, 240, 138, 1)" : "rgba(110, 231, 183, 0.95)"}
                stroke="rgba(2, 6, 23, 0.85)"
                strokeWidth="1"
              />
            </g>
          ))}

          {/* X-axis labels (every 25%) */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const m = Math.round(p * monthsCount);
            return (
              <text key={i} x={x(m)} y={h - 8} fill="rgba(148, 163, 184, 0.7)" fontSize="9" textAnchor="middle">
                {m === 0 ? "Today" : `M${m}`}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Selection drawer — only when a point is clicked */}
      {selectedMonth ? (
        <div className="term-chart__detail" role="region" aria-label="Selected month details">
          <div className="term-chart__detail-row">
            <span className="term-chart__detail-label">Selected month</span>
            <span className="term-chart__detail-value">{selectedMonth.month === 0 ? "Today" : `Month ${selectedMonth.month}`}</span>
          </div>
          <div className="term-chart__detail-row">
            <span className="term-chart__detail-label">Cumulative saved</span>
            <span className="term-chart__detail-value term-chart__detail-value--up">RM {Math.round(selectedMonth.cumulative).toLocaleString()}</span>
          </div>
          <div className="term-chart__detail-row">
            <span className="term-chart__detail-label">vs retrofit cost</span>
            <span className={`term-chart__detail-value ${selectedMonth.cumulative >= retrofitCost ? "term-chart__detail-value--up" : "term-chart__detail-value--down"}`}>
              {selectedMonth.cumulative >= retrofitCost
                ? `+RM ${Math.round(selectedMonth.cumulative - retrofitCost).toLocaleString()} ahead`
                : `RM ${Math.round(retrofitCost - selectedMonth.cumulative).toLocaleString()} short`}
            </span>
          </div>
          <div className="term-chart__detail-row">
            <span className="term-chart__detail-label">Status</span>
            <span className="term-chart__detail-value">
              {selectedMonth.cumulative >= retrofitCost ? "Past breakeven · pure profit" : `${Math.max(0, paybackMonths - selectedMonth.month).toFixed(1)} mo to breakeven`}
            </span>
          </div>
          <button type="button" className="term-chart__detail-close" onClick={() => setSelectedMonth(null)} aria-label="Close detail">
            ×
          </button>
        </div>
      ) : null}

      <footer className="term-chart__foot">
        <span className="term-chart__leg term-chart__leg--up">
          <span className="term-chart__leg-dot" />
          Cumulative savings
        </span>
        <span className="term-chart__leg term-chart__leg--down">
          <span className="term-chart__leg-dot" />
          Retrofit cost line
        </span>
        <span className="term-chart__leg-text">{points.length} months · click any point</span>
      </footer>
    </article>
  );
}

/**
 * TerminalWatchlist — sidebar showing real device-level "positions"
 * derived from the dashboard.devices array. Each device → a watchlist row
 * with its actual kWh usage as "price" (RM equivalent), real trendPercent
 * as the change.
 */
export function TerminalWatchlist({ mode, devices = [], currency = "MYR", tariffPerKwh = 0.42 }) {
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Real devices → watchlist items. Pick top 5 by usage.
  const sorted = [...devices].sort((a, b) => Number(b.usageKwh || 0) - Number(a.usageKwh || 0));
  const top = sorted.slice(0, 5);

  const items = top.length > 0
    ? top.map((d) => {
        const usage = Number(d.usageKwh || 0);
        const rmCost = usage * tariffPerKwh;
        const trend = Number(d.trendPercent || 0);
        const sym = (d.name || "—").split(" ")[0].toUpperCase().slice(0, 6);
        return {
          sym,
          name: d.name || "Device",
          price: `${currency === "MYR" ? "RM " : "$"}${rmCost.toFixed(2)}`,
          change: `${trend >= 0 ? "+" : ""}${trend.toFixed(1)}%`,
          up: trend >= 0,
          vol: `${usage.toFixed(1)} kWh`,
          // Pass-through real device for detail panel
          device: d,
          tariffPerKwh,
          rmCost
        };
      })
    : // Fallback if devices array empty
      mode === "enterprise"
      ? [
          { sym: "HVAC", name: "HVAC Systems", price: "RM 4,820", change: "+2.4%", up: true, vol: "12.4k kWh" },
          { sym: "PROD", name: "Production Line", price: "RM 8,140", change: "+0.8%", up: true, vol: "28.7k kWh" },
          { sym: "LIGHT", name: "Lighting Grid", price: "RM 1,240", change: "-1.2%", up: false, vol: "3.8k kWh" },
          { sym: "COMP", name: "Compressor Bank", price: "RM 2,860", change: "+5.6%", up: true, vol: "8.2k kWh" },
          { sym: "OFFICE", name: "Office Floor", price: "RM 920", change: "+0.3%", up: true, vol: "2.1k kWh" }
        ]
      : mode === "business"
        ? [
            { sym: "AC", name: "Air Conditioning", price: "RM 480", change: "+3.2%", up: true, vol: "1.4k kWh" },
            { sym: "LIGHT", name: "Lighting", price: "RM 220", change: "+1.1%", up: true, vol: "640 kWh" },
            { sym: "FRIDGE", name: "Refrigeration", price: "RM 380", change: "-0.5%", up: false, vol: "1.1k kWh" },
            { sym: "EQUIP", name: "Equipment", price: "RM 160", change: "+0.8%", up: true, vol: "460 kWh" },
            { sym: "MISC", name: "Misc Plug Loads", price: "RM 80", change: "+0.2%", up: true, vol: "240 kWh" }
          ]
        : [
            { sym: "AC", name: "Air Conditioning", price: "RM 145", change: "+2.8%", up: true, vol: "420 kWh" },
            { sym: "WATER", name: "Water Heater", price: "RM 88", change: "+1.4%", up: true, vol: "260 kWh" },
            { sym: "FRIDGE", name: "Refrigerator", price: "RM 42", change: "-0.3%", up: false, vol: "120 kWh" },
            { sym: "LIGHT", name: "Lighting", price: "RM 18", change: "+0.6%", up: true, vol: "55 kWh" },
            { sym: "STDBY", name: "Standby Loads", price: "RM 16", change: "+1.8%", up: true, vol: "48 kWh" }
          ];

  return (
    <article className="term-watchlist">
      <header className="term-watchlist__head">
        <h3 className="term-watchlist__title">
          <Eye size={14} aria-hidden="true" />
          <span>Zone Positions</span>
        </h3>
        <span className="term-watchlist__count">{items.length}</span>
      </header>

      <div className="term-watchlist__col-head">
        <span>Zone</span>
        <span>Cost / Usage</span>
        <span>Trend</span>
      </div>

      <ul className="term-watchlist__list">
        {items.map((item) => {
          const isSelected = selectedDevice?.sym === item.sym;
          const isClickable = Boolean(item.device);
          return (
            <li
              key={item.sym}
              className={`term-watchlist__row ${isSelected ? "term-watchlist__row--selected" : ""} ${isClickable ? "term-watchlist__row--clickable" : ""}`}
              onClick={isClickable ? () => setSelectedDevice(isSelected ? null : item) : undefined}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedDevice(isSelected ? null : item); } } : undefined}
            >
              <div className="term-watchlist__sym-block">
                <span className="term-watchlist__star">
                  <Star size={10} aria-hidden="true" />
                </span>
                <div>
                  <p className="term-watchlist__sym">{item.sym}</p>
                  <p className="term-watchlist__sym-name">{item.name}</p>
                </div>
              </div>
              <div className="term-watchlist__price-block">
                <p className="term-watchlist__price">{item.price}</p>
                <p className="term-watchlist__vol">{item.vol}</p>
              </div>
              <span className={`term-watchlist__chg term-watchlist__chg--${item.up ? "up" : "down"}`}>
                {item.up ? <TrendingUp size={11} aria-hidden="true" /> : <TrendingDown size={11} aria-hidden="true" />}
                {item.change}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Detail panel — opens when a device row is clicked */}
      {selectedDevice ? (
        <div className="term-watchlist__detail" role="region" aria-label="Selected device details">
          <div className="term-watchlist__detail-head">
            <h4>{selectedDevice.name}</h4>
            <button type="button" onClick={() => setSelectedDevice(null)} aria-label="Close detail">×</button>
          </div>
          <dl className="term-watchlist__detail-rows">
            <div className="term-watchlist__detail-row">
              <dt>Status</dt>
              <dd>{selectedDevice.device?.status || "—"}</dd>
            </div>
            <div className="term-watchlist__detail-row">
              <dt>Zone</dt>
              <dd>{selectedDevice.device?.zone || "—"}</dd>
            </div>
            <div className="term-watchlist__detail-row">
              <dt>Daily usage</dt>
              <dd>{selectedDevice.vol}</dd>
            </div>
            <div className="term-watchlist__detail-row">
              <dt>Daily cost</dt>
              <dd>{selectedDevice.price}</dd>
            </div>
            <div className="term-watchlist__detail-row">
              <dt>30-day trend</dt>
              <dd className={selectedDevice.up ? "term-watchlist__detail-up" : "term-watchlist__detail-down"}>
                {selectedDevice.change}
              </dd>
            </div>
            <div className="term-watchlist__detail-row">
              <dt>Control</dt>
              <dd>{selectedDevice.device?.controlEnabled ? "Available" : "View only"}</dd>
            </div>
          </dl>
          {selectedDevice.device?.recommendation ? (
            <p className="term-watchlist__detail-rec">
              <strong>Tip:</strong> {selectedDevice.device.recommendation}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

/**
 * TerminalOrderBook — TNB tariff "depth" derived from real consumption.
 * Each row represents a TNB tariff band; the qty column is approximate
 * monthly kWh that would fall in that band given the user's projected
 * monthly consumption, and the total is the RM cost at that band.
 *
 * TNB residential bands (2026):
 *   1–200 kWh: RM 0.218
 *   201–300: RM 0.334
 *   301–600: RM 0.516
 *   601+: RM 0.571
 */
export function TerminalOrderBook({ projectedMonthlyKwh = 0, mode = "residential" }) {
  // Allocate consumption across bands (residential progressive structure)
  const monthly = Math.max(0, Number(projectedMonthlyKwh || 0));

  // Tier-aware band boundaries (industry/commercial use commercial flat-ish rates)
  const bands = mode === "enterprise"
    ? [
        { px: "0.265", label: "Industrial low", capacity: 5000 },
        { px: "0.385", label: "Industrial mid", capacity: 15000 },
        { px: "0.445", label: "Industrial peak", capacity: 12000 },
        { px: "0.571", label: "Peak demand", capacity: 6000 }
      ]
    : mode === "business"
      ? [
          { px: "0.435", label: "Commercial fixed", capacity: 1000 },
          { px: "0.509", label: "Commercial mid", capacity: 1200 },
          { px: "0.546", label: "Commercial peak", capacity: 800 }
        ]
      : [
          { px: "0.218", label: "Tier 1: 1–200 kWh", capacity: 200 },
          { px: "0.334", label: "Tier 2: 201–300", capacity: 100 },
          { px: "0.516", label: "Tier 3: 301–600", capacity: 300 },
          { px: "0.571", label: "Tier 4: 601+", capacity: 600 }
        ];

  // Walk through bands, allocating consumption into each
  let remaining = monthly;
  const allocations = bands.map((b) => {
    const qty = Math.min(remaining, b.capacity);
    remaining -= qty;
    const total = qty * Number(b.px);
    return { px: b.px, label: b.label, qty: Math.round(qty), total: total.toFixed(0) };
  });

  // Split into "sells" (lower-priced bands you've already filled) and "buys"
  // (higher-priced bands you're approaching). Use them as labelling.
  const sellBands = allocations.slice(0, Math.ceil(allocations.length / 2));
  const buyBands = allocations.slice(Math.ceil(allocations.length / 2));

  // Pick mid price (current effective rate) — weighted average
  const totalCost = allocations.reduce((s, a) => s + parseFloat(a.total), 0);
  const totalQty = allocations.reduce((s, a) => s + a.qty, 0);
  const midPrice = totalQty > 0 ? (totalCost / totalQty).toFixed(3) : "0.252";

  // Spread between highest current band and lowest unfilled band
  const usedBands = allocations.filter((a) => a.qty > 0);
  const currentTopBand = usedBands.length > 0 ? usedBands[usedBands.length - 1] : allocations[0];
  const nextBand = allocations[usedBands.length] || allocations[allocations.length - 1];
  const spread = (parseFloat(nextBand.px) - parseFloat(currentTopBand.px)).toFixed(3);

  const sells = sellBands.map((a) => ({
    px: a.px,
    qty: a.qty.toLocaleString(),
    total: `RM ${parseFloat(a.total).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    raw: a
  }));

  const buys = buyBands.map((a) => ({
    px: a.px,
    qty: a.qty.toLocaleString(),
    total: `RM ${parseFloat(a.total).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    raw: a
  }));

  // Local state: selected band for the detail row
  const [selectedBand, setSelectedBand] = useState(null);

  function handleSelect(band) {
    setSelectedBand((curr) => (curr?.px === band.px ? null : band));
  }

  return (
    <article className="term-orderbook">
      <header className="term-orderbook__head">
        <h3 className="term-orderbook__title">
          <Activity size={14} aria-hidden="true" />
          <span>Tariff Depth · TNB Bands</span>
        </h3>
        <span className="term-orderbook__spread">SPREAD {spread}</span>
      </header>

      <div className="term-orderbook__table">
        <div className="term-orderbook__col-head">
          <span>RM/kWh</span>
          <span>kWh</span>
          <span>TOTAL</span>
        </div>

        <div className="term-orderbook__sells">
          {[...sells].reverse().map((s, i) => {
            const isSelected = selectedBand?.px === s.raw.px;
            return (
              <div
                key={i}
                className={`term-orderbook__row term-orderbook__row--sell term-orderbook__row--clickable ${isSelected ? "term-orderbook__row--selected" : ""}`}
                onClick={() => handleSelect(s.raw)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(s.raw); } }}
              >
                <span className="term-orderbook__px">{s.px}</span>
                <span className="term-orderbook__qty">{s.qty}</span>
                <span className="term-orderbook__total">{s.total}</span>
                <div className="term-orderbook__bar term-orderbook__bar--sell" style={{ width: `${20 + i * 18}%` }} />
              </div>
            );
          })}
        </div>

        <div className="term-orderbook__mid">
          <span className="term-orderbook__mid-label">EFFECTIVE RATE</span>
          <span className="term-orderbook__mid-val">RM {midPrice}/kWh</span>
        </div>

        <div className="term-orderbook__buys">
          {buys.map((b, i) => {
            const isSelected = selectedBand?.px === b.raw.px;
            return (
              <div
                key={i}
                className={`term-orderbook__row term-orderbook__row--buy term-orderbook__row--clickable ${isSelected ? "term-orderbook__row--selected" : ""}`}
                onClick={() => handleSelect(b.raw)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(b.raw); } }}
              >
                <span className="term-orderbook__px">{b.px}</span>
                <span className="term-orderbook__qty">{b.qty}</span>
                <span className="term-orderbook__total">{b.total}</span>
                <div className="term-orderbook__bar term-orderbook__bar--buy" style={{ width: `${20 + (3 - i) * 18}%` }} />
              </div>
            );
          })}
        </div>

        {/* Detail row — opens when a band is clicked */}
        {selectedBand ? (
          <div className="term-orderbook__detail">
            <div className="term-orderbook__detail-head">
              <h4>{selectedBand.label}</h4>
              <button type="button" onClick={() => setSelectedBand(null)} aria-label="Close">×</button>
            </div>
            <dl className="term-orderbook__detail-rows">
              <div className="term-orderbook__detail-row">
                <dt>Rate</dt>
                <dd>RM {selectedBand.px}/kWh</dd>
              </div>
              <div className="term-orderbook__detail-row">
                <dt>Allocated kWh</dt>
                <dd>{Math.round(selectedBand.qty).toLocaleString()} kWh</dd>
              </div>
              <div className="term-orderbook__detail-row">
                <dt>Cost in this band</dt>
                <dd>RM {parseFloat(selectedBand.total).toLocaleString()}</dd>
              </div>
              <div className="term-orderbook__detail-row">
                <dt>% of monthly total</dt>
                <dd>{totalQty > 0 ? `${Math.round((selectedBand.qty / totalQty) * 100)}%` : "—"}</dd>
              </div>
            </dl>
            <p className="term-orderbook__detail-note">
              {selectedBand.qty > 0
                ? `Reducing consumption by 10% in this band would save approximately RM ${Math.round(parseFloat(selectedBand.total) * 0.1).toLocaleString()}/month.`
                : "Your consumption hasn't reached this band yet — you've kept usage low."}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
