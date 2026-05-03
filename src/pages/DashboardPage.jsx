import BusinessDashboard from "../components/dashboard/BusinessDashboard.jsx";
import EnterpriseDashboard from "../components/dashboard/EnterpriseDashboard.jsx";
import ResidentialDashboard from "../components/dashboard/ResidentialDashboard.jsx";
import { LoadingPanel, PageScaffold, useReadyDashboard } from "./pageShared.jsx";

export default function DashboardPage() {
  const { activeAlerts, dashboard, loading, mode, ready } = useReadyDashboard();

  if (!ready && loading) return <LoadingPanel title="Loading dashboard" />;

  // Hard tier separation — pick the dashboard that matches the active mode.
  // Each tier ships its own layout, copy, and signature feature set.
  let TierDashboard = ResidentialDashboard;
  if (mode === "business") TierDashboard = BusinessDashboard;
  else if (mode === "enterprise") TierDashboard = EnterpriseDashboard;

  return (
    <PageScaffold showHeader={false}>
      <TierDashboard dashboard={dashboard} mode={mode} activeAlerts={activeAlerts} />
    </PageScaffold>
  );
}
