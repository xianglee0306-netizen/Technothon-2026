import { Bell, Cpu, Settings, Wifi } from "lucide-react";
import ModeSwitch from "./ModeSwitch.jsx";

export default function Header({ appName, mode, meta, onModeChange, onOpenSettings }) {
  const modeCopy = meta?.modes?.[mode]?.description || "Smart energy monitoring platform.";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Cpu size={22} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-950 sm:text-2xl">{appName}</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                  <Wifi size={13} aria-hidden="true" />
                  Smart hardware API ready
                </span>
              </div>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{modeCopy}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <Bell size={16} className="text-amber-600" aria-hidden="true" />
              <span>Live demo data</span>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Settings size={17} aria-hidden="true" />
              Settings
            </button>
          </div>
        </div>

        <ModeSwitch mode={mode} onChange={onModeChange} />
      </div>
    </header>
  );
}
