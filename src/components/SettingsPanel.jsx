import { Save, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";

function listToText(items = []) {
  return items.join("\n");
}

function textToList(value) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createForm(settings) {
  return {
    tariffRate: settings?.tariffRate ?? 0,
    energySavingTarget: settings?.energySavingTarget ?? 0,
    co2ReductionTargetKg: settings?.co2ReductionTargetKg ?? 0,
    notificationTime: settings?.notificationTime ?? "08:00",
    notificationPreference: settings?.notificationPreference ?? "Smart reminders",
    automationPreference: settings?.automationPreference ?? "Suggest Only",
    categories: listToText(settings?.categories),
    departments: listToText(settings?.departments),
    zones: listToText(settings?.zones)
  };
}

export default function SettingsPanel({ open, mode, settings, onClose, onSave }) {
  const [form, setForm] = useState(createForm(settings));
  const isEnterprise = mode === "enterprise";

  useEffect(() => {
    if (open) {
      setForm(createForm(settings));
    }
  }, [open, settings]);

  if (!open) return null;

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSave({
      tariffRate: Number(form.tariffRate),
      energySavingTarget: Number(form.energySavingTarget),
      co2ReductionTargetKg: Number(form.co2ReductionTargetKg),
      notificationTime: form.notificationTime,
      notificationPreference: form.notificationPreference,
      automationPreference: form.automationPreference,
      categories: textToList(form.categories),
      departments: isEnterprise ? textToList(form.departments) : settings?.departments,
      zones: textToList(form.zones)
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/50 p-0 sm:items-center sm:justify-center sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white shadow-2xl sm:max-w-2xl sm:rounded-lg"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <SlidersHorizontal size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Customization</p>
              <h2 className="text-base font-semibold text-slate-950">Dashboard settings</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Close settings"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-4 px-4 py-5 sm:grid-cols-2 sm:px-5">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Tariff rate per kWh</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.tariffRate}
              onChange={(event) => updateField("tariffRate", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Energy-saving target (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={form.energySavingTarget}
              onChange={(event) => updateField("energySavingTarget", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Monthly CO2 reduction target (kg)</span>
            <input
              type="number"
              min="0"
              value={form.co2ReductionTargetKg}
              onChange={(event) => updateField("co2ReductionTargetKg", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Notification time</span>
            <input
              type="time"
              value={form.notificationTime}
              onChange={(event) => updateField("notificationTime", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Notification preference</span>
            <select
              value={form.notificationPreference}
              onChange={(event) => updateField("notificationPreference", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            >
              <option>Smart reminders</option>
              <option>Critical alerts and shift summaries</option>
              <option>High usage warnings only</option>
              <option>Daily summary only</option>
            </select>
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">AI automation preference</span>
            <select
              value={form.automationPreference}
              onChange={(event) => updateField("automationPreference", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            >
              <option>Off</option>
              <option>Suggest Only</option>
              <option>Auto-Control Simulation</option>
            </select>
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">
              {isEnterprise ? "Machines, systems, or zones" : "Device categories"}
            </span>
            <textarea
              rows={5}
              value={form.categories}
              onChange={(event) => updateField("categories", event.target.value)}
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          {isEnterprise ? (
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Departments</span>
              <textarea
                rows={4}
                value={form.departments}
                onChange={(event) => updateField("departments", event.target.value)}
                className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </label>
          ) : null}

          <label className={`space-y-2 ${isEnterprise ? "" : "sm:col-span-2"}`}>
            <span className="text-sm font-semibold text-slate-700">{isEnterprise ? "Plant zones" : "Home or SME zones"}</span>
            <textarea
              rows={4}
              value={form.zones}
              onChange={(event) => updateField("zones", event.target.value)}
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>
        </div>

        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            <Save size={17} aria-hidden="true" />
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}
