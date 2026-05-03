import { ClipboardCheck, ListChecks, ShieldCheck, Workflow } from "lucide-react";
import { useState } from "react";
import ApprovalWorkflow from "../components/ApprovalWorkflow.jsx";
import AutomationRulesPanel from "../components/AutomationRulesPanel.jsx";
import { ControlEventBoard, ControlHero, ControlMaster } from "../components/dashboard/ControlUI.jsx";
import { DashboardCard, MetricCard, Tabs } from "../components/ui.jsx";
import { LoadingPanel, PageScaffold, useReadyDashboard } from "./pageShared.jsx";

const tabs = [
  { id: "rules", label: "Rules" },
  { id: "approvals", label: "Approvals" },
  { id: "audit", label: "Audit Log" }
];

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState("rules");
  const { actions, dashboard, loading, mode, ready } = useReadyDashboard();

  if (!ready && loading) return <LoadingPanel title="Loading automation" />;

  const rules = dashboard?.automationRules || [];
  const enabledRules = rules.filter((rule) => rule.enabled).length;
  const pendingApprovals = (dashboard?.approvalQueue || []).filter((item) => item.status === "Pending").length;

  return (
    <PageScaffold
      eyebrow="Automation · SCADA Console"
      title="Industrial Control Panel"
      description="Master breaker, automation engine, e-stop and rule policies — all under operator approval. Class B industrial workflow."
    >
      <div data-theme-skin="control" className="theme-skin theme-skin--control">
        <ControlHero rules={rules} pendingApprovals={pendingApprovals} mode={mode} onTabSelect={setActiveTab} />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Rules" value={rules.length} detail="Configured policies" icon={Workflow} />
          <MetricCard label="Enabled" value={enabledRules} detail="Monitoring now" icon={ShieldCheck} tone="green" />
          <MetricCard label="Pending" value={pendingApprovals} detail="Approval queue" icon={ClipboardCheck} tone={pendingApprovals ? "amber" : "green"} />
          <MetricCard label="Audit Events" value={dashboard?.auditLog?.length || 0} detail="Recent changes" icon={ListChecks} />
        </section>

        <section className="ctrl-grid">
          <ControlMaster rules={rules} onToggleRule={actions.toggleAutomationRule} />
          <ControlEventBoard auditLog={dashboard?.auditLog} />
        </section>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "rules" ? (
          <AutomationRulesPanel
            mode={mode}
            rules={dashboard?.automationRules || []}
            onToggle={actions.toggleAutomationRule}
            onSave={actions.saveAutomationRule}
          />
        ) : null}

        {activeTab === "approvals" ? (
          <ApprovalWorkflow approvals={dashboard?.approvalQueue || []} onApprove={actions.approveAction} onReject={actions.rejectAction} />
        ) : null}

        {activeTab === "audit" ? (
          <DashboardCard className="overflow-hidden p-0">
            <div className="border-b border-white/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Audit log</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Recent automation and action history</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-950/45 text-xs uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Target</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {(dashboard?.auditLog || []).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-slate-400">{item.time}</td>
                      <td className="px-4 py-3 text-slate-300">{item.actor}</td>
                      <td className="px-4 py-3 font-semibold text-white">{item.action}</td>
                      <td className="px-4 py-3 text-slate-300">{item.target}</td>
                      <td className="px-4 py-3 text-cyan-100">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        ) : null}
      </div>
    </PageScaffold>
  );
}
