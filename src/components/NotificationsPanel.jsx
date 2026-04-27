import { BellRing } from "lucide-react";
import { Panel, SectionHeader, SeverityIcon } from "./ui.jsx";

export default function NotificationsPanel({ mode, notifications }) {
  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon={BellRing}
        eyebrow={mode === "enterprise" ? "Operational alerts" : "Reminders"}
        title={mode === "enterprise" ? "Notifications and approvals" : "Notifications and reminders"}
      />

      <div className="divide-y divide-white/10">
        {(notifications || []).map((notification) => (
          <article key={notification.id} className="flex gap-3 px-4 py-4 sm:px-5">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <SeverityIcon severity={notification.severity} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-white">{notification.title}</p>
                <span className="text-xs font-semibold text-slate-400">{notification.time}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-300">{notification.message}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200/60">{notification.type}</p>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
