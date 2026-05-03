import { Activity } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { EmptyState, Panel, SectionHeader, SegmentedControl } from "./ui.jsx";

const ranges = ["hourly", "daily", "weekly", "monthly"];

function toFiniteNumber(value) {
  const parsed = Number(typeof value === "string" ? value.replace(/,/g, "") : value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeTrendData(trends, selectedRange) {
  const source = Array.isArray(trends?.data)
    ? trends.data
    : Array.isArray(trends?.[selectedRange])
      ? trends[selectedRange]
      : Array.isArray(trends)
        ? trends
        : [];

  return source
    .map((point, index) => {
      const kwh = toFiniteNumber(point?.kwh ?? point?.usageKwh ?? point?.currentKwh ?? point?.actual ?? point?.value ?? point?.energy);
      const baseline = toFiniteNumber(point?.baseline ?? point?.baselineKwh ?? point?.expected ?? point?.target ?? point?.forecast);

      return {
        ...point,
        label: String(point?.label ?? point?.time ?? point?.window ?? `Point ${index + 1}`),
        kwh: kwh ?? 0,
        baseline: baseline ?? kwh ?? 0
      };
    })
    .filter((point) => Number.isFinite(point.kwh) || Number.isFinite(point.baseline));
}

function smoothLinePath(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;

    const previous = points[index - 1];
    const midpointX = (previous.x + point.x) / 2;
    return `${path} C ${midpointX.toFixed(2)} ${previous.y.toFixed(2)} ${midpointX.toFixed(2)} ${point.y.toFixed(2)} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }, "");
}

const trendCopyByMode = {
  residential: { eyebrow: "Home circuit telemetry", title: "Home usage trend" },
  business: { eyebrow: "Premise telemetry", title: "Premise demand trend" },
  enterprise: { eyebrow: "Machine telemetry", title: "Facility demand trend" }
};

export default function EnergyTrendChart({ mode, range, trends, onRangeChange }) {
  const rawChartId = useId();
  const chartId = rawChartId.replace(/[^a-zA-Z0-9_-]/g, "");
  const trendCopy = trendCopyByMode[mode] || trendCopyByMode.residential;
  const chartTitle = trendCopy.title;
  const chartEyebrow = trendCopy.eyebrow;
  const chartData = useMemo(() => normalizeTrendData(trends, range), [range, trends]);
  const [activePoint, setActivePoint] = useState(null);
  const chartModel = useMemo(() => {
    const width = 760;
    const height = 260;
    const padding = { top: 20, right: 20, bottom: 42, left: 54 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(...chartData.flatMap((point) => [point.kwh, point.baseline]), 1);
    const yMax = Math.max(10, Math.ceil(maxValue * 1.14));
    const xFor = (index) => padding.left + (chartData.length <= 1 ? plotWidth / 2 : (index / (chartData.length - 1)) * plotWidth);
    const yFor = (value) => padding.top + plotHeight - (Number(value || 0) / yMax) * plotHeight;
    const actualPoints = chartData.map((point, index) => ({ ...point, x: xFor(index), y: yFor(point.kwh), index }));
    const baselinePoints = chartData.map((point, index) => ({ ...point, x: xFor(index), y: yFor(point.baseline), index }));
    const linePath = smoothLinePath;
    const areaPath = actualPoints.length
      ? `${linePath(actualPoints)} L ${actualPoints.at(-1).x.toFixed(2)} ${padding.top + plotHeight} L ${actualPoints[0].x.toFixed(2)} ${padding.top + plotHeight} Z`
      : "";
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const value = Math.round(yMax * ratio);
      return { value, y: yFor(value) };
    });

    return {
      width,
      height,
      padding,
      plotHeight,
      plotWidth,
      actualPoints,
      baselinePoints,
      actualPath: linePath(actualPoints),
      baselinePath: linePath(baselinePoints),
      areaPath,
      yTicks
    };
  }, [chartData]);

  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon={Activity}
        eyebrow={chartEyebrow}
        title={chartTitle}
        action={
          <SegmentedControl options={ranges} value={range} onChange={onRangeChange} label="Trend range" />
        }
      />

      {chartData.length ? (
        <div className="min-w-0 p-3 sm:p-5">
          <div className="hud-chart-shell hud-chart-grid relative h-[230px] min-h-[230px] min-w-0 overflow-hidden rounded-2xl border border-cyan-300/15 p-2 sm:h-[270px] sm:min-h-[270px] lg:h-[300px] lg:min-h-[300px]">
            <div className="absolute left-4 top-3 z-10 flex flex-wrap gap-3 text-xs font-semibold">
              <span className="inline-flex items-center gap-2 text-cyan-100">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                Actual usage
              </span>
              <span className="inline-flex items-center gap-2 text-amber-100">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.65)]" />
                Expected baseline
              </span>
            </div>
            <svg
              className="h-full w-full overflow-visible"
              viewBox={`0 0 ${chartModel.width} ${chartModel.height}`}
              preserveAspectRatio="none"
              role="img"
              aria-label={`${chartTitle} ${range} chart`}
              onMouseLeave={() => setActivePoint(null)}
            >
              <defs>
                <linearGradient id={`${chartId}-actualFill`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.34" />
                  <stop offset="58%" stopColor="#22d3ee" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.02" />
                </linearGradient>
                <filter id={`${chartId}-glow`} x="-20%" y="-50%" width="140%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feColorMatrix
                    in="blur"
                    type="matrix"
                    values="0 0 0 0 0.13 0 0 0 0 0.83 0 0 0 0 0.93 0 0 0 0.72 0"
                    result="glow"
                  />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {chartModel.yTicks.map((tick) => (
                <g key={`${tick.value}-${tick.y}`}>
                  <line
                    x1={chartModel.padding.left}
                    x2={chartModel.padding.left + chartModel.plotWidth}
                    y1={tick.y}
                    y2={tick.y}
                    stroke="rgba(148,163,184,0.16)"
                    strokeDasharray="4 4"
                    vectorEffect="non-scaling-stroke"
                  />
                  <text x={chartModel.padding.left - 12} y={tick.y + 4} textAnchor="end" fill="#8dddeb" fontSize="11">
                    {tick.value.toLocaleString()}
                  </text>
                </g>
              ))}

              <line
                x1={chartModel.padding.left}
                x2={chartModel.padding.left}
                y1={chartModel.padding.top}
                y2={chartModel.padding.top + chartModel.plotHeight}
                stroke="rgba(103,232,249,0.24)"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={chartModel.padding.left}
                x2={chartModel.padding.left + chartModel.plotWidth}
                y1={chartModel.padding.top + chartModel.plotHeight}
                y2={chartModel.padding.top + chartModel.plotHeight}
                stroke="rgba(103,232,249,0.24)"
                vectorEffect="non-scaling-stroke"
              />

              <path className="energy-area" d={chartModel.areaPath} fill={`url(#${chartId}-actualFill)`} />
              <path
                className="energy-line energy-line--actual"
                d={chartModel.actualPath}
                fill="none"
                filter={`url(#${chartId}-glow)`}
                pathLength="1"
                stroke="#22d3ee"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3.5"
                vectorEffect="non-scaling-stroke"
              />
              <path
                className="energy-line energy-line--baseline"
                d={chartModel.baselinePath}
                fill="none"
                stroke="#f59e0b"
                strokeDasharray="7 6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
              />

              {chartModel.actualPoints.map((point) => (
                <g key={`${point.label}-${point.index}`}>
                  <line
                    x1={point.x}
                    x2={point.x}
                    y1={chartModel.padding.top}
                    y2={chartModel.padding.top + chartModel.plotHeight}
                    stroke="transparent"
                    strokeWidth={Math.max(24, chartModel.plotWidth / Math.max(chartModel.actualPoints.length, 1))}
                    onMouseEnter={() => setActivePoint(point)}
                  />
                  <circle
                    className={activePoint?.index === point.index ? "energy-dot-active" : ""}
                    cx={point.x}
                    cy={point.y}
                    r={activePoint?.index === point.index ? 5 : 3.5}
                    fill="#020617"
                    stroke="#67e8f9"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              ))}

              {chartModel.actualPoints.map((point, index) => {
                const showLabel = chartModel.actualPoints.length <= 8 || index % Math.ceil(chartModel.actualPoints.length / 6) === 0 || index === chartModel.actualPoints.length - 1;
                return showLabel ? (
                  <text key={`label-${point.label}-${index}`} x={point.x} y={chartModel.height - 12} textAnchor="middle" fill="#8dddeb" fontSize="11">
                    {point.label}
                  </text>
                ) : null;
              })}
            </svg>

            {activePoint ? (
              <div
                className="hud-card pointer-events-none absolute z-20 rounded-xl border border-cyan-300/20 bg-slate-950/95 px-3 py-2 text-xs shadow-2xl backdrop-blur-xl"
                style={{
                  left: `${Math.min(78, Math.max(12, (activePoint.x / chartModel.width) * 100))}%`,
                  top: `${Math.min(70, Math.max(18, (activePoint.y / chartModel.height) * 100))}%`
                }}
              >
                <p className="font-semibold text-white">{activePoint.label}</p>
                <p className="mt-1 text-cyan-100">Actual: {Number(activePoint.kwh).toLocaleString()} kWh</p>
                <p className="mt-1 text-amber-100">Baseline: {Number(activePoint.baseline).toLocaleString()} kWh</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-5">
          <EmptyState title="No telemetry data for this range" description="Switch ranges or sync the dashboard to regenerate the simulated demand trend." />
        </div>
      )}
    </Panel>
  );
}
