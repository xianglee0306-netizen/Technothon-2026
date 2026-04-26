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
          <div className="grid grid-cols-3 rounded-lg border border-slate-200 bg-slate-100 p-1">
            {ranges.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => onRangeChange(item)}
                className={`min-h-9 rounded-md px-3 text-xs font-semibold capitalize transition ${
                  range === item ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:bg-white/70"
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
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
            <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fill: "#475569", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={58}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                boxShadow: "0 10px 30px rgb(15 23 42 / 0.12)"
              }}
              formatter={(value) => [`${Number(value).toLocaleString()} kWh`, ""]}
            />
            <Legend verticalAlign="top" height={32} iconType="circle" />
            <Line
              type="monotone"
              name="Actual usage"
              dataKey="kwh"
              stroke="#0f766e"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              name="Expected baseline"
              dataKey="baseline"
              stroke="#f59e0b"
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
