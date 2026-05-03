import { Calculator, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Accordion, AppSelect, formatCurrency, formatEnergy, Panel, SectionHeader } from "./ui.jsx";

const tierDefaults = {
  residential: { zones: 5, sensors: 9, hardwarePerZone: 210, hardwarePerSensor: 95, installPerZone: 170, software: 360 },
  business: { zones: 8, sensors: 13, hardwarePerZone: 720, hardwarePerSensor: 220, installPerZone: 460, software: 1200 },
  enterprise: { zones: 8, sensors: 32, hardwarePerZone: 2100, hardwarePerSensor: 430, installPerZone: 1550, software: 5200 }
};

function tierConfig(mode) {
  return tierDefaults[mode] || tierDefaults.residential;
}

function estimateRetrofitCost({ mode = "residential", packageName = "standard", zones, sensors, hardwareCost, installationCost, softwareCost }) {
  const config = tierConfig(mode);
  const zoneCount = Number(zones ?? config.zones);
  const sensorCount = Number(sensors ?? config.sensors);
  const multiplier = packageName === "advanced" ? 1.35 : packageName === "basic" ? 0.72 : 1;
  const hardware = hardwareCost !== undefined && hardwareCost !== ""
    ? Number(hardwareCost)
    : (zoneCount * config.hardwarePerZone + sensorCount * config.hardwarePerSensor) * multiplier;
  const install = installationCost !== undefined && installationCost !== ""
    ? Number(installationCost)
    : zoneCount * config.installPerZone * multiplier;
  const software = softwareCost !== undefined && softwareCost !== ""
    ? Number(softwareCost)
    : config.software * multiplier;

  return {
    hardwareCost: Number(hardware.toFixed(2)),
    installationCost: Number(install.toFixed(2)),
    softwareCost: Number(software.toFixed(2)),
    totalCost: Number((hardware + install + software).toFixed(2))
  };
}

function calculateMonthlySavings(summary, tariffRate, overrideKwh) {
  const monthlySavingsKwh = Number(overrideKwh || (summary?.potentialSavingsKwh || 0) * 30);
  return {
    estimatedMonthlySavingsKwh: Number(monthlySavingsKwh.toFixed(1)),
    estimatedMonthlySavingsCost: Number((monthlySavingsKwh * Number(tariffRate || 0)).toFixed(2))
  };
}

function calculatePaybackPeriod(totalCost, monthlySavings) {
  return monthlySavings > 0 ? Number((totalCost / monthlySavings).toFixed(1)) : 0;
}

function calculateROI(totalCost, annualSavings) {
  return totalCost > 0 ? Number((((annualSavings - totalCost) / totalCost) * 100).toFixed(1)) : 0;
}

function buildModel(mode, summary, form, existingModel = {}) {
  const cost = estimateRetrofitCost({
    mode,
    packageName: form.packageName,
    zones: Number(form.zones || 1),
    sensors: Number(form.sensors || 1),
    hardwareCost: form.hardwareCost,
    installationCost: form.installationCost,
    softwareCost: form.softwareCost
  });
  const savings = calculateMonthlySavings(summary, form.tariffRate, form.estimatedMonthlySavingsKwh);
  const annual = Number((savings.estimatedMonthlySavingsCost * 12).toFixed(2));

  return {
    ...existingModel,
    packageName: form.packageName,
    ...cost,
    ...savings,
    estimatedAnnualSavingsCost: annual,
    paybackMonths: calculatePaybackPeriod(cost.totalCost, savings.estimatedMonthlySavingsCost),
    roiPercent: calculateROI(cost.totalCost, annual),
    carbonSavingsPerMonthKg: Number((savings.estimatedMonthlySavingsKwh * 0.67).toFixed(1)),
    assumptions: {
      tariffRate: Number(form.tariffRate || 0),
      zones: Number(form.zones || 0),
      sensors: Number(form.sensors || 0)
    }
  };
}

function Metric({ label, value }) {
  return (
    <div className="hud-tile rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

export default function ROICalculator({ mode, summary, roiModel, onCalculate }) {
  const [form, setForm] = useState(() => {
    const tier = tierConfig(mode);
    return {
      packageName: roiModel?.packageName || "standard",
      tariffRate: roiModel?.assumptions?.tariffRate || summary?.tariffRate || 0.5,
      hardwareCost: roiModel?.hardwareCost || "",
      installationCost: roiModel?.installationCost || "",
      softwareCost: roiModel?.softwareCost || "",
      zones: roiModel?.assumptions?.zones || tier.zones,
      sensors: roiModel?.assumptions?.sensors || tier.sensors,
      estimatedMonthlySavingsKwh: roiModel?.estimatedMonthlySavingsKwh || ""
    };
  });
  const [serverModel, setServerModel] = useState(roiModel || {});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [calculating, setCalculating] = useState(false);
  const model = useMemo(() => buildModel(mode, summary, form, serverModel), [mode, summary, form, serverModel]);

  useEffect(() => {
    const tierFallback = tierConfig(mode);
    setServerModel(roiModel || {});
    setForm({
      packageName: roiModel?.packageName || "standard",
      tariffRate: roiModel?.assumptions?.tariffRate || summary?.tariffRate || 0.5,
      hardwareCost: roiModel?.hardwareCost || "",
      installationCost: roiModel?.installationCost || "",
      softwareCost: roiModel?.softwareCost || "",
      zones: roiModel?.assumptions?.zones || tierFallback.zones,
      sensors: roiModel?.assumptions?.sensors || tierFallback.sensors,
      estimatedMonthlySavingsKwh: roiModel?.estimatedMonthlySavingsKwh || ""
    });
  }, [roiModel, summary, mode]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setCalculating(true);
    try {
      const response = onCalculate ? await onCalculate(model) : null;
      if (response?.roiModel) {
        setServerModel(response.roiModel);
      }
      setMessage(response?.message || "ROI model recalculated.");
    } catch (calculateError) {
      setError(calculateError?.message || "ROI model could not be recalculated.");
    } finally {
      setCalculating(false);
    }
  }

  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon={Calculator}
        eyebrow="Financial feasibility"
        title="ROI and payback calculator"
        action={
          <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
            {model.paybackMonths} month payback
          </span>
        }
      />

      <div className="space-y-4 p-4 sm:p-5">
        {message ? <div className="rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100">{message}</div> : null}
        {error ? <div className="rounded-xl border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-100">{error}</div> : null}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total retrofit" value={formatCurrency(model.totalCost, "MYR")} />
          <Metric label="Monthly saving" value={formatCurrency(model.estimatedMonthlySavingsCost, "MYR")} />
          <Metric label="Payback" value={`${model.paybackMonths} months`} />
          <Metric label="ROI" value={`${model.roiPercent}%`} />
        </div>

        <Accordion title="Financial details" eyebrow="Cost breakdown">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Metric label="Hardware" value={formatCurrency(model.hardwareCost, "MYR")} />
            <Metric label="Installation" value={formatCurrency(model.installationCost, "MYR")} />
            <Metric label="Software" value={formatCurrency(model.softwareCost, "MYR")} />
            <Metric label="Annual saving" value={formatCurrency(model.estimatedAnnualSavingsCost, "MYR")} />
            <Metric label="Carbon saved" value={`${model.carbonSavingsPerMonthKg.toLocaleString()} kg/mo`} />
          </div>
        </Accordion>

        <form onSubmit={submit} className="hud-tile rounded-2xl border border-white/10 bg-slate-950/35 p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold text-white">Calculator inputs</p>
            <p className="mt-1 text-sm text-slate-400">Adjust the key assumptions first; override detailed retrofit costs only when needed.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Package</span>
              <AppSelect
                value={form.packageName}
                onChange={(nextValue) => update("packageName", nextValue)}
                options={[
                  { value: "basic", label: "Basic" },
                  { value: "standard", label: "Standard" },
                  { value: "advanced", label: "Advanced" }
                ]}
                buttonClassName="rounded-xl px-3"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Tariff rate (RM/kWh)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.tariffRate}
                onChange={(event) => update("tariffRate", event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Zones</span>
              <input
                type="number"
                min="1"
                value={form.zones}
                onChange={(event) => update("zones", event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Sensors</span>
              <input
                type="number"
                min="1"
                value={form.sensors}
                onChange={(event) => update("sensors", event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-200">Monthly saving kWh</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.estimatedMonthlySavingsKwh}
                onChange={(event) => update("estimatedMonthlySavingsKwh", event.target.value)}
                placeholder={formatEnergy((summary?.potentialSavingsKwh || 0) * 30)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
              />
            </label>
          </div>

          <Accordion title="Advanced cost overrides" eyebrow="Optional assumptions" className="mt-4">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Hardware cost (RM)</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={form.hardwareCost}
                  onChange={(event) => update("hardwareCost", event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Installation cost (RM)</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={form.installationCost}
                  onChange={(event) => update("installationCost", event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-200">Software cost (RM)</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={form.softwareCost}
                  onChange={(event) => update("softwareCost", event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/15"
                />
              </label>
            </div>
          </Accordion>

          <button
            type="submit"
            disabled={calculating}
            className="hud-button-primary mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition sm:w-auto"
          >
            <RefreshCw size={17} aria-hidden="true" />
            {calculating ? "Calculating..." : "Calculate ROI"}
          </button>
        </form>
      </div>
    </Panel>
  );
}
