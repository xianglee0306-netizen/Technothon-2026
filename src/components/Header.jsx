import { Bell, Cpu, Settings, Wifi } from "lucide-react";
import ModeSwitch from "./ModeSwitch.jsx";

export default function Header({ appName, mode, meta, onModeChange, onOpenSettings }) {
  const modeCopy = meta?.modes?.[mode]?.description || "Smart energy monitoring platform.";

  return (
    <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.16)]">
              <Cpu size={22} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-white sm:text-2xl">{appName}</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                  <Wifi size={13} aria-hidden="true" />
                  Smart hardware API ready
                </span>
              </div>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300">{modeCopy}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              <Bell size={16} className="text-amber-300" aria-hidden="true" />
              <span>Live demo data</span>
            </div>
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
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
