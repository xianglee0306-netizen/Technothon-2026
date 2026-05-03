import { appMeta, mockData } from "./_data.js";
import {
  appendAuditLog,
  appendNotification,
  applyOptimizationScenario,
  applyRecommendationToDashboard,
  approvePendingAction,
  calculateRoiModel,
  createAutomationRuleInDashboard,
  recomputeDashboardMetrics,
  rejectPendingAction,
  requestApprovalForRecommendation,
  simulateDashboardOptimization,
  simulateRecommendationImpact,
  toggleAutomationRuleInDashboard
} from "../src/simulationEngine.js";

const store = JSON.parse(JSON.stringify(mockData));
const safetyNote =
  "Prototype simulation only. Real deployment requires electrical safety validation, authorized personnel, and hardware interlock testing.";

function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

function getUrl(req) {
  const host = req.headers?.host || "localhost";
  return new URL(req.url || "/api/dashboard", `http://${host}`);
}

function getMode(input = {}) {
  const mode = input.mode || input.profile || input.profileType || "residential";

  if (!store[mode]) {
    const error = new Error(`Unsupported profile type "${mode}". Use "residential", "business", or "enterprise".`);
    error.statusCode = 400;
    throw error;
  }

  return mode;
}

function money(value) {
  return Number(Number(value || 0).toFixed(2));
}

function withComputedFinancials(mode) {
  const data = recomputeDashboardMetrics(store[mode]);
  store[mode] = data;
  const tariff = Number(data.settings?.tariffRate || 0.5);
  const summary = data.summary || {};

  return {
    ...summary,
    estimatedCost: money(summary.totalEnergyKwh * tariff),
    projectedMonthlyCost: money(summary.projectedMonthlyKwh * tariff),
    potentialSavingsCost: money(summary.potentialSavingsKwh * tariff),
    tariffRate: tariff,
    currency: data.settings?.currency || "MYR"
  };
}

function withDeviceCosts(mode) {
  const tariff = Number(store[mode].settings?.tariffRate || 0.5);
  const devices = Array.isArray(store[mode].devices) ? store[mode].devices : [];
  const total = devices.reduce((sum, device) => sum + Number(device.usageKwh || 0), 0) || 1;

  return devices.map((device) => ({
    ...device,
    costContribution: money(Number(device.usageKwh || 0) * tariff),
    sharePercent: Number(((Number(device.usageKwh || 0) / total) * 100).toFixed(1))
  }));
}

function dashboardPayload(mode, range = "daily") {
  store[mode] = recomputeDashboardMetrics(store[mode]);
  const trends = store[mode].trends?.[range];

  if (!trends) {
    const error = new Error(`Unsupported range "${range}". Use hourly, daily, weekly, or monthly.`);
    error.statusCode = 400;
    throw error;
  }

  return {
    meta: appMeta,
    tier: store[mode].tier,
    target: store[mode].target,
    monthlyUsageKwh: store[mode].monthlyUsageKwh,
    monthlyBillRm: store[mode].monthlyBillRm,
    operatingHours: store[mode].operatingHours,
    roomsOrZones: store[mode].roomsOrZones,
    estimatedWastePercent: store[mode].estimatedWastePercent,
    potentialSavingsRm: store[mode].potentialSavingsRm,
    carbonReductionKg: store[mode].carbonReductionKg,
    mainProblem: store[mode].mainProblem,
    usageTrend: store[mode].usageTrend || [],
    zones: store[mode].zones || store[mode].occupancyZones || [],
    hardwareStatus: store[mode].hardwareStatus || [],
    featureAccess: store[mode].featureAccess || {},
    summary: withComputedFinancials(mode),
    trends: {
      range,
      unit: "kWh",
      data: trends
    },
    devices: withDeviceCosts(mode),
    recommendations: store[mode].recommendations || [],
    notifications: store[mode].notifications || [],
    settings: store[mode].settings || {},
    occupancyZones: store[mode].occupancyZones || [],
    twinScenarios: store[mode].twinScenarios || [],
    peakPlan: store[mode].peakPlan || { intervals: [], optimizedTrend: [] },
    automationRules: store[mode].automationRules || [],
    approvalQueue: store[mode].approvalQueue || [],
    auditLog: store[mode].auditLog || [],
    roiModel: store[mode].roiModel || {},
    retrofitPlan: store[mode].retrofitPlan || [],
    anomalies: store[mode].anomalies || [],
    carbonStory: store[mode].carbonStory || {},
    energyScore: store[mode].energyScore || {}
  };
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body || "{}");
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function responseDashboard(mode, range = "hourly") {
  return dashboardPayload(mode, range);
}

async function saveSettings(body) {
  const mode = getMode(body);
  const settings = body.settings || {};
  store[mode] = recomputeDashboardMetrics({
    ...store[mode],
    monthlyUsageKwh: settings.monthlyUsageKwh ?? store[mode].monthlyUsageKwh,
    monthlyBillRm: settings.monthlyBillRm ?? store[mode].monthlyBillRm,
    operatingHours: settings.operatingHours ?? store[mode].operatingHours,
    roomsOrZones: settings.roomsOrZones ?? store[mode].roomsOrZones,
    settings: {
      ...store[mode].settings,
      ...settings
    },
    summary: {
      ...(store[mode].summary || {}),
      projectedMonthlyKwh: settings.monthlyUsageKwh ?? store[mode].summary?.projectedMonthlyKwh,
      monthlyUsageKwh: settings.monthlyUsageKwh ?? store[mode].summary?.monthlyUsageKwh,
      monthlyBillRm: settings.monthlyBillRm ?? store[mode].summary?.monthlyBillRm
    }
  });

  return {
    message: "Settings saved",
    settings: store[mode].settings,
    summary: withComputedFinancials(mode),
    dashboard: responseDashboard(mode, body.range)
  };
}

async function controlDevice(body) {
  const mode = getMode(body);
  const { deviceId, deviceAction } = body;
  const device = (store[mode].devices || []).find((item) => item.id === deviceId);

  if (!device) {
    const error = new Error(`Device "${deviceId}" was not found.`);
    error.statusCode = 404;
    throw error;
  }

  if (!device.controlEnabled) {
    const error = new Error(`${device.name} is marked as a critical or locked load and cannot be controlled in this prototype.`);
    error.statusCode = 409;
    throw error;
  }

  const updatedDevices = (store[mode].devices || []).map((item) => {
    if (item.id !== deviceId) return item;

    if (deviceAction === "turn-off") {
      return {
        ...item,
        isOn: false,
        status: "Standby",
        usageKwh: money(Number(item.usageKwh || 0) * 0.92)
      };
    }

    if (deviceAction === "turn-on") {
      return {
        ...item,
        isOn: true,
        status: item.trendPercent > 15 ? "Overconsuming" : "Running"
      };
    }

    if (deviceAction === "simulate-ai") {
      return {
        ...item,
        isOn: true,
        status: "Optimized",
        usageKwh: money(Number(item.usageKwh || 0) * 0.96)
      };
    }

    const error = new Error("Unsupported action. Use turn-on, turn-off, or simulate-ai.");
    error.statusCode = 400;
    throw error;
  });

  let nextDashboard = {
    ...store[mode],
    devices: updatedDevices
  };
  nextDashboard = appendAuditLog(nextDashboard, {
    action: `Device command: ${deviceAction}`,
    target: device.name,
    status: "Accepted",
    impactKwh: deviceAction === "turn-off" ? money(Number(device.usageKwh || 0) * 0.08) : deviceAction === "simulate-ai" ? money(Number(device.usageKwh || 0) * 0.04) : 0,
    note: "Manual control simulation updated the device state."
  });
  nextDashboard = appendNotification(nextDashboard, {
    title: "Device control simulated",
    message: `${device.name} accepted command "${deviceAction}".`,
    severity: "Normal"
  });
  store[mode] = recomputeDashboardMetrics(nextDashboard);
  const dashboard = responseDashboard(mode, body.range);
  const updatedDevice = dashboard.devices.find((item) => item.id === deviceId);

  return {
    message: `Control command "${deviceAction}" accepted for ${device.name}.`,
    device: updatedDevice,
    dashboard,
    safetyNote
  };
}

async function simulateOptimization(body) {
  const mode = getMode(body);
  const preview = simulateDashboardOptimization(store[mode], body.scenarioId);

  return {
    message: preview.scenario ? `${preview.scenario.name} simulation completed.` : "No optimization scenario found.",
    scenario: preview.scenario,
    simulation: preview.simulation,
    dashboard: responseDashboard(mode, body.range)
  };
}

async function applyOptimization(body) {
  const mode = getMode(body);
  store[mode] = applyOptimizationScenario(store[mode], body.scenarioId);
  const dashboard = responseDashboard(mode, body.range);

  return {
    message: "Optimization scenario applied to the digital twin.",
    dashboard,
    auditEntry: dashboard.auditLog?.[0],
    safetyNote
  };
}

async function simulateRecommendation(body) {
  const mode = getMode(body);
  const simulation = simulateRecommendationImpact(store[mode], body.recommendationId);

  if (!simulation) {
    const error = new Error(`Recommendation "${body.recommendationId}" was not found.`);
    error.statusCode = 404;
    throw error;
  }

  return {
    message: "Recommendation impact simulated.",
    ...simulation,
    dashboard: responseDashboard(mode, body.range)
  };
}

async function applyRecommendation(body) {
  const mode = getMode(body);
  store[mode] = applyRecommendationToDashboard(store[mode], body.recommendationId);
  const dashboard = responseDashboard(mode, body.range);

  return {
    message: "AI recommendation applied to the dashboard simulation.",
    dashboard,
    auditEntry: dashboard.auditLog?.[0],
    safetyNote
  };
}

async function requestApproval(body) {
  const mode = getMode(body);
  store[mode] = requestApprovalForRecommendation(store[mode], body.recommendationId);
  const dashboard = responseDashboard(mode, body.range);
  const approval = (dashboard.approvalQueue || []).find(
    (item) => item.recommendationId === body.recommendationId && item.status === "Pending"
  );

  return {
    message: "Approval request added to the safety queue.",
    dashboard,
    approval
  };
}

async function approveAction(body) {
  const mode = getMode(body);
  store[mode] = approvePendingAction(store[mode], body.approvalId);
  const dashboard = responseDashboard(mode, body.range);

  return {
    message: "Approval accepted and action applied in simulation.",
    dashboard,
    auditEntry: dashboard.auditLog?.[0],
    safetyNote
  };
}

async function rejectAction(body) {
  const mode = getMode(body);
  store[mode] = rejectPendingAction(store[mode], body.approvalId);
  const dashboard = responseDashboard(mode, body.range);

  return {
    message: "Approval request rejected. No energy action was applied.",
    dashboard,
    auditEntry: dashboard.auditLog?.[0]
  };
}

async function saveAutomationRule(body) {
  const mode = getMode(body);
  store[mode] = createAutomationRuleInDashboard(store[mode], body.rule || {});
  const dashboard = responseDashboard(mode, body.range);

  return {
    message: "Automation rule saved.",
    dashboard,
    rule: dashboard.automationRules?.[0],
    auditEntry: dashboard.auditLog?.[0],
    safetyNote
  };
}

async function toggleAutomationRule(body) {
  const mode = getMode(body);
  store[mode] = toggleAutomationRuleInDashboard(store[mode], body.ruleId, body.enabled);
  const dashboard = responseDashboard(mode, body.range);

  return {
    message: "Automation rule updated.",
    dashboard,
    rule: dashboard.automationRules?.find((item) => item.id === body.ruleId),
    auditEntry: dashboard.auditLog?.[0],
    safetyNote
  };
}

async function calculateRoi(body) {
  const mode = getMode(body);
  store[mode] = calculateRoiModel(store[mode], body.inputs || {});
  const dashboard = responseDashboard(mode, body.range);

  return {
    message: "ROI model recalculated.",
    roiModel: dashboard.roiModel,
    dashboard
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const url = getUrl(req);
      const mode = getMode(Object.fromEntries(url.searchParams));
      const range = url.searchParams.get("range") || "daily";

      sendJson(res, 200, dashboardPayload(mode, range));
      return;
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      const handlers = {
        "save-settings": saveSettings,
        "control-device": controlDevice,
        "simulate-optimization": simulateOptimization,
        "apply-optimization": applyOptimization,
        "simulate-recommendation": simulateRecommendation,
        "apply-recommendation": applyRecommendation,
        "request-approval": requestApproval,
        "save-automation-rule": saveAutomationRule,
        "toggle-automation-rule": toggleAutomationRule,
        "approve-action": approveAction,
        "reject-action": rejectAction,
        "calculate-roi": calculateRoi
      };

      const actionHandler = handlers[body.action];
      if (!actionHandler) {
        sendJson(res, 400, {
          message:
            "Unsupported action. Use save-settings, control-device, simulate-optimization, apply-optimization, simulate-recommendation, apply-recommendation, request-approval, save-automation-rule, toggle-automation-rule, approve-action, reject-action, or calculate-roi."
        });
        return;
      }

      sendJson(res, 200, await actionHandler(body));
      return;
    }

    res.setHeader("Allow", "GET, POST");
    sendJson(res, 405, { message: "Method not allowed" });
  } catch (error) {
    sendJson(res, error.statusCode || 500, {
      message: error.message || "Unexpected server error"
    });
  }
}
