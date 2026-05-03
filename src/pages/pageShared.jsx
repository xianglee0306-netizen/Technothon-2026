import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardData } from "../app/DashboardContext.jsx";
import { PageHeader, PageShell, Panel } from "../components/ui.jsx";

export function LoadingPanel({ title = "Loading GridSenseIQ" }) {
  return (
    <Panel className="grid min-h-[320px] place-items-center p-8">
      <div className="text-center">
        <Loader2 className="mx-auto animate-spin text-cyan-200" size={34} aria-hidden="true" />
        <p className="mt-4 text-lg font-semibold text-white">{title}</p>
        <p className="mt-2 text-sm text-slate-400">Syncing simulated telemetry and control state.</p>
      </div>
    </Panel>
  );
}

export function PageScaffold({ eyebrow, title, description, actions, showHeader = true, children }) {
  return (
    <PageShell>
      {showHeader ? <PageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} /> : null}
      {children}
    </PageShell>
  );
}

export function useReadyDashboard() {
  const context = useDashboardData();
  return {
    ...context,
    ready: Boolean(context.dashboard)
  };
}

export function RouteButton({ to, children, tone = "primary" }) {
  const classes =
    tone === "secondary"
      ? "border border-cyan-300/15 bg-white/[0.06] text-slate-100 hover:border-cyan-300/35 hover:bg-cyan-300/10"
      : "hud-button-primary";

  return (
    <Link to={to} className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition ${classes}`}>
      {children}
    </Link>
  );
}
