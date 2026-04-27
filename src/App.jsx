import {
  AlertTriangle,
  Bell,
  Bot,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  FileText,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  PenLine,
  Plus,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  WalletCards,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { controlDevice, getDashboard, getMeta, saveSettings } from "./api.js";
import ControlPanel from "./components/ControlPanel.jsx";
import CostAnalysis from "./components/CostAnalysis.jsx";
import DeviceBreakdown from "./components/DeviceBreakdown.jsx";
import EnergyTrendChart from "./components/EnergyTrendChart.jsx";
import HighConsumptionRanking from "./components/HighConsumptionRanking.jsx";
import NotificationsPanel from "./components/NotificationsPanel.jsx";
import RecommendationPanel from "./components/RecommendationPanel.jsx";
import SummaryCards, { summaryCardOptions } from "./components/SummaryCards.jsx";
import SustainabilityMetrics from "./components/SustainabilityMetrics.jsx";
import { formatCurrency, formatEnergy, Panel, SectionHeader } from "./components/ui.jsx";

const appName = "GridSenseIQ";
const tagline = "AI-Powered Energy Intelligence for Smarter Buildings";

const storageKeys = {
  user: "gridsenseiq.demoUser",
  profiles: "gridsenseiq.energyProfiles",
  lastProfileId: "gridsenseiq.lastProfileId",
  cardOrder: "gridsenseiq.cardOrder",
  settingsByProfile: "gridsenseiq.settingsByProfile"
};

const defaultCardOrder = summaryCardOptions.map((item) => item.key);

const sections = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "insights", label: "Insights", icon: Sparkles },
  { id: "accounts", label: "Accounts", icon: WalletCards },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings }
];

const initialMeta = {
  selectedName: appName,
  tagline,
  modes: {
    enterprise: {
      label: "Enterprise / Industrial",
      shortLabel: "Enterprise",
      description: "Device, machine, department, and production-line analytics for facility and energy teams."
    },
    residential: {
      label: "Residential / SME",
      shortLabel: "Residential",
      description: "Circuit-level monitoring for homes, retail units, offices, cafes, and small businesses."
    }
  }
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createDefaultProfiles() {
  return [
    {
      id: "enterprise-greentech",
      type: "enterprise",
      nickname: "TNB Enterprise Account",
      accountHolderName: "GreenTech Manufacturing Sdn. Bhd.",
      tnbAccountNumber: "2208 5412 9981",
      premiseAddress: "Bayan Lepas Industrial Park, Penang, Malaysia",
      premiseType: "Industrial plant",
      monthlyBillEstimate: 263150,
      tariffRate: 0.5,
      companyName: "GreenTech Manufacturing Sdn. Bhd.",
      industryType: "Manufacturing",
      monitoredZones: 8,
      operatingHours: "8:00 AM - 6:00 PM"
    },
    {
      id: "residential-demo",
      type: "residential",
      nickname: "Home + SME Office",
      accountHolderName: "Demo Home Owner",
      tnbAccountNumber: "1104 7822 5036",
      premiseAddress: "Mont Kiara, Kuala Lumpur, Malaysia",
      premiseType: "Residential / SME office",
      monthlyBillEstimate: 680,
      tariffRate: 0.57
    }
  ];
}

function emptyProfile(type = "enterprise", user = {}) {
  const enterprise = type === "enterprise";

  return {
    id: "",
    type,
    nickname: enterprise ? "TNB Enterprise Account" : "Home Energy Account",
    accountHolderName: user.organization || user.fullName || "",
    tnbAccountNumber: "",
    premiseAddress: enterprise ? "Penang, Malaysia" : "Kuala Lumpur, Malaysia",
    premiseType: enterprise ? "Industrial plant" : "Residential / SME office",
    monthlyBillEstimate: enterprise ? 260000 : 650,
    tariffRate: enterprise ? 0.5 : 0.57,
    companyName: enterprise ? user.organization || "GreenTech Manufacturing Sdn. Bhd." : "",
    industryType: enterprise ? "Manufacturing" : "",
    monitoredZones: enterprise ? 8 : "",
    operatingHours: enterprise ? "8:00 AM - 6:00 PM" : ""
  };
}

function maskAccount(value = "") {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Not connected";
  return `**** **** ${digits.slice(-4)}`;
}

function profileLabel(profile, meta) {
  const modeLabel = meta?.modes?.[profile?.type]?.label || "Energy Profile";
  return `${profile?.nickname || "Connected account"} - ${modeLabel}`;
}

function applyLocalSettings(dashboard, profile, overrides = {}) {
  if (!dashboard || !profile) return dashboard;

  const settings = {
    ...dashboard.settings,
    ...overrides,
    currency: "MYR",
    tariffRate: Number(overrides.tariffRate ?? profile.tariffRate ?? dashboard.settings?.tariffRate ?? 0)
  };
  const summary = {
    ...dashboard.summary,
    currency: "MYR",
    tariffRate: settings.tariffRate,
    estimatedCost: Number((dashboard.summary.totalEnergyKwh * settings.tariffRate).toFixed(2)),
    projectedMonthlyCost: Number((dashboard.summary.projectedMonthlyKwh * settings.tariffRate).toFixed(2)),
    potentialSavingsCost: Number((dashboard.summary.potentialSavingsKwh * settings.tariffRate).toFixed(2))
  };
  const total = dashboard.devices?.reduce((sum, device) => sum + device.usageKwh, 0) || 1;
  const devices = (dashboard.devices || []).map((device) => ({
    ...device,
    costContribution: Number((device.usageKwh * settings.tariffRate).toFixed(2)),
    sharePercent: Number(((device.usageKwh / total) * 100).toFixed(1))
  }));

  return { ...dashboard, settings, summary, devices };
}

function AuthPanel({ onLogin, onRegister }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    organization: "",
    role: "Facility Manager"
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (tab === "register") {
      onRegister(form);
      return;
    }

    onLogin(form);
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/75 shadow-[0_30px_110px_rgba(2,6,23,0.6)] backdrop-blur-2xl">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-white/10 bg-cyan-300/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/15 text-cyan-100">
                <Cpu size={24} aria-hidden="true" />
              </span>
              <div>
                <h1 className="text-2xl font-semibold text-white">{appName}</h1>
                <p className="text-sm text-cyan-100/80">{tagline}</p>
              </div>
            </div>

            <div className="mt-10 grid gap-3">
              {[
                "Enterprise-first monitoring for industrial zones and smart buildings.",
                "Demo login uses localStorage, mock telemetry, and realistic Malaysian energy data.",
                "Built for a clean judge walkthrough from account connection to AI recommendation."
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-slate-200">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={18} aria-hidden="true" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="p-6 sm:p-8">
            <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-white/5 p-1">
              {["login", "register"].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setTab(item)}
                  className={`min-h-11 rounded-xl text-sm font-semibold capitalize transition-colors duration-200 ${
                    tab === item ? "bg-cyan-300 text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4">
              {tab === "register" ? (
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-200">Full name</span>
                  <input
                    required
                    value={form.fullName}
                    onChange={(event) => update("fullName", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
                  />
                </label>
              ) : null}

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Email</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
                  placeholder="demo@gridsenseiq.my"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Password</span>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
                  placeholder="Any password works"
                />
              </label>

              {tab === "register" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-200">Organization / Company</span>
                    <input
                      value={form.organization}
                      onChange={(event) => update("organization", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
                      placeholder="Optional"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-200">User role</span>
                    <select
                      value={form.role}
                      onChange={(event) => update("role", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
                    >
                      <option>Facility Manager</option>
                      <option>Energy Manager</option>
                      <option>Business Owner</option>
                      <option>Home Owner</option>
                    </select>
                  </label>
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              <UserRound size={18} aria-hidden="true" />
              {tab === "register" ? "Create demo account" : "Enter dashboard"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
              Demo only: no real authentication, no TNB validation, and data stays in this browser.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

function ProfileForm({ user, initialProfile, onCancel, onSave, onboarding = false }) {
  const [form, setForm] = useState(initialProfile || emptyProfile("enterprise", user));
  const isEnterprise = form.type === "enterprise";

  useEffect(() => {
    setForm(initialProfile || emptyProfile("enterprise", user));
  }, [initialProfile, user]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleTypeChange(type) {
    setForm((current) => ({ ...emptyProfile(type, user), id: current.id }));
  }

  function submit(event) {
    event.preventDefault();
    onSave({
      ...form,
      id: form.id || `${form.type}-${Date.now()}`,
      monthlyBillEstimate: Number(form.monthlyBillEstimate || 0),
      tariffRate: Number(form.tariffRate || 0),
      monitoredZones: isEnterprise ? Number(form.monitoredZones || 0) : ""
    });
  }

  function useDemoEnterprise() {
    const [enterpriseProfile] = createDefaultProfiles();
    setForm({ ...enterpriseProfile, id: form.id });
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-slate-200">Profile type</span>
          <select
            value={form.type}
            onChange={(event) => handleTypeChange(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
          >
            <option value="enterprise">Enterprise / Industrial</option>
            <option value="residential">Residential / SME</option>
          </select>
        </label>

        {[
          ["nickname", "Account nickname", "TNB Enterprise Account"],
          ["accountHolderName", "Account holder name", "GreenTech Manufacturing Sdn. Bhd."],
          ["tnbAccountNumber", "TNB account number", "2208 5412 9981"],
          ["premiseType", "Premise type", "Industrial plant"],
          ["monthlyBillEstimate", "Monthly bill estimate (RM)", "263150"],
          ["tariffRate", "Electricity tariff rate (RM/kWh)", "0.50"]
        ].map(([field, label, placeholder]) => (
          <label key={field} className="space-y-2">
            <span className="text-sm font-semibold text-slate-200">{label}</span>
            <input
              required={field !== "tnbAccountNumber"}
              type={field === "monthlyBillEstimate" || field === "tariffRate" ? "number" : "text"}
              step={field === "tariffRate" ? "0.01" : "1"}
              value={form[field]}
              onChange={(event) => update(field, event.target.value)}
              placeholder={placeholder}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
            />
          </label>
        ))}

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-slate-200">Premise address</span>
          <textarea
            rows={3}
            value={form.premiseAddress}
            onChange={(event) => update("premiseAddress", event.target.value)}
            className="w-full resize-y rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
          />
        </label>

        {isEnterprise ? (
          <>
            {[
              ["companyName", "Company name", "GreenTech Manufacturing Sdn. Bhd."],
              ["industryType", "Industry type", "Manufacturing"],
              ["monitoredZones", "Number of monitored zones", "8"],
              ["operatingHours", "Main operating hours", "8:00 AM - 6:00 PM"]
            ].map(([field, label, placeholder]) => (
              <label key={field} className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">{label}</span>
                <input
                  required
                  type={field === "monitoredZones" ? "number" : "text"}
                  value={form[field]}
                  onChange={(event) => update(field, event.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
                />
              </label>
            ))}
          </>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
        {onboarding ? (
          <button
            type="button"
            onClick={useDemoEnterprise}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 text-sm font-semibold text-emerald-100 transition-colors duration-200 hover:bg-emerald-400/15"
          >
            <Building2 size={17} aria-hidden="true" />
            Use GreenTech demo
          </button>
        ) : (
          <span />
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 px-4 text-sm font-semibold text-slate-200 transition-colors duration-200 hover:bg-white/10"
            >
              Cancel
            </button>
          ) : null}
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-cyan-200"
          >
            <Save size={17} aria-hidden="true" />
            {onboarding ? "Connect profile" : "Save account"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Onboarding({ user, onSave }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="w-full max-w-4xl rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_110px_rgba(2,6,23,0.6)] backdrop-blur-2xl sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/75">First-time setup</p>
          <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Connect your first energy profile</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            GridSenseIQ uses this account profile to personalize dashboard data, tariff simulation, alerts, and AI recommendations.
          </p>
        </div>
        <ProfileForm user={user} onboarding onSave={onSave} />
      </section>
    </main>
  );
}

function TopBar({ meta, profile, notifications, onMenu, onNotifications }) {
  const alertCount = (notifications || []).filter((item) => item.severity === "Critical" || item.severity === "High").length;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenu}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition-colors duration-200 hover:bg-white/10"
            aria-label="Open navigation"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
            <Cpu size={21} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-white">{meta?.selectedName || appName}</p>
            <p className="truncate text-xs text-slate-400">{profile?.nickname || "No profile selected"}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNotifications}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition-colors duration-200 hover:bg-white/10"
          aria-label="Open notifications"
        >
          <Bell size={19} aria-hidden="true" />
          {alertCount ? (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-400 px-1 text-[11px] font-bold text-slate-950">
              {alertCount}
            </span>
          ) : null}
        </button>
      </div>
    </header>
  );
}

function Sidebar({ open, section, profiles, selectedProfileId, meta, onClose, onSectionChange, onProfileChange, onLogout }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[min(22rem,88vw)] transform flex-col border-r border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-2xl transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
              <Cpu size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-white">{appName}</p>
              <p className="text-xs text-slate-400">Smart energy demo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition-colors duration-200 hover:bg-white/10"
            aria-label="Close navigation"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 p-4" aria-label="Main navigation">
          {sections.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  onClose();
                }}
                className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold transition-colors duration-200 ${
                  active
                    ? "bg-cyan-300 text-slate-950"
                    : "border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/70">Current Profile</span>
            <select
              value={selectedProfileId}
              onChange={(event) => onProfileChange(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profileLabel(profile, meta)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={onLogout}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 text-sm font-semibold text-slate-200 transition-colors duration-200 hover:bg-white/10"
          >
            <LogOut size={17} aria-hidden="true" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

function LoadingDashboard() {
  return (
    <div className="grid min-h-[55vh] place-items-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/75 p-6 text-center shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <RefreshCw className="mx-auto animate-spin text-cyan-200" size={28} aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold text-white">Loading energy intelligence</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">Preparing mock telemetry and profile-specific recommendations.</p>
      </div>
    </div>
  );
}

function ErrorPanel({ message, onRetry }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 p-4 text-amber-100">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
            <p className="text-sm leading-6">{message}</p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-amber-200"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniUsageChart({ trends }) {
  return (
    <Panel className="overflow-hidden">
      <SectionHeader icon={Gauge} eyebrow="Mini trend" title="Usage trend today" />
      <div className="h-[250px] px-2 py-4 sm:px-5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trends?.data || []} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="usageGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" strokeDasharray="4 4" />
            <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} width={48} />
            <Tooltip
              contentStyle={{
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "12px",
                background: "rgba(15, 23, 42, 0.94)",
                color: "#e2e8f0"
              }}
              formatter={(value) => [`${Number(value).toLocaleString()} kWh`, "Usage"]}
            />
            <Area type="monotone" dataKey="kwh" stroke="#22d3ee" strokeWidth={3} fill="url(#usageGlow)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function AISummaryCard({ mode, dashboard, profile }) {
  const topRecommendation = dashboard?.recommendations?.[0];
  const isEnterprise = mode === "enterprise";

  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon={Bot}
        eyebrow={isEnterprise ? "AI operations summary" : "AI home energy summary"}
        title={isEnterprise ? "Facility action brief" : "Savings brief"}
      />
      <div className="space-y-4 p-4 sm:p-5">
        <p className="text-sm leading-6 text-slate-300">
          {isEnterprise
            ? `${profile?.companyName || profile?.accountHolderName} is using ${formatEnergy(
                dashboard?.summary?.totalEnergyKwh || 0
              )} today. The highest priority action is abnormal compressor and after-hours load review.`
            : `This profile is using ${formatEnergy(
                dashboard?.summary?.totalEnergyKwh || 0
              )} today. Cooling and evening appliance loads are the easiest savings opportunities.`}
        </p>
        {topRecommendation ? (
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-sm font-semibold text-cyan-100">{topRecommendation.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{topRecommendation.message}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/70">{topRecommendation.impact}</p>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function CustomizeDashboardModal({ open, order, onClose, onSave }) {
  const [draft, setDraft] = useState(order);

  useEffect(() => {
    if (open) setDraft(order);
  }, [open, order]);

  if (!open) return null;

  function move(index, direction) {
    const next = [...draft];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setDraft(next);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-slate-950/75 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4">
      <section className="w-full rounded-t-3xl border border-white/10 bg-slate-900/95 shadow-2xl sm:max-w-lg sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/70">Dashboard layout</p>
            <h2 className="font-semibold text-white">Customize summary card order</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/10"
            aria-label="Close customization"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-3 p-4">
          {draft.map((key, index) => {
            const option = summaryCardOptions.find((item) => item.key === key);
            return (
              <div key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <span className="text-sm font-semibold text-white">{option?.label}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-200 transition hover:bg-white/10"
                    aria-label={`Move ${option?.label} up`}
                  >
                    <ChevronUp size={17} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-200 transition hover:bg-white/10"
                    aria-label={`Move ${option?.label} down`}
                  >
                    <ChevronDown size={17} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-3 border-t border-white/10 p-4">
          <button type="button" onClick={onClose} className="min-h-11 rounded-2xl border border-white/10 px-4 text-sm font-semibold text-slate-200 hover:bg-white/10">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="min-h-11 rounded-2xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950 hover:bg-cyan-200"
          >
            Save order
          </button>
        </div>
      </section>
    </div>
  );
}

function DashboardSection({ user, mode, profile, dashboard, cardOrder, activeAlerts, onCustomize }) {
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_20px_70px_rgba(2,6,23,0.32)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/75">
              {mode === "enterprise" ? "Enterprise / Industrial" : "Residential / SME"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              Welcome{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}.
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              {mode === "enterprise"
                ? `${profile.companyName || profile.accountHolderName} is connected with ${profile.monitoredZones || 8} monitored zones in ${profile.premiseAddress}.`
                : `${profile.nickname} is connected for daily usage reminders, cost tracking, and savings suggestions.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onCustomize}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-100 transition-colors duration-200 hover:bg-white/10"
          >
            <SlidersHorizontal size={17} aria-hidden="true" />
            Customize Dashboard
          </button>
        </div>
      </section>

      <SummaryCards summary={dashboard.summary} activeAlerts={activeAlerts} cardOrder={cardOrder} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <AISummaryCard mode={mode} dashboard={dashboard} profile={profile} />
        <MiniUsageChart trends={dashboard.trends} />
      </div>
    </div>
  );
}

function InsightsSection({ mode, range, dashboard, controlMessage, onRangeChange, onControl }) {
  return (
    <div className="space-y-5">
      <EnergyTrendChart mode={mode} range={range} trends={dashboard.trends} onRangeChange={onRangeChange} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
        <DeviceBreakdown mode={mode} devices={dashboard.devices} currency={dashboard.summary.currency} />
        <HighConsumptionRanking devices={dashboard.devices} currency={dashboard.summary.currency} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <RecommendationPanel mode={mode} recommendations={dashboard.recommendations} />
        <CostAnalysis summary={dashboard.summary} settings={dashboard.settings} />
      </div>
      <ControlPanel mode={mode} devices={dashboard.devices} settings={dashboard.settings} controlMessage={controlMessage} onControl={onControl} />
    </div>
  );
}

function AccountsSection({ profiles, selectedProfileId, meta, onSelect, onAdd, onEdit }) {
  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/75">Connected accounts</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Energy profiles</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">Manage local demo profiles, TNB account details, tariff assumptions, and premise information.</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          <Plus size={17} aria-hidden="true" />
          Add profile
        </button>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {profiles.map((profile) => {
          const active = profile.id === selectedProfileId;
          const modeLabel = meta?.modes?.[profile.type]?.label;

          return (
            <article key={profile.id} className={`rounded-3xl border p-5 ${active ? "border-cyan-300/35 bg-cyan-300/10" : "border-white/10 bg-slate-900/70"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/70">{modeLabel}</p>
                  <h2 className="mt-2 text-lg font-semibold text-white">{profile.nickname}</h2>
                  <p className="mt-1 text-sm text-slate-300">{profile.accountHolderName}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                  {active ? "Current" : "Connected"}
                </span>
              </div>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["TNB account", maskAccount(profile.tnbAccountNumber)],
                  ["Premise type", profile.premiseType],
                  ["Tariff", `${Number(profile.tariffRate).toFixed(2)} RM/kWh`],
                  ["Monthly bill", formatCurrency(profile.monthlyBillEstimate || 0, "MYR")],
                  ["Address", profile.premiseAddress],
                  ["Operating hours", profile.operatingHours || "Not set"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold text-white">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => onSelect(profile.id)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-white/10 px-4 text-sm font-semibold text-slate-100 transition-colors duration-200 hover:bg-white/10"
                >
                  Switch to this profile
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(profile)}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/15"
                >
                  <PenLine size={17} aria-hidden="true" />
                  Edit details
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ReportsSection({ mode, dashboard }) {
  const rows = [
    ["Estimated monthly cost", formatCurrency(dashboard.summary.projectedMonthlyCost, "MYR")],
    ["Potential savings", formatCurrency(dashboard.summary.potentialSavingsCost, "MYR")],
    ["Carbon emission today", `${Math.round(dashboard.summary.carbonKg).toLocaleString()} kg CO2e`],
    ["Projected monthly usage", formatEnergy(dashboard.summary.projectedMonthlyKwh)]
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/75">Reports</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Bill, usage, savings, and carbon history</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">Demo reporting is generated from mock energy telemetry for a competition walkthrough.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {rows.map(([label, value]) => (
          <article key={label} className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
            <p className="mt-3 text-xl font-semibold text-white">{value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <SustainabilityMetrics summary={dashboard.summary} settings={dashboard.settings} />
        <Panel className="overflow-hidden">
          <SectionHeader icon={FileText} eyebrow="Demo export" title={`${mode === "enterprise" ? "Enterprise" : "Residential"} report package`} />
          <div className="space-y-3 p-4 sm:p-5">
            {["Bill history", "Energy usage history", "Estimated monthly cost", "Potential savings", "Carbon emission summary"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                <span className="text-sm font-semibold text-white">{item}</span>
                <CheckCircle2 className="text-emerald-300" size={18} aria-hidden="true" />
              </div>
            ))}
            <button
              type="button"
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              <FileText size={17} aria-hidden="true" />
              Export report
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function SettingsSection({ mode, settings, summary, onSave }) {
  const [form, setForm] = useState(settings || {});
  const isEnterprise = mode === "enterprise";
  const target = Number(form.energySavingTarget || 0);
  const progress = Math.min(Math.round((summary?.potentialSavingsKwh / Math.max(summary?.totalEnergyKwh || 1, 1)) * 100), 100);

  useEffect(() => {
    setForm(settings || {});
  }, [settings]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function listToText(items = []) {
    return items.join("\n");
  }

  function textToList(value = "") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function submit(event) {
    event.preventDefault();
    onSave({
      ...form,
      tariffRate: Number(form.tariffRate),
      energySavingTarget: Number(form.energySavingTarget),
      morningNotificationTime: form.morningNotificationTime,
      nightNotificationTime: form.nightNotificationTime,
      notificationTime: form.nightNotificationTime,
      automationPreference: form.automationPreference,
      categories: textToList(form.categoriesText ?? listToText(form.categories)),
      zones: textToList(form.zonesText ?? listToText(form.zones))
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/75">Settings</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Local demo customization</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">These settings are stored in localStorage and update the dashboard immediately.</p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.55fr)]">
        <Panel className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Tariff rate (RM/kWh)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.tariffRate ?? ""}
                onChange={(event) => update("tariffRate", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Energy-saving target (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={form.energySavingTarget ?? ""}
                onChange={(event) => update("energySavingTarget", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Morning notification time</span>
              <input
                type="time"
                value={form.morningNotificationTime ?? "08:00"}
                onChange={(event) => update("morningNotificationTime", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Night notification time</span>
              <input
                type="time"
                value={form.nightNotificationTime ?? "21:30"}
                onChange={(event) => update("nightNotificationTime", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-200">AI automation preference</span>
              <select
                value={form.automationPreference ?? "Suggest Only"}
                onChange={(event) => update("automationPreference", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
              >
                <option>Off</option>
                <option>Suggest Only</option>
                <option>Auto-Control Simulation</option>
              </select>
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold text-slate-200">{isEnterprise ? "Device zones" : "Device categories"}</span>
              <textarea
                rows={6}
                value={form.categoriesText ?? listToText(form.categories)}
                onChange={(event) => update("categoriesText", event.target.value)}
                className="w-full resize-y rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 sm:w-auto"
          >
            <Save size={17} aria-hidden="true" />
            Save settings
          </button>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-300" size={22} aria-hidden="true" />
            <div>
              <p className="font-semibold text-white">Saving target progress</p>
              <p className="text-sm text-slate-400">{progress}% simulated progress toward {target}% target</p>
            </div>
          </div>
          <div className="mt-4 h-3 rounded-full bg-slate-800">
            <div className="h-3 rounded-full bg-cyan-300" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Estimated cost updates from the RM/kWh tariff. Notification times drive the demo reminder messages.
          </p>
        </Panel>
      </div>
    </form>
  );
}

function NotificationsDrawer({ open, mode, notifications, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] flex justify-end bg-slate-950/70 backdrop-blur-sm" onClick={onClose}>
      <aside className="h-full w-[min(25rem,92vw)] overflow-y-auto border-l border-white/10 bg-slate-950/95 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/70">Notifications</p>
            <h2 className="font-semibold text-white">Alerts and reminders</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/10"
            aria-label="Close notifications"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <NotificationsPanel mode={mode} notifications={notifications} />
      </aside>
    </div>
  );
}

function ProfileModal({ user, profile, onClose, onSave }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-slate-950/75 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4">
      <section className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-slate-900/95 p-5 shadow-2xl sm:max-w-3xl sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200/70">Account connection</p>
            <h2 className="text-lg font-semibold text-white">{profile ? "Edit profile" : "Add energy profile"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/10"
            aria-label="Close profile form"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <ProfileForm user={user} initialProfile={profile || emptyProfile("enterprise", user)} onCancel={onClose} onSave={onSave} />
      </section>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState(() => readStorage(storageKeys.profiles, []));
  const [selectedProfileId, setSelectedProfileId] = useState(() => localStorage.getItem(storageKeys.lastProfileId) || "");
  const [section, setSection] = useState("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileModal, setProfileModal] = useState(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [cardOrder, setCardOrder] = useState(() => readStorage(storageKeys.cardOrder, defaultCardOrder));
  const [settingsByProfile, setSettingsByProfile] = useState(() => readStorage(storageKeys.settingsByProfile, {}));
  const [range, setRange] = useState("hourly");
  const [meta, setMeta] = useState(initialMeta);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [controlMessage, setControlMessage] = useState("");

  const selectedProfile = useMemo(() => {
    if (!profiles.length) return null;
    return profiles.find((profile) => profile.id === selectedProfileId) || profiles.find((profile) => profile.type === "enterprise") || profiles[0];
  }, [profiles, selectedProfileId]);
  const mode = selectedProfile?.type || "enterprise";
  const effectiveDashboard = useMemo(
    () => applyLocalSettings(dashboard, selectedProfile, settingsByProfile[selectedProfile?.id] || {}),
    [dashboard, selectedProfile, settingsByProfile]
  );
  const activeAlerts = useMemo(
    () => (effectiveDashboard?.notifications || []).filter((item) => item.severity === "Critical" || item.severity === "High").length,
    [effectiveDashboard?.notifications]
  );

  useEffect(() => {
    writeStorage(storageKeys.profiles, profiles);
  }, [profiles]);

  useEffect(() => {
    if (selectedProfile?.id) {
      localStorage.setItem(storageKeys.lastProfileId, selectedProfile.id);
    }
  }, [selectedProfile?.id]);

  useEffect(() => {
    writeStorage(storageKeys.settingsByProfile, settingsByProfile);
  }, [settingsByProfile]);

  useEffect(() => {
    if (user && selectedProfile) {
      loadDashboard(selectedProfile.type, range);
    }
  }, [user, selectedProfile?.type, range]);

  async function loadDashboard(nextMode = mode, nextRange = range) {
    setLoading(true);
    setError("");
    try {
      const [metaResponse, dashboardResponse] = await Promise.all([getMeta(), getDashboard(nextMode, nextRange)]);
      setMeta({ ...initialMeta, ...metaResponse });
      setDashboard(dashboardResponse);
    } catch (loadError) {
      setError(loadError.message || "Backend unavailable. The frontend keeps using local demo data when possible.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(form) {
    const storedUser = readStorage(storageKeys.user, null);
    const demoUser = storedUser || {
      fullName: "Demo Facility Manager",
      email: form.email,
      organization: "GreenTech Manufacturing Sdn. Bhd.",
      role: "Facility Manager"
    };
    const existingProfiles = readStorage(storageKeys.profiles, []);
    const nextProfiles = existingProfiles.length ? existingProfiles : createDefaultProfiles();

    writeStorage(storageKeys.user, demoUser);
    writeStorage(storageKeys.profiles, nextProfiles);
    setUser(demoUser);
    setProfiles(nextProfiles);
    setSelectedProfileId(localStorage.getItem(storageKeys.lastProfileId) || nextProfiles[0].id);
  }

  function handleRegister(form) {
    const demoUser = {
      fullName: form.fullName,
      email: form.email,
      organization: form.organization,
      role: form.role
    };
    writeStorage(storageKeys.user, demoUser);
    writeStorage(storageKeys.profiles, []);
    localStorage.removeItem(storageKeys.lastProfileId);
    setUser(demoUser);
    setProfiles([]);
    setSelectedProfileId("");
  }

  function handleOnboarding(profile) {
    setProfiles([profile]);
    setSelectedProfileId(profile.id);
  }

  function handleProfileSave(profile) {
    setProfiles((current) => {
      const exists = current.some((item) => item.id === profile.id);
      return exists ? current.map((item) => (item.id === profile.id ? profile : item)) : [...current, profile];
    });
    setSelectedProfileId(profile.id);
    setProfileModal(null);
  }

  async function handleSaveSettings(settings) {
    if (!selectedProfile) return;
    setSettingsByProfile((current) => ({ ...current, [selectedProfile.id]: settings }));

    try {
      await saveSettings(mode, settings);
      setDashboard((current) => (current ? applyLocalSettings(current, selectedProfile, settings) : current));
    } catch {
      setError("Settings were saved locally. Backend settings sync is unavailable in this preview.");
    }
  }

  async function handleControl(deviceId, action) {
    setControlMessage("");
    try {
      const response = await controlDevice(mode, deviceId, action);
      setDashboard((current) => ({
        ...current,
        devices: current.devices.map((device) => (device.id === deviceId ? { ...device, ...response.device } : device))
      }));
      setControlMessage(response.message);
    } catch (controlError) {
      setControlMessage(controlError.message || "Control command failed.");
    }
  }

  function handleCardOrderSave(nextOrder) {
    setCardOrder(nextOrder);
    writeStorage(storageKeys.cardOrder, nextOrder);
    setCustomizeOpen(false);
  }

  function handleLogout() {
    setUser(null);
    setDrawerOpen(false);
    setSection("dashboard");
  }

  if (!user) {
    return <AuthPanel onLogin={handleLogin} onRegister={handleRegister} />;
  }

  if (!profiles.length) {
    return <Onboarding user={user} onSave={handleOnboarding} />;
  }

  return (
    <div className="min-h-screen text-slate-100">
      <TopBar meta={meta} profile={selectedProfile} notifications={effectiveDashboard?.notifications || []} onMenu={() => setDrawerOpen(true)} onNotifications={() => setNotificationOpen(true)} />
      <Sidebar
        open={drawerOpen}
        section={section}
        profiles={profiles}
        selectedProfileId={selectedProfile?.id || ""}
        meta={meta}
        onClose={() => setDrawerOpen(false)}
        onSectionChange={setSection}
        onProfileChange={setSelectedProfileId}
        onLogout={handleLogout}
      />

      {error ? <ErrorPanel message={error} onRetry={() => loadDashboard(mode, range)} /> : null}

      {loading && !effectiveDashboard ? (
        <LoadingDashboard />
      ) : effectiveDashboard ? (
        <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          {section === "dashboard" ? (
            <DashboardSection
              user={user}
              mode={mode}
              profile={selectedProfile}
              dashboard={effectiveDashboard}
              cardOrder={cardOrder}
              activeAlerts={activeAlerts}
              onCustomize={() => setCustomizeOpen(true)}
            />
          ) : null}

          {section === "insights" ? (
            <InsightsSection
              mode={mode}
              range={range}
              dashboard={effectiveDashboard}
              controlMessage={controlMessage}
              onRangeChange={setRange}
              onControl={handleControl}
            />
          ) : null}

          {section === "accounts" ? (
            <AccountsSection
              profiles={profiles}
              selectedProfileId={selectedProfile?.id}
              meta={meta}
              onSelect={setSelectedProfileId}
              onAdd={() => setProfileModal({ mode: "add", profile: null })}
              onEdit={(profile) => setProfileModal({ mode: "edit", profile })}
            />
          ) : null}

          {section === "reports" ? <ReportsSection mode={mode} dashboard={effectiveDashboard} /> : null}

          {section === "settings" ? (
            <SettingsSection mode={mode} settings={effectiveDashboard.settings} summary={effectiveDashboard.summary} onSave={handleSaveSettings} />
          ) : null}
        </main>
      ) : null}

      <CustomizeDashboardModal open={customizeOpen} order={cardOrder} onClose={() => setCustomizeOpen(false)} onSave={handleCardOrderSave} />
      <NotificationsDrawer open={notificationOpen} mode={mode} notifications={effectiveDashboard?.notifications || []} onClose={() => setNotificationOpen(false)} />
      {profileModal ? (
        <ProfileModal user={user} profile={profileModal.profile} onClose={() => setProfileModal(null)} onSave={handleProfileSave} />
      ) : null}
    </div>
  );
}
