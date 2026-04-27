import { Activity } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Panel, SectionHeader } from "./ui.jsx";

const ranges = ["daily", "weekly", "monthly"];

export default function EnergyTrendChart({ mode, range, trends, onRangeChange }) {
  const chartTitle = mode === "enterprise" ? "Facility demand trend" : "Circuit usage trend";
  const chartEyebrow = mode === "enterprise" ? "Machine telemetry" : "Circuit telemetry";

  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon={Activity}
        eyebrow={chartEyebrow}
        title={chartTitle}
        action={
          <div className="grid grid-cols-3 rounded-xl border border-white/10 bg-white/5 p-1">
            {ranges.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => onRangeChange(item)}
                className={`min-h-9 rounded-lg px-3 text-xs font-semibold capitalize transition ${
                  range === item ? "bg-cyan-300 text-slate-950 shadow-[0_8px_24px_rgba(34,211,238,0.18)]" : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        }
      />

      <div className="h-[300px] px-2 py-4 sm:h-[340px] sm:px-5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trends?.data || []} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.16)" strokeDasharray="4 4" />
            <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={58}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "12px",
                background: "rgba(15, 23, 42, 0.94)",
                color: "#e2e8f0",
                boxShadow: "0 18px 50px rgb(2 6 23 / 0.35)"
              }}
              formatter={(value) => [`${Number(value).toLocaleString()} kWh`, ""]}
            />
            <Legend verticalAlign="top" height={32} iconType="circle" />
            <Line
              type="monotone"
              name="Actual usage"
              dataKey="kwh"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              name="Expected baseline"
              dataKey="baseline"
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="6 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
