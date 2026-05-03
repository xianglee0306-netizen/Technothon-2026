import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import { useState } from "react";
import { formatEnergy, Panel, SectionHeader } from "./ui.jsx";

function riskClass(risk) {
  const styles = {
    Critical: "border-rose-300/35 bg-rose-400/15 text-rose-100",
    High: "border-orange-300/35 bg-orange-400/15 text-orange-100",
    Medium: "border-amber-300/35 bg-amber-400/15 text-amber-100",
    Low: "border-emerald-300/35 bg-emerald-400/15 text-emerald-100"
  };

  return styles[risk] || styles.Medium;
}

export default function ApprovalWorkflow({ approvals, onApprove, onReject }) {
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const queue = approvals || [];
  const pendingCount = queue.filter((item) => item.status === "Pending").length;

  async function act(approval, action) {
    setBusyId(approval.id);
    setMessage("");
    setError("");
    try {
      const response = action === "approve" ? await onApprove?.(approval.id) : await onReject?.(approval.id);
      setMessage(response?.message || `Action ${action === "approve" ? "approved" : "rejected"}.`);
    } catch (actionError) {
      setError(actionError?.message || `Approval could not be ${action === "approve" ? "approved" : "rejected"}.`);
    } finally {
      setBusyId("");
    }
  }

  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon={ShieldAlert}
        eyebrow="Safety approval workflow"
        title="Human-in-the-loop control queue"
        action={
          <span className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-100">
            {pendingCount} pending
          </span>
        }
      />

      <div className="space-y-3 p-4 sm:p-5">
        {message ? <div className="rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100">{message}</div> : null}
        {error ? <div className="rounded-xl border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-100">{error}</div> : null}

        {queue.length ? (
          queue.map((approval) => {
            const pending = approval.status === "Pending";

            return (
              <article key={approval.id} className="hud-card rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{approval.title}</p>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${riskClass(approval.riskLevel)}`}>{approval.riskLevel}</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">{approval.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{approval.target}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{approval.reason}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200/70">
                      {formatEnergy(approval.expectedSavingsKwh)} expected saving . Requested by {approval.requestedBy} at {approval.requestedAt}
                    </p>
                  </div>

                  {pending ? (
                    <div className="flex gap-2 sm:flex-col">
                      <button
                        type="button"
                        onClick={() => act(approval, "approve")}
                        disabled={busyId === approval.id}
                        className="hud-button-success inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 sm:flex-none"
                      >
                        <CheckCircle2 size={16} aria-hidden="true" />
                        {busyId === approval.id ? "Working..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        onClick={() => act(approval, "reject")}
                        disabled={busyId === approval.id}
                        className="hud-button-danger inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 sm:flex-none"
                      >
                        <XCircle size={16} aria-hidden="true" />
                        {busyId === approval.id ? "Working..." : "Reject"}
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold ${
                        approval.status === "Approved"
                          ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"
                          : "border-rose-300/30 bg-rose-400/10 text-rose-100"
                      }`}
                    >
                      {approval.status === "Approved" ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
                      {approval.status}
                    </div>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <div className="hud-tile rounded-2xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-slate-300">
            No approval requests are pending. High-risk AI control actions will appear here before execution.
          </div>
        )}
      </div>
    </Panel>
  );
}
