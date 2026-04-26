import {
  Activity,
  ArrowRight,
  BarChart3,
  BellRing,
  Building2,
  CheckCircle2,
  CircuitBoard,
  Factory,
  Gauge,
  Leaf,
  LineChart,
  Lock,
  PlugZap,
  Radio,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Zap
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const energyTrend = [
  { time: "00:00", load: 48, forecast: 54 },
  { time: "03:00", load: 42, forecast: 47 },
  { time: "06:00", load: 68, forecast: 71 },
  { time: "09:00", load: 118, forecast: 122 },
  { time: "12:00", load: 142, forecast: 138 },
  { time: "15:00", load: 126, forecast: 132 },
  { time: "18:00", load: 96, forecast: 108 },
  { time: "21:00", load: 72, forecast: 79 }
];

const deviceLoad = [
  { name: "HVAC", value: 42, color: "#0EA5E9" },
  { name: "Lighting", value: 24, color: "#10B981" },
  { name: "Motors", value: 18, color: "#F97316" },
  { name: "Idle", value: 9, color: "#64748B" }
];

const outcomes = [
  { value: "18%", label: "average energy waste reduced" },
  { value: "42k", label: "device events analyzed per day" },
  { value: "12 min", label: "median fault detection window" }
];

const features = [
  {
    icon: Gauge,
    title: "Live load intelligence",
    text: "Track facility, line, circuit, and appliance consumption from one operational view."
  },
  {
    icon: Sparkles,
    title: "AI usage recommendations",
    text: "Surface avoidable peaks, idle equipment, tariff windows, and practical savings actions."
  },
  {
    icon: BellRing,
    title: "Anomaly alerts",
    text: "Detect sudden spikes, offline sensors, and threshold breaches before costs compound."
  },
  {
    icon: SlidersHorizontal,
    title: "Remote control readiness",
    text: "Prepare workflows for smart relays, scheduling, and safe device-level interventions."
  }
];

const workflow = [
  {
    icon: Radio,
    title: "Connect meters and sensors",
    text: "Ingest circuit, machine, and room-level telemetry through the hardware API."
  },
  {
    icon: LineChart,
    title: "Model demand patterns",
    text: "Compare real-time usage with forecast ranges and operating schedules."
  },
  {
    icon: CheckCircle2,
    title: "Act on verified savings",
    text: "Prioritize actions by cost, carbon impact, urgency, and affected equipment."
  }
];

const segments = [
  {
    icon: Factory,
    name: "Industrial facilities",
    detail: "Production-line visibility, peak demand control, and machine-level rankings."
  },
  {
    icon: Building2,
    name: "Commercial buildings",
    detail: "HVAC drift, lighting schedules, tenant zones, and daily cost accountability."
  },
  {
    icon: CircuitBoard,
    name: "Smart homes and labs",
    detail: "Circuit-level monitoring for residential pilots, offices, labs, and campuses."
  }
];

const planFeatures = [
  "Live dashboard and trend history",
  "Device breakdown and ranking",
  "Savings recommendations",
  "Notifications and threshold alerts",
  "Hardware API integration"
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-slate-950">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="mt-1 text-slate-600">
          <span className="font-semibold" style={{ color: item.color }}>
            {item.name}
          </span>
          {`: ${item.value} kW`}
        </p>
      ))}
    </div>
  );
}

function LogoMark() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
      <PlugZap size={21} aria-hidden="true" />
    </span>
  );
}

function SectionLabel({ children }) {
  return <p className="text-sm font-semibold uppercase text-sky-700">{children}</p>;
}

function PrimaryButton({ href, children }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-orange-500 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
    >
      {children}
      <ArrowRight size={17} aria-hidden="true" />
    </a>
  );
}

function SecondaryButton({ href, children }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:border-sky-300 hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
    >
      {children}
    </a>
  );
}

function MiniMetric({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-md ${tone}`}>
          <Icon size={16} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function ProductPreview() {
  return (
    <div
      className="w-full max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/80"
      aria-label="GridSense IQ product preview"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-950 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="text-sm font-semibold">GridSense Live Console</p>
            <p className="text-xs text-slate-300">Enterprise floor A - active monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
          <Activity size={14} aria-hidden="true" />
          <span className="hidden min-[430px]:inline">Streaming</span>
        </div>
      </div>

      <div className="grid gap-3 bg-sky-50 p-3 sm:grid-cols-3">
        <MiniMetric icon={Zap} label="Current load" value="96 kW" tone="bg-sky-100 text-sky-700" />
        <MiniMetric icon={Leaf} label="CO2 avoided" value="3.8 t" tone="bg-emerald-100 text-emerald-700" />
        <MiniMetric icon={ShieldCheck} label="Risk score" value="Low" tone="bg-orange-100 text-orange-700" />
      </div>

      <div className="grid gap-3 p-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(220px,0.75fr)]">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Demand vs forecast</p>
              <p className="text-xs text-slate-500">Today, 15-minute intervals</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" />
              Live load
              <span className="ml-2 h-2.5 w-2.5 rounded-sm bg-orange-500" />
              Forecast
            </div>
          </div>
          <div className="h-64 min-h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyTrend} margin={{ top: 8, right: 4, left: -26, bottom: 0 }}>
                <defs>
                  <linearGradient id="loadFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  name="Live load"
                  dataKey="load"
                  stroke="#0EA5E9"
                  strokeWidth={3}
                  fill="url(#loadFill)"
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  name="Forecast"
                  dataKey="forecast"
                  stroke="#F97316"
                  strokeWidth={2}
                  fill="transparent"
                  strokeDasharray="5 5"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Load split</p>
              <p className="text-xs text-slate-500">Top contributors</p>
            </div>
            <BarChart3 size={18} className="text-sky-700" aria-hidden="true" />
          </div>
          <div className="h-56 min-h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceLoad} layout="vertical" margin={{ top: 4, right: 18, left: 8, bottom: 4 }}>
                <CartesianGrid stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#475569", fontSize: 11 }}
                  width={60}
                />
                <Tooltip cursor={{ fill: "#F8FAFC" }} content={<ChartTooltip />} />
                <Bar dataKey="value" radius={[0, 5, 5, 0]} barSize={16} isAnimationActive={false}>
                  {deviceLoad.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
            Shift HVAC pre-cooling by 23 minutes to avoid the 3 PM tariff peak.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-sky-50 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8" aria-label="Primary">
          <a href="#top" className="flex min-w-0 cursor-pointer items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500">
            <LogoMark />
            <span className="truncate text-base font-semibold text-slate-950">GridSense IQ</span>
          </a>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a className="cursor-pointer transition-colors duration-200 hover:text-slate-950" href="#platform">
              Platform
            </a>
            <a className="cursor-pointer transition-colors duration-200 hover:text-slate-950" href="#workflow">
              Workflow
            </a>
            <a className="cursor-pointer transition-colors duration-200 hover:text-slate-950" href="#plans">
              Plans
            </a>
          </div>
          <a
            href="#demo"
            aria-label="View demo"
            className="inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-sky-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 min-[430px]:px-4"
          >
            <Zap size={16} aria-hidden="true" />
            <span className="hidden min-[430px]:inline">View demo</span>
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:px-8 lg:py-16">
          <div className="min-w-0">
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-800">
              <ShieldCheck size={16} aria-hidden="true" />
              Energy monitoring for real operations
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] text-slate-950 sm:text-6xl">
              GridSense IQ
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              A smart energy monitoring system that turns live meter, sensor, and device data into cost control, carbon insight,
              and actionable operating decisions.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href="#demo">Explore the live view</PrimaryButton>
              <SecondaryButton href="#platform">See platform features</SecondaryButton>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {outcomes.map((item) => (
                <div key={item.label} className="border-l-2 border-sky-500 pl-4">
                  <p className="text-2xl font-semibold text-slate-950">{item.value}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="demo" className="min-w-0 scroll-mt-24">
            <ProductPreview />
          </div>
        </section>

        <section id="platform" className="scroll-mt-24 border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <SectionLabel>Platform</SectionLabel>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                Built for teams that need energy data they can act on.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                GridSense IQ combines monitoring, analytics, recommendations, and control readiness in a compact operating layer.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => (
                <article key={feature.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-200 hover:border-sky-300">
                  <feature.icon className="text-sky-700" size={24} aria-hidden="true" />
                  <h3 className="mt-5 text-lg font-semibold text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="scroll-mt-24 bg-sky-50">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:px-8">
            <div>
              <SectionLabel>Workflow</SectionLabel>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                From raw consumption to verified savings.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-700">
                Energy teams get the full loop: telemetry, modelled demand, ranked actions, and a clear record of impact.
              </p>
              <div className="mt-8">
                <PrimaryButton href="#plans">Choose a monitoring plan</PrimaryButton>
              </div>
            </div>

            <div className="grid gap-4">
              {workflow.map((item, index) => (
                <article key={item.title} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[64px_minmax(0,1fr)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-950 text-white">
                    <item.icon size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-sky-700">Step {index + 1}</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
              <div>
                <SectionLabel>Use cases</SectionLabel>
                <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                  One monitoring layer across facilities, buildings, and pilot sites.
                </h2>
              </div>
              <div className="grid gap-4">
                {segments.map((segment) => (
                  <article key={segment.name} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <div className="flex gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-sky-700 ring-1 ring-slate-200">
                        <segment.icon size={22} aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">{segment.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{segment.detail}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="plans" className="scroll-mt-24 border-y border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.65fr)] lg:px-8 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-sky-300">Launch package</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                Deploy a monitoring pilot without waiting for a full energy audit cycle.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Start with the live dashboard, connect mock or physical devices through the API, and expand into automated controls
                as your operations team validates savings.
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-white p-5 text-slate-950 shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-sky-700">Monitoring Starter</p>
                  <p className="mt-1 text-3xl font-semibold">Pilot ready</p>
                </div>
                <Lock size={22} className="text-slate-500" aria-hidden="true" />
              </div>
              <ul className="mt-6 space-y-3">
                {planFeatures.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-slate-700">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <PrimaryButton href="#top">Start with GridSense IQ</PrimaryButton>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
