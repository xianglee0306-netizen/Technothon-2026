import { Download, FileText, Leaf, ListChecks, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LabCitations, LabFigure, LabHero, LabMethodsSection, LabSampleTable } from "../components/dashboard/LabUI.jsx";
import EnergyTrendChart from "../components/EnergyTrendChart.jsx";
import { DashboardCard, formatCurrency, formatEnergy, MetricCard, SeverityIcon } from "../components/ui.jsx";
import { LoadingPanel, PageScaffold, useReadyDashboard } from "./pageShared.jsx";

/**
 * Read the user-calibrated profile from localStorage and normalize key names
 * to what LabUI components expect. Returns null if no override saved yet.
 */
function readUserOverride() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem("gridsenseiq:user-profile");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || (parsed.monthlyUsageKwh == null && parsed.monthlyBillRm == null)) return null;
    return {
      // LabUI components expect these key names
      monthlyKwh: Number(parsed.monthlyUsageKwh) || null,
      monthlyRm: Number(parsed.monthlyBillRm) || null,
      monthlyBillRm: Number(parsed.monthlyBillRm) || null,
      tariffRate: Number(parsed.tariffRate) || null,
      facilityName: parsed.facilityName || null,
      floorAreaSqm: parsed.floorAreaSqm || null
    };
  } catch (e) {
    return null;
  }
}

/**
 * useLiveTicker — increments a base value by ratePerSecond on every animation
 * frame so KPI numbers visibly tick during the demo. Resets when base changes.
 */
function useLiveTicker(base, ratePerSecond) {
  const [value, setValue] = useState(Number(base) || 0);
  const startRef = useRef(performance.now());
  const baseRef = useRef(Number(base) || 0);

  useEffect(() => {
    baseRef.current = Number(base) || 0;
    startRef.current = performance.now();
    setValue(baseRef.current);
  }, [base]);

  useEffect(() => {
    if (!ratePerSecond) return undefined;
    let mounted = true;
    function tick() {
      if (!mounted) return;
      const elapsed = (performance.now() - startRef.current) / 1000;
      setValue(baseRef.current + elapsed * ratePerSecond);
      requestAnimationFrame(tick);
    }
    const id = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      cancelAnimationFrame(id);
    };
  }, [ratePerSecond]);

  return value;
}

export default function ReportsPage() {
  const { actions, dashboard, loading, mode, range, ready } = useReadyDashboard();

  // userOverride is null when user hasn't run setup yet (DEMO PROFILE),
  // populated when they have (USER-CALIBRATED).
  const [userOverride, setUserOverride] = useState(() => readUserOverride());

  // Re-read override whenever Settings page broadcasts a change OR another tab
  // updates the localStorage entry (storage event).
  useEffect(() => {
    function handler() { setUserOverride(readUserOverride()); }
    if (typeof window === "undefined") return undefined;
    window.addEventListener("gridsenseiq:profile-updated", handler);
    function storageHandler(e) {
      if (e.key === "gridsenseiq:user-profile") handler();
    }
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("gridsenseiq:profile-updated", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  // Base values for the live-ticking KPI cards. If user has calibrated, use
  // their real bill for the cost figure; otherwise the dashboard projection.
  const carbonReductionBase = Math.round(
    (dashboard?.carbonStory?.reductionKg) ||
    (dashboard?.summary?.carbonReductionPotentialKg) || 0
  );
  const projectedCostBase = userOverride?.monthlyBillRm
    ? Number(userOverride.monthlyBillRm)
    : Number(dashboard?.summary?.projectedMonthlyCost || 0);

  // Tick rates: ~base / (30 * 24 * 3600s), multiplied by 60 so the demo
  // counter is visibly moving rather than imperceptibly slow.
  const carbonRatePerSec = (carbonReductionBase / (30 * 24 * 3600)) * 60;
  const costRatePerSec = (projectedCostBase / (30 * 24 * 3600)) * 60;

  const liveCarbonKg = useLiveTicker(carbonReductionBase, carbonRatePerSec);
  const liveCost = useLiveTicker(projectedCostBase, costRatePerSec);

  if (!ready && loading) return <LoadingPanel title="Loading reports" />;

  const story = dashboard?.carbonStory || {};

  function handleExport() {
    if (typeof window === "undefined") return;
    document.body.classList.add("printing-report");
    setTimeout(() => {
      window.print();
      window.addEventListener(
        "afterprint",
        () => { document.body.classList.remove("printing-report"); },
        { once: true }
      );
    }, 80);
  }

  return (
    <PageScaffold
      eyebrow="Reports · Research Brief"
      title="Operational Energy Audit"
      description="Peer-style operational report. Methods, sampled measurements, anomaly flags, and impact analysis with full citation index."
    >
      <div data-theme-skin="lab" className="theme-skin theme-skin--lab" id="report-printable">
        {/* Toolbar — Export PDF + Setup link. Hidden in print. */}
        <div className="lab-toolbar no-print">
          <div className="lab-toolbar__status">
            {userOverride ? (
              <>
                <span className="lab-toolbar__status-dot lab-toolbar__status-dot--ok" />
                <span>
                  <strong>Calibrated</strong> · using your real numbers ({Number(userOverride.monthlyKwh || 0).toLocaleString()} kWh / RM {Number(userOverride.monthlyBillRm || 0).toLocaleString()})
                </span>
              </>
            ) : (
              <>
                <span className="lab-toolbar__status-dot lab-toolbar__status-dot--demo" />
                <span>
                  <strong>Demo profile</strong> · figures derived from tier-default baseline
                </span>
              </>
            )}
          </div>
          <div className="lab-toolbar__actions">
            <Link to="/setup" className="lab-toolbar__btn lab-toolbar__btn--ghost">
              <Settings2 size={14} aria-hidden="true" />
              <span>{userOverride ? "Recalibrate" : "Calibrate with your bill"}</span>
            </Link>
            <button type="button" onClick={handleExport} className="lab-toolbar__btn lab-toolbar__btn--primary">
              <Download size={14} aria-hidden="true" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <LabHero
          summary={dashboard?.summary}
          mode={mode}
          auditLogCount={(dashboard?.auditLog || []).length}
          userOverride={userOverride}
        />

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Carbon Reduction"
            value={`${Math.floor(liveCarbonKg).toLocaleString()} kg`}
            detail={userOverride ? "Live · calibrated to your usage" : "Monthly potential · live counter"}
            icon={Leaf}
            tone="green"
          />
          <MetricCard
            label="Projected Cost"
            value={formatCurrency(liveCost, dashboard?.summary?.currency)}
            detail={userOverride ? "Live · based on your bill" : "Monthly estimate · live counter"}
            icon={FileText}
            tone="amber"
          />
          <MetricCard
            label="Audit Events"
            value={dashboard?.auditLog?.length || 0}
            detail="Operational history"
            icon={ListChecks}
          />
        </section>

        <LabMethodsSection />

        <LabSampleTable
          summary={dashboard?.summary}
          mode={mode}
          userOverride={userOverride}
        />

        <LabFigure
          figureNum={1}
          caption="Time-series energy consumption profile across the reporting period. Range filter selectable. Source: GridSenseIQ continuous monitoring telemetry."
        >
          <EnergyTrendChart mode={mode} range={range} trends={dashboard?.trends} onRangeChange={actions.setRange} />
        </LabFigure>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <DashboardCard className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">§ 4 · Discussion</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Carbon impact narrative</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{story.story || "Apply optimization scenarios to generate a richer carbon report."}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="hud-tile rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Energy saving potential</p>
                <p className="mt-1 font-semibold text-white">{formatEnergy(dashboard?.summary?.potentialSavingsKwh || 0)}</p>
              </div>
              <div className="hud-tile rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Tree equivalent<sup className="lab-cite">[7]</sup></p>
                <p className="mt-1 font-semibold text-white">{(story.treeEquivalent || 0).toLocaleString()} trees</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard className="overflow-hidden p-0">
            <div className="border-b border-white/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">§ 5 · Notification log</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Operational events &amp; alerts</h2>
            </div>
            <div className="divide-y divide-white/10">
              {(dashboard?.notifications || []).slice(0, 6).map((item) => (
                <div key={item.id} className="hud-tile p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2">
                      <SeverityIcon severity={item.severity} />
                      <p className="font-semibold text-white">{item.title}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">{item.severity}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.message}</p>
                  {item.affectedZone || item.estimatedImpact ? (
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {item.affectedZone || "System"} {item.estimatedImpact ? `- ${item.estimatedImpact}` : ""}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </DashboardCard>
        </section>

        <LabCitations />
      </div>
    </PageScaffold>
  );
}
