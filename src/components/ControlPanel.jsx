import { Bot, Power, ShieldCheck, TimerReset } from "lucide-react";
import { Panel, SectionHeader, StatusBadge } from "./ui.jsx";

export default function ControlPanel({ mode, devices, settings, controlMessage, onControl }) {
  const isEnterprise = mode === "enterprise";
  const manageableDevices = (devices || []).filter((device) => device.controlEnabled).slice(0, isEnterprise ? 6 : 4);

  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon={Power}
        eyebrow={isEnterprise ? "Control simulation" : "Simple circuit controls"}
        title={isEnterprise ? "Device and machine control panel" : "Circuit control panel"}
        action={
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            {settings?.automationPreference || "Suggest Only"}
          </span>
        }
      />

      <div className="p-4 sm:p-5">
        {controlMessage ? (
          <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800">
            {controlMessage}
          </div>
        ) : null}

        <div className="grid gap-3 lg:grid-cols-2">
          {manageableDevices.map((device) => (
            <article key={device.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{device.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {isEnterprise ? `${device.department} - ${device.zone}` : device.zone}
                  </p>
                </div>
                <StatusBadge status={device.status} />
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">{device.recommendation}</p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => onControl(device.id, device.isOn ? "turn-off" : "turn-on")}
                  className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                    device.isOn
                      ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      : "border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
                  }`}
                >
                  <Power size={16} aria-hidden="true" />
                  {device.isOn ? "Turn off" : "Turn on"}
                </button>

                {isEnterprise ? (
                  <button
                    type="button"
                    onClick={() => onControl(device.id, "simulate-ai")}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <Bot size={16} aria-hidden="true" />
                    Simulate AI
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onControl(device.id, "simulate-ai")}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <TimerReset size={16} aria-hidden="true" />
                    Schedule
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          <ShieldCheck className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
          <p>Prototype control only. Real deployment requires hardware validation and safety authorization.</p>
        </div>
      </div>
    </Panel>
  );
}
