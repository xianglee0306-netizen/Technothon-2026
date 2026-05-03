import { Brain, Cpu, Gauge, Radio, Server, Smartphone } from "lucide-react";

const stages = [
  {
    icon: Cpu,
    title: "Sensors",
    detail: "Smart plugs, current sensors, panel monitors"
  },
  {
    icon: Radio,
    title: "Gateway",
    detail: "ESP32 / Wi-Fi gateway streams telemetry"
  },
  {
    icon: Server,
    title: "Cloud",
    detail: "Time-series store + recommendation pipeline"
  },
  {
    icon: Brain,
    title: "AI Engine",
    detail: "Anomaly detection · scenario simulation"
  },
  {
    icon: Gauge,
    title: "Dashboard",
    detail: "Insight, alerts, savings, carbon impact"
  },
  {
    icon: Smartphone,
    title: "User",
    detail: "Acts on recommendations · approves automation"
  }
];

export default function ArchitectureDiagram() {
  return (
    <section className="architecture-diagram relative overflow-hidden rounded-2xl border border-cyan-300/22 bg-slate-900/70 p-5 sm:p-7">
      <div className="architecture-diagram__bg" aria-hidden="true" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/70">System architecture</p>
        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">From physical signal to user action</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
          Every kWh in the dashboard is anchored to a physical measurement. Hardware captures evidence, software turns it into insight, and AI recommends safe action.
        </p>
      </div>

      <div className="architecture-diagram__rail relative mt-7">
        <svg viewBox="0 0 800 30" className="architecture-diagram__line" aria-hidden="true" preserveAspectRatio="none">
          <defs>
            <linearGradient id="arch-grad" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.0" />
              <stop offset="20%" stopColor="#22d3ee" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.7" />
              <stop offset="80%" stopColor="#34d399" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="15" x2="800" y2="15" stroke="rgba(148,163,184,0.25)" strokeWidth="1.4" strokeDasharray="4 6" />
          <line x1="0" y1="15" x2="800" y2="15" stroke="url(#arch-grad)" strokeWidth="2.4" />
          <circle r="4.5" cx="0" cy="15" fill="#67e8f9">
            <animate attributeName="cx" from="0" to="800" dur="3.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.95;1" dur="3.6s" repeatCount="indefinite" />
          </circle>
          <circle r="3.2" cx="0" cy="15" fill="#a78bfa">
            <animate attributeName="cx" from="0" to="800" dur="3.6s" begin="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.95;1" dur="3.6s" begin="1.2s" repeatCount="indefinite" />
          </circle>
          <circle r="3.2" cx="0" cy="15" fill="#34d399">
            <animate attributeName="cx" from="0" to="800" dur="3.6s" begin="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.05;0.95;1" dur="3.6s" begin="2.4s" repeatCount="indefinite" />
          </circle>
        </svg>

        <div className="architecture-diagram__stages">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <article
                key={stage.title}
                className="architecture-stage"
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <span className="architecture-stage__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <p className="architecture-stage__title">{stage.title}</p>
                <p className="architecture-stage__detail">{stage.detail}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
