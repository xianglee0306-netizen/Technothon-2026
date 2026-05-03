import { BarChart3, Bot, Cpu, FileText, Gauge, Home, Leaf, Menu, RefreshCw, Settings, ShieldCheck, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useDashboardData } from "../app/DashboardContext.jsx";
import NotificationBell from "./notifications/NotificationBell.jsx";
import NotificationPanel from "./notifications/NotificationPanel.jsx";
import { AppSelect } from "./ui.jsx";

const pageMeta = {
  "/": { title: "Energy Digital Twin", subtitle: "Public overview" },
  "/dashboard": { title: "Command Hub", subtitle: "Dashboard modules" },
  "/dashboard/details": { title: "Command View", subtitle: "Tier dashboard" },
  "/ai-twin": { title: "AI Twin", subtitle: "Simulate before action" },
  "/actions": { title: "AI Actions", subtitle: "Recommendations and approvals" },
  "/automation": { title: "Automation Hub", subtitle: "Rules, approvals, audit" },
  "/fault-detection": { title: "Fault Detection", subtitle: "Diagnostic canvas" },
  "/roi": { title: "ROI", subtitle: "Business case model" },
  "/reports": { title: "Reports", subtitle: "Operational summary" },
  "/setup": { title: "Setup", subtitle: "Energy profile baseline" },
  "/settings": { title: "Settings", subtitle: "Assumptions and preferences" }
};

const profileOptions = [
  { value: "residential", label: "Residential" },
  { value: "business", label: "Commercial" },
  { value: "enterprise", label: "Industry" }
];

// Sidebar sections — grouped to feel less crowded. Each section is a related
// cluster of nav items with a one-word label that only appears when the
// sidebar is expanded (hovered on desktop, always-on on mobile).
const navSections = [
  {
    id: "operate",
    label: "Operate",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: Gauge },
      { to: "/actions", label: "Save Energy", icon: Sparkles },
      { to: "/ai-twin", label: "AI Twin", icon: Cpu },
      { to: "/automation", label: "Automation", icon: ShieldCheck }
    ]
  },
  {
    id: "insights",
    label: "Insights",
    items: [
      { to: "/roi", label: "ROI", icon: BarChart3 },
      { to: "/fault-detection", label: "Impact", icon: Leaf },
      { to: "/reports", label: "Reports", icon: FileText }
    ]
  },
  {
    id: "configure",
    label: "Configure",
    items: [
      { to: "/setup", label: "Setup", icon: SlidersHorizontal },
      { to: "/settings", label: "Settings", icon: Settings }
    ]
  }
];

const ALERT_SEVERITIES = new Set(["critical", "warning", "hardware", "high"]);

export default function AppShell() {
  const { pathname } = useLocation();
  const { actions, dashboard, error, loading, mode } = useDashboardData();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const meta = pageMeta[normalizedPath] || pageMeta["/"];
  const isLanding = normalizedPath === "/";
  const isDashboard = normalizedPath === "/dashboard";
  const isHub = isDashboard; // Audi-style mosaic hub — no sidebar, has its own nav
  const showBackToDashboard = !isLanding && !isDashboard;
  const showSidebar = false; // Sidebar removed everywhere — themed top of each subpage handles identity
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = dashboard?.notifications || [];
  const alertCount = notifications.filter((item) =>
    ALERT_SEVERITIES.has(String(item.severity || "").toLowerCase())
  ).length;

  return (
    <div className="min-h-screen bg-transparent text-on-background">
      <TopBar
        actions={actions}
        alertCount={alertCount}
        isDashboard={isDashboard}
        isLanding={isLanding}
        loading={loading}
        meta={meta}
        mobileNavOpen={mobileNavOpen}
        mode={mode}
        notifOpen={notifOpen}
        onOpenNotifications={() => setNotifOpen(true)}
        setMobileNavOpen={setMobileNavOpen}
        showBackToDashboard={showBackToDashboard}
        totalCount={notifications.length}
      />

      {showSidebar ? (
        <SidebarNav
          currentPath={normalizedPath}
          mobileNavOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />
      ) : null}

      {isLanding ? (
        <>
          {error ? (
            <div className="hud-card fixed left-4 right-4 top-[80px] z-40 rounded-2xl border border-rose-300/35 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100 sm:left-6 sm:right-6">
              {error}
            </div>
          ) : null}
          <Outlet />
        </>
      ) : isHub ? (
        <main className="relative z-10 w-full pt-[72px]">
          {error ? (
            <div className="hud-card mx-4 mb-5 rounded-2xl border border-rose-300/35 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100 sm:mx-6">
              {error}
            </div>
          ) : null}
          <Outlet />
        </main>
      ) : (
        <main className={`relative z-10 mx-auto w-full max-w-[1360px] px-4 pb-10 pt-[92px] sm:px-6 lg:pb-14`}>
          {error ? (
            <div className="hud-card mb-5 rounded-2xl border border-rose-300/35 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100">
              {error}
            </div>
          ) : null}
          <Outlet />
        </main>
      )}

      <NotificationPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
      />
    </div>
  );
}

export function TopBar({ actions, alertCount, isDashboard, isLanding, loading, meta, mobileNavOpen, mode, notifOpen, onOpenNotifications, setMobileNavOpen, showBackToDashboard, totalCount }) {
  function syncDashboard(event) {
    event.preventDefault();
    actions.reload();
  }

  return (
    <header className="hud-topbar fixed inset-x-0 top-0 z-50 h-[72px] border-b border-slate-700/60 bg-[#050711]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-[1360px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {!isLanding ? (
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
              className="btn-secondary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl lg:hidden"
            >
              {mobileNavOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          ) : null}

          <Link to="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.14)] transition group-hover:border-cyan-300/45 group-hover:bg-cyan-300/15">
              <Gauge size={19} aria-hidden="true" />
            </span>
            <span className="hud-title-glow hidden font-headline-md text-xl font-black tracking-normal text-cyan-100 sm:inline">
              GridSenseIQ
            </span>
          </Link>

          {showBackToDashboard ? (
            <Link
              to="/dashboard"
              aria-label="Back to dashboard"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              <Home size={18} aria-hidden="true" />
            </Link>
          ) : null}

          {!isLanding && !isDashboard ? (
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-white sm:text-base">{meta.title}</h1>
              <p className="hidden truncate text-xs text-slate-400 sm:block">{meta.subtitle}</p>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isLanding ? (
            <Link to="/dashboard" className="hud-button-primary hidden min-h-10 items-center rounded-xl px-4 text-xs font-semibold transition sm:inline-flex">
              Open dashboard
            </Link>
          ) : null}

          {!isLanding ? (
            <>
              <AppSelect
                value={mode}
                onChange={actions.setMode}
                options={profileOptions}
                className="w-[120px] sm:w-[160px]"
                buttonClassName="min-h-10 rounded-xl px-3 py-2 text-xs"
              />
              <NotificationBell
                alertCount={alertCount}
                totalCount={totalCount}
                onOpen={onOpenNotifications}
                open={notifOpen}
              />
              <button
                type="button"
                onClick={syncDashboard}
                disabled={loading}
                aria-label={loading ? "Syncing dashboard" : "Sync dashboard"}
                className="hud-button-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-semibold transition disabled:cursor-wait disabled:opacity-65 sm:w-auto sm:gap-2 sm:px-3"
              >
                <RefreshCw className={loading ? "animate-spin" : ""} size={15} aria-hidden="true" />
                <span className="hidden sm:inline">{loading ? "Syncing" : "Sync"}</span>
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function SidebarNav({ currentPath, mobileNavOpen, onClose }) {
  return (
    <>
      <button
        type="button"
        aria-label="Close navigation overlay"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/62 backdrop-blur-sm transition lg:hidden ${mobileNavOpen ? "block" : "hidden"}`}
      />
      <aside
        className={`hud-sidebar fixed left-0 top-[72px] z-50 h-[calc(100vh-72px)] w-[248px] border-r border-cyan-300/12 bg-slate-950/92 px-3 py-4 backdrop-blur-2xl transition-transform lg:w-[72px] lg:translate-x-0 lg:hover:w-[248px] ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav aria-label="Primary navigation" className="sidebar-nav flex h-full flex-col overflow-y-auto overflow-x-hidden">
          {navSections.map((section, sectionIndex) => (
            <div key={section.id} className="sidebar-section" data-section={section.id}>
              {sectionIndex > 0 ? <div className="sidebar-divider" aria-hidden="true" /> : null}
              <p className="sidebar-section__label">{section.label}</p>
              <div className="sidebar-section__items">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = currentPath === item.to;
                  return (
                    <Link
                      key={`${item.to}-${item.label}`}
                      to={item.to}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={`sidebar-link ${active ? "sidebar-link--active" : ""}`}
                    >
                      <span className="sidebar-link__icon">
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <span className="sidebar-link__label">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
