const DEFAULT_CURRENCY = "MYR";
const CARBON_KG_PER_KWH = 0.67;

function cloneDashboard(dashboard = {}) {
  return JSON.parse(JSON.stringify(dashboard || {}));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function money(value) {
  return Number(Number(value || 0).toFixed(2));
}

function oneDecimal(value) {
  return Number(Number(value || 0).toFixed(1));
}

function clamp(value, min, max) {
  return Math.min(Math.max(Number(value || 0), min), max);
}

function idStamp(prefix) {
  return `${prefix}-${Date.now()}`;
}

function timeLabel() {
  return new Date().toLocaleTimeString("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function getTariff(dashboard) {
  return Number(dashboard?.settings?.tariffRate || dashboard?.summary?.tariffRate || 0.5);
}

function findScenario(dashboard, scenarioId) {
  const scenarios = asArray(dashboard?.twinScenarios);
  const aliases = {
    "peak-shaving": "peak-demand-shaving",
    "hvac-schedule": "hvac-schedule-optimization",
    "compressor-maintenance": "fault-maintenance",
    "full-ai": "full-ai-optimization"
  };
  const normalizedId = aliases[scenarioId] || scenarioId;

  return (
    scenarios.find((scenario) => scenario.id === normalizedId) ||
    scenarios.find((scenario) => scenario.id === scenarioId) ||
    scenarios.find((scenario) => scenario.id === "full-ai-optimization") ||
    scenarios.find((scenario) => scenario.id === "full-ai") ||
    scenarios[0] ||
    null
  );
}

function findRecommendation(dashboard, recommendationId) {
  return asArray(dashboard?.recommendations).find((recommendation) => recommendation.id === recommendationId) || null;
}

function withAdjustedTrendData(data, savingPercent) {
  const multiplier = 1 - clamp(savingPercent, 0, 90) / 100;

  return asArray(data).map((point) => ({
    ...point,
    kwh: point.kwh !== undefined ? money(Number(point.kwh || 0) * multiplier) : point.kwh,
    current: point.current !== undefined ? money(Number(point.current || 0) * multiplier) : point.current,
    optimized:
      point.optimized !== undefined
        ? money(Math.min(Number(point.optimized || 0), Number(point.current ?? point.kwh ?? point.optimized ?? 0) * multiplier))
        : point.optimized
  }));
}

export function appendAuditLog(dashboard, entry) {
  const next = cloneDashboard(dashboard);
  const auditEntry = {
    id: entry?.id || idStamp("audit"),
    time: entry?.time || timeLabel(),
    actor: entry?.actor || "GridSenseIQ AI",
    action: entry?.action || "Recorded simulated action",
    target: entry?.target || "Dashboard",
    status: entry?.status || "Recorded",
    impactKwh: money(entry?.impactKwh || 0),
    note: entry?.note || "Action recorded in the prototype audit trail."
  };

  next.auditLog = [auditEntry, ...asArray(next.auditLog)].slice(0, 40);
  return next;
}

export function appendNotification(dashboard, notification) {
  const next = cloneDashboard(dashboard);
  const nextNotification = {
    id: notification?.id || idStamp("notification"),
    type: notification?.type || "AI Action",
    title: notification?.title || "GridSenseIQ update",
    message: notification?.message || "The simulated dashboard has been updated.",
    time: notification?.time || timeLabel(),
    severity: notification?.severity || "Normal"
  };

  next.notifications = [nextNotification, ...asArray(next.notifications)].slice(0, 30);
  return next;
}

export function updateRecommendationStatus(dashboard, recommendationId, status) {
  const next = cloneDashboard(dashboard);
  next.recommendations = asArray(next.recommendations).map((recommendation) =>
    recommendation.id === recommendationId
      ? {
          ...recommendation,
          status,
          updatedAt: timeLabel()
        }
      : recommendation
  );

  return next;
}

export function recomputeTrendAfterSavings(dashboard, savingPercent) {
  const next = cloneDashboard(dashboard);

  if (next.trends?.data) {
    next.trends = {
      ...next.trends,
      data: withAdjustedTrendData(next.trends.data, savingPercent)
    };
    return next;
  }

  if (next.trends && typeof next.trends === "object") {
    next.trends = Object.fromEntries(
      Object.entries(next.trends).map(([range, data]) => [range, Array.isArray(data) ? withAdjustedTrendData(data, savingPercent) : data])
    );
  }

  return next;
}

export function recomputeSummaryFromDevices(dashboard) {
  const next = cloneDashboard(dashboard);
  const tariff = getTariff(next);
  const devices = asArray(next.devices);
  const totalEnergyKwh = money(devices.reduce((sum, device) => sum + Number(device.usageKwh || 0), 0));
  const previousSummary = next.summary || {};
  const previousTotal = Number(previousSummary.totalEnergyKwh || totalEnergyKwh || 1);
  const projectedBase = Number(previousSummary.projectedMonthlyKwh || totalEnergyKwh * 30);
  const projectedMonthlyKwh = money(previousTotal > 0 ? (projectedBase * totalEnergyKwh) / previousTotal : totalEnergyKwh * 30);
  const potentialSavingsKwh = money(Math.max(Number(previousSummary.potentialSavingsKwh || 0), 0));
  const carbonKg = money(totalEnergyKwh * CARBON_KG_PER_KWH);
  const totalForShare = totalEnergyKwh || 1;

  next.devices = devices.map((device) => ({
    ...device,
    usageKwh: money(device.usageKwh),
    costContribution: money(Number(device.usageKwh || 0) * tariff),
    sharePercent: oneDecimal((Number(device.usageKwh || 0) / totalForShare) * 100)
  }));

  next.summary = {
    ...previousSummary,
    totalEnergyKwh,
    carbonKg,
    projectedMonthlyKwh,
    estimatedCost: money(totalEnergyKwh * tariff),
    projectedMonthlyCost: money(projectedMonthlyKwh * tariff),
    potentialSavingsKwh,
    potentialSavingsCost: money(potentialSavingsKwh * tariff),
    tariffRate: tariff,
    currency: next.settings?.currency || previousSummary.currency || DEFAULT_CURRENCY
  };

  return next;
}

function recomputeOccupancyZones(dashboard) {
  const next = cloneDashboard(dashboard);
  const tariff = getTariff(next);

  next.occupancyZones = asArray(next.occupancyZones).map((zone) => {
    const currentKwh = money(zone.currentKwh);
    const baselineKwh = money(zone.baselineKwh);
    const wastedKwh = money(zone.wastedKwh ?? Math.max(currentKwh - baselineKwh, 0));
    const occupancy = Number(zone.occupancyPercent || 0);
    const risk = zone.risk || (occupancy <= 5 && wastedKwh > 1 ? "Critical" : occupancy <= 25 && wastedKwh > 0.5 ? "High" : wastedKwh > 0.2 ? "Medium" : "Low");

    return {
      ...zone,
      currentKwh,
      baselineKwh,
      wastedKwh,
      wasteCost: money(wastedKwh * tariff),
      risk
    };
  });

  const occupancyWasteKwh = money(next.occupancyZones.reduce((sum, zone) => sum + Number(zone.wastedKwh || 0), 0));

  next.summary = {
    ...(next.summary || {}),
    occupancyWasteKwh,
    occupancyWasteCost: money(occupancyWasteKwh * tariff)
  };

  return next;
}

export function recomputeCarbonStory(dashboard) {
  const next = cloneDashboard(dashboard);
  const summary = next.summary || {};
  const currentMonthlyKg = money(Number(summary.carbonKg || 0) * 30);
  const reductionKg = money(Math.max(Number(summary.potentialSavingsKwh || 0) * 30 * CARBON_KG_PER_KWH, 0));
  const optimizedMonthlyKg = money(Math.max(currentMonthlyKg - reductionKg, 0));
  const treeEquivalent = Math.max(1, Math.round(reductionKg / 22));
  const carKmAvoided = Math.round(reductionKg / 0.24);

  next.carbonStory = {
    ...(next.carbonStory || {}),
    currentMonthlyKg,
    optimizedMonthlyKg,
    reductionKg,
    treeEquivalent,
    carKmAvoided,
    phoneChargesEquivalent: Math.round(reductionKg * 125),
    ledBulbHoursEquivalent: Math.round(reductionKg * 100),
    story: `Applying today's AI optimization could reduce about ${Math.round(reductionKg).toLocaleString()} kg CO2e monthly, roughly equivalent to planting ${treeEquivalent.toLocaleString()} trees.`
  };

  next.summary = {
    ...summary,
    carbonReductionPotentialKg: reductionKg
  };

  return next;
}

export function recomputeEnergyScore(dashboard) {
  const next = cloneDashboard(dashboard);
  const summary = next.summary || {};
  const rules = asArray(next.automationRules);
  const zones = asArray(next.occupancyZones);
  const retrofit = asArray(next.retrofitPlan);
  const totalZoneKwh = zones.reduce((sum, zone) => sum + Number(zone.currentKwh || 0), 0) || 1;
  const wasteKwh = zones.reduce((sum, zone) => sum + Number(zone.wastedKwh || 0), 0);
  const automationReadiness = rules.length ? Math.round((rules.filter((rule) => rule.enabled).length / rules.length) * 100) : 70;
  const wasteReduction = clamp(100 - (Number(summary.potentialSavingsKwh || 0) / Math.max(Number(summary.totalEnergyKwh || 1), 1)) * 100, 0, 100);
  const carbonPerformance = clamp(summary.co2TargetProgress || 75, 0, 100);
  const costEfficiency = clamp(summary.efficiencyScore || 75, 0, 100);
  const occupancyAlignment = clamp(100 - (wasteKwh / totalZoneKwh) * 100, 0, 100);
  const firstPeak = asArray(next.peakPlan?.intervals)[0];
  const peakPercent = Number(String(firstPeak?.expectedReductionPercent || "8").match(/\d+/)?.[0] || 8);
  const peakDemandControl = clamp(62 + peakPercent * 3, 0, 100);
  const retrofitReadiness = retrofit.length
    ? Math.round(
        (retrofit.reduce((sum, item) => sum + (item.installDifficulty === "Easy" ? 1 : item.installDifficulty === "Medium" ? 0.72 : 0.45), 0) /
          retrofit.length) *
          100
      )
    : 70;
  const overall = Math.round(
    (automationReadiness + wasteReduction + carbonPerformance + costEfficiency + occupancyAlignment + peakDemandControl + retrofitReadiness) / 7
  );

  next.energyScore = {
    overall,
    automationReadiness,
    wasteReduction: Math.round(wasteReduction),
    carbonPerformance,
    costEfficiency,
    occupancyAlignment: Math.round(occupancyAlignment),
    peakDemandControl,
    retrofitReadiness
  };

  next.summary = {
    ...summary,
    efficiencyScore: Math.max(Number(summary.efficiencyScore || 0), Math.round((costEfficiency + occupancyAlignment + automationReadiness) / 3))
  };

  return next;
}

function recomputeAnomalies(dashboard) {
  const next = cloneDashboard(dashboard);

  next.anomalies = asArray(next.anomalies).map((anomaly) => {
    const estimatedLossKwh = money(Math.max(Number(anomaly.estimatedLossKwh || 0), 0));
    const severity =
      estimatedLossKwh <= 0.2
        ? "Low"
        : Number(anomaly.deviationPercent || 0) >= 24
          ? "Critical"
          : Number(anomaly.deviationPercent || 0) >= 15
            ? "High"
            : "Medium";

    return {
      ...anomaly,
      estimatedLossKwh,
      severity,
      confidence: clamp(anomaly.confidence || 75, 0, 99)
    };
  });

  return next;
}

export function recomputeDashboardMetrics(dashboard) {
  let next = cloneDashboard(dashboard);
  next = recomputeSummaryFromDevices(next);
  next = recomputeOccupancyZones(next);
  next = recomputeCarbonStory(next);
  next = recomputeAnomalies(next);
  next = recomputeEnergyScore(next);
  return next;
}

export function simulateDashboardOptimization(dashboard, scenarioId) {
  const next = cloneDashboard(dashboard);
  const scenario = findScenario(next, scenarioId);
  if (!scenario) {
    return {
      dashboard: next,
      scenario: null,
      simulation: null
    };
  }

  const beforeKwh = Number(scenario.beforeKwh || next.summary?.totalEnergyKwh || 0);
  const afterKwh = Number(scenario.afterKwh || beforeKwh);
  const savingsKwh = money(scenario.savingsKwh ?? Math.max(beforeKwh - afterKwh, 0));
  const savingsPercent = beforeKwh ? oneDecimal((savingsKwh / beforeKwh) * 100) : 0;
  const tariff = getTariff(next);

  return {
    dashboard: next,
    scenario,
    simulation: {
      scenarioId: scenario.id,
      beforeKwh: money(beforeKwh),
      afterKwh: money(afterKwh),
      savingsKwh,
      savingsPercent,
      savingsCost: money(scenario.savingsCost ?? savingsKwh * tariff),
      co2ReductionKg: money(scenario.co2ReductionKg ?? savingsKwh * CARBON_KG_PER_KWH),
      scoreBefore: Number(scenario.scoreBefore || next.summary?.efficiencyScore || 0),
      scoreAfter: Number(scenario.scoreAfter || Math.min(Number(next.summary?.efficiencyScore || 0) + 8, 100)),
      confidence: Number(scenario.confidence || 85),
      explanation: `${scenario.name} projects ${savingsKwh.toLocaleString()} kWh savings with ${scenario.confidence || 85}% confidence.`
    }
  };
}

export function applyOptimizationScenario(dashboard, scenarioId) {
  const preview = simulateDashboardOptimization(dashboard, scenarioId);
  const scenario = preview.scenario;
  if (!scenario) return recomputeDashboardMetrics(dashboard);

  const savingsPercent = Number(preview.simulation.savingsPercent || 0);
  const multiplier = 1 - savingsPercent / 100;
  let next = cloneDashboard(dashboard);

  next.devices = asArray(next.devices).map((device) => {
    const isProtected = !device.controlEnabled || String(device.type || "").toLowerCase().includes("critical");
    const reductionMultiplier = isProtected ? 1 - savingsPercent / 300 : multiplier;

    return {
      ...device,
      usageKwh: money(Number(device.usageKwh || 0) * reductionMultiplier),
      status: isProtected ? device.status : device.isOn ? "Optimized" : "Standby"
    };
  });

  next.occupancyZones = asArray(next.occupancyZones).map((zone) => ({
    ...zone,
    currentKwh: money(Number(zone.currentKwh || 0) * multiplier),
    wastedKwh: money(Number(zone.wastedKwh || 0) * Math.max(0.2, multiplier - 0.08)),
    risk: zone.risk === "Critical" ? "High" : zone.risk === "High" ? "Medium" : zone.risk
  }));

  next.anomalies = asArray(next.anomalies).map((anomaly) => ({
    ...anomaly,
    deviationPercent: Math.max(0, Math.round(Number(anomaly.deviationPercent || 0) * Math.max(0.35, multiplier))),
    estimatedLossKwh: money(Number(anomaly.estimatedLossKwh || 0) * Math.max(0.25, multiplier - 0.1)),
    severity: anomaly.severity === "Critical" ? "High" : anomaly.severity === "High" ? "Medium" : anomaly.severity
  }));

  next.recommendations = asArray(next.recommendations).map((recommendation) =>
    recommendation.status === "Applied"
      ? recommendation
      : {
          ...recommendation,
          status: scenario.id === "full-ai-optimization" ? "Covered by full optimization" : recommendation.status
        }
  );

  next = recomputeTrendAfterSavings(next, savingsPercent);
  next = recomputeDashboardMetrics(next);
  next.summary = {
    ...next.summary,
    efficiencyScore: Math.max(next.summary.efficiencyScore || 0, Number(scenario.scoreAfter || 0))
  };
  next = recomputeEnergyScore(next);
  next = appendAuditLog(next, {
    action: "Applied optimization scenario",
    target: scenario.name,
    status: "Applied",
    impactKwh: preview.simulation.savingsKwh,
    note: scenario.description
  });
  next = appendNotification(next, {
    title: "Digital twin scenario applied",
    message: `${scenario.name} updated energy, cost, carbon, trend, and score projections.`,
    severity: "Normal"
  });

  return recomputeDashboardMetrics(next);
}

export function simulateRecommendationImpact(dashboard, recommendationId) {
  const recommendation = findRecommendation(dashboard, recommendationId);
  if (!recommendation) return null;

  const projectedSavingsKwh = money(recommendation.estimatedSavingsKwh || 0);
  const projectedSavingsCost = money(recommendation.estimatedSavingsCost || projectedSavingsKwh * getTariff(dashboard));
  const projectedCo2ReductionKg = money(recommendation.estimatedCo2ReductionKg || projectedSavingsKwh * CARBON_KG_PER_KWH);
  const currentScore = Number(dashboard?.summary?.efficiencyScore || dashboard?.energyScore?.overall || 70);
  const scoreLift = Math.max(1, Math.round((projectedSavingsKwh / Math.max(Number(dashboard?.summary?.totalEnergyKwh || 1), 1)) * 45));

  return {
    recommendationId,
    projectedSavingsKwh,
    projectedSavingsCost,
    projectedCo2ReductionKg,
    projectedEfficiencyScore: clamp(currentScore + scoreLift, 0, 100),
    explanation: `${recommendation.title} is projected to save ${projectedSavingsKwh.toLocaleString()} kWh with ${recommendation.confidence || 80}% confidence.`
  };
}

export function applyRecommendationToDashboard(dashboard, recommendationId) {
  const impact = simulateRecommendationImpact(dashboard, recommendationId);
  if (!impact) return recomputeDashboardMetrics(dashboard);

  const originalRecommendation = findRecommendation(dashboard, recommendationId);
  const alreadyApplied = originalRecommendation?.status === "Applied";
  const savingsKwh = alreadyApplied ? 0 : Number(impact.projectedSavingsKwh || 0);
  const totalBefore = Number(dashboard?.summary?.totalEnergyKwh || 1);
  const savingPercent = totalBefore ? clamp((savingsKwh / totalBefore) * 100, 0, 40) : 0;
  let next = cloneDashboard(dashboard);

  next.recommendations = asArray(next.recommendations).map((recommendation) =>
    recommendation.id === recommendationId
      ? {
          ...recommendation,
          status: "Applied",
          appliedAt: timeLabel()
        }
      : recommendation
  );

  next.devices = asArray(next.devices).map((device) => {
    const linked = device.id === originalRecommendation?.linkedDeviceId || asArray(originalRecommendation?.linkedDeviceIds).includes(device.id);
    if (!linked || savingsKwh <= 0) return device;

    return {
      ...device,
      usageKwh: money(Math.max(Number(device.usageKwh || 0) - savingsKwh, Number(device.usageKwh || 0) * 0.68)),
      trendPercent: Math.round(Number(device.trendPercent || 0) * 0.6),
      status: device.isOn ? "Optimized" : "Standby"
    };
  });

  next.occupancyZones = asArray(next.occupancyZones).map((zone) => {
    const linked = asArray(zone.linkedDeviceIds).includes(originalRecommendation?.linkedDeviceId);
    if (!linked) return zone;

    return {
      ...zone,
      currentKwh: money(Math.max(Number(zone.currentKwh || 0) - savingsKwh * 0.55, 0)),
      wastedKwh: money(Math.max(Number(zone.wastedKwh || 0) - savingsKwh * 0.45, 0)),
      risk: zone.risk === "Critical" ? "High" : zone.risk === "High" ? "Medium" : zone.risk === "Medium" ? "Low" : zone.risk
    };
  });

  next.anomalies = asArray(next.anomalies).map((anomaly) => {
    if (anomaly.deviceId !== originalRecommendation?.linkedDeviceId) return anomaly;

    return {
      ...anomaly,
      severity: "Low",
      deviationPercent: Math.max(0, Math.round(Number(anomaly.deviationPercent || 0) * 0.35)),
      estimatedLossKwh: money(Math.max(Number(anomaly.estimatedLossKwh || 0) - savingsKwh, 0)),
      detectedPattern: `${anomaly.detectedPattern} AI action reduced the simulated loss profile.`
    };
  });

  next.summary = {
    ...(next.summary || {}),
    potentialSavingsKwh: money(Math.max(Number(next.summary?.potentialSavingsKwh || 0) - savingsKwh * 0.55, 0)),
    efficiencyScore: clamp(Number(next.summary?.efficiencyScore || 0) + (originalRecommendation?.priority === "Critical" ? 4 : 2), 0, 100)
  };

  next = recomputeTrendAfterSavings(next, savingPercent);
  next = recomputeDashboardMetrics(next);
  next = appendAuditLog(next, {
    action: "Applied AI recommendation",
    target: originalRecommendation?.target || originalRecommendation?.title || "Recommendation",
    status: "Applied",
    impactKwh: impact.projectedSavingsKwh,
    note: originalRecommendation?.message || impact.explanation
  });
  next = appendNotification(next, {
    title: "AI action applied",
    message: `${originalRecommendation?.title || "Recommendation"} updated dashboard energy, cost, carbon, and score values.`,
    severity: originalRecommendation?.priority === "Critical" ? "High" : "Normal"
  });

  return recomputeDashboardMetrics(next);
}

export function requestApprovalForRecommendation(dashboard, recommendationId) {
  const recommendation = findRecommendation(dashboard, recommendationId);
  if (!recommendation) return recomputeDashboardMetrics(dashboard);

  const existing = asArray(dashboard.approvalQueue).find((approval) => approval.recommendationId === recommendationId && approval.status === "Pending");
  if (existing) {
    return updateRecommendationStatus(dashboard, recommendationId, "Pending Approval");
  }

  let next = cloneDashboard(dashboard);
  const approval = {
    id: idStamp("approval"),
    title: `Approve ${recommendation.title}`,
    target: recommendation.target || recommendation.title,
    recommendationId,
    riskLevel: recommendation.riskLevel || recommendation.priority || "Medium",
    expectedSavingsKwh: Number(recommendation.estimatedSavingsKwh || 0),
    reason: "Human approval is required before changing a safety-sensitive or operational load.",
    status: "Pending",
    requestedBy: "AI Recommendation Panel",
    requestedAt: timeLabel()
  };

  next.approvalQueue = [approval, ...asArray(next.approvalQueue)];
  next = updateRecommendationStatus(next, recommendationId, "Pending Approval");
  next = appendAuditLog(next, {
    action: "Requested approval",
    target: approval.target,
    status: "Pending Approval",
    impactKwh: approval.expectedSavingsKwh,
    note: approval.reason
  });
  next = appendNotification(next, {
    type: "Approval",
    title: "Approval requested",
    message: `${approval.title} was added to the safety queue.`,
    severity: "High"
  });

  return recomputeDashboardMetrics(next);
}

export function approvePendingAction(dashboard, approvalId) {
  const approval = asArray(dashboard?.approvalQueue).find((item) => item.id === approvalId);
  if (!approval) return recomputeDashboardMetrics(dashboard);

  let next = cloneDashboard(dashboard);
  next.approvalQueue = asArray(next.approvalQueue).map((item) =>
    item.id === approvalId
      ? {
          ...item,
          status: "Approved",
          reviewedAt: timeLabel()
        }
      : item
  );

  if (approval.recommendationId) {
    next = applyRecommendationToDashboard(next, approval.recommendationId);
  }

  next.approvalQueue = asArray(next.approvalQueue).map((item) =>
    item.id === approvalId
      ? {
          ...item,
          status: "Approved",
          reviewedAt: item.reviewedAt || timeLabel()
        }
      : item
  );
  next = appendAuditLog(next, {
    actor: "Authorized user",
    action: "Approved AI action",
    target: approval.target,
    status: "Approved",
    impactKwh: approval.expectedSavingsKwh,
    note: approval.reason
  });
  next = appendNotification(next, {
    type: "Approval",
    title: "AI action approved",
    message: `${approval.title} was approved and applied in the simulation.`,
    severity: "Normal"
  });

  return recomputeDashboardMetrics(next);
}

export function rejectPendingAction(dashboard, approvalId) {
  const approval = asArray(dashboard?.approvalQueue).find((item) => item.id === approvalId);
  if (!approval) return recomputeDashboardMetrics(dashboard);

  let next = cloneDashboard(dashboard);
  next.approvalQueue = asArray(next.approvalQueue).map((item) =>
    item.id === approvalId
      ? {
          ...item,
          status: "Rejected",
          reviewedAt: timeLabel()
        }
      : item
  );
  if (approval.recommendationId) {
    next = updateRecommendationStatus(next, approval.recommendationId, "Rejected by reviewer");
  }
  next = appendAuditLog(next, {
    actor: "Authorized user",
    action: "Rejected AI action",
    target: approval.target,
    status: "Rejected",
    impactKwh: 0,
    note: approval.reason
  });
  next = appendNotification(next, {
    type: "Approval",
    title: "AI action rejected",
    message: `${approval.title} was rejected. No energy-saving action was applied.`,
    severity: "Normal"
  });

  return recomputeDashboardMetrics(next);
}

export function toggleAutomationRuleInDashboard(dashboard, ruleId, enabled) {
  let next = cloneDashboard(dashboard);
  const rule = asArray(next.automationRules).find((item) => item.id === ruleId);

  next.automationRules = asArray(next.automationRules).map((item) =>
    item.id === ruleId
      ? {
          ...item,
          enabled: Boolean(enabled),
          status: enabled ? "Monitoring" : "Disabled"
        }
      : item
  );
  next = appendAuditLog(next, {
    action: enabled ? "Enabled automation rule" : "Disabled automation rule",
    target: rule?.name || "Automation rule",
    status: enabled ? "Monitoring" : "Disabled",
    impactKwh: enabled ? Number(rule?.estimatedSavingsKwh || 0) : 0,
    note: rule?.requiresApproval ? "Rule includes a human approval guard." : "Low-risk simulated rule state changed."
  });
  next = appendNotification(next, {
    title: enabled ? "Automation rule enabled" : "Automation rule disabled",
    message: `${rule?.name || "Automation rule"} is now ${enabled ? "monitoring" : "disabled"}.`,
    severity: enabled && rule?.riskLevel === "Critical" ? "High" : "Normal"
  });

  return recomputeDashboardMetrics(next);
}

export function createAutomationRuleInDashboard(dashboard, rule) {
  let next = cloneDashboard(dashboard);
  const normalizedRule = {
    id: rule?.id || idStamp("rule"),
    name: rule?.name || "New simulated rule",
    condition: rule?.condition || "IF usage exceeds expected baseline",
    action: rule?.action || "THEN notify energy manager",
    enabled: rule?.enabled ?? true,
    riskLevel: rule?.riskLevel || "Medium",
    requiresApproval: Boolean(rule?.requiresApproval),
    estimatedSavingsKwh: Number(rule?.estimatedSavingsKwh || 0),
    lastTriggered: rule?.lastTriggered || "Not yet",
    status: rule?.enabled === false ? "Disabled" : "Monitoring"
  };

  next.automationRules = [normalizedRule, ...asArray(next.automationRules)];
  next = appendAuditLog(next, {
    action: "Created automation rule",
    target: normalizedRule.name,
    status: normalizedRule.status,
    impactKwh: normalizedRule.estimatedSavingsKwh,
    note: `${normalizedRule.condition} ${normalizedRule.action}`
  });
  next = appendNotification(next, {
    title: "Automation rule created",
    message: `${normalizedRule.name} was added to the simulated rule engine.`,
    severity: normalizedRule.requiresApproval ? "High" : "Normal"
  });

  return recomputeDashboardMetrics(next);
}

export function calculateRoiModel(dashboard, inputs = {}) {
  let next = cloneDashboard(dashboard);
  const devices = asArray(next.devices);
  const tier = devices.some((device) => String(device.id || "").startsWith("ent-"))
    ? "enterprise"
    : devices.some((device) => String(device.id || "").startsWith("bus-"))
      ? "business"
      : "residential";
  const tierPricing = {
    residential: { zones: 5, sensors: 9, hwZone: 210, hwSensor: 95, install: 170, software: 360, sensorRatio: 2 },
    business: { zones: 8, sensors: 13, hwZone: 720, hwSensor: 220, install: 460, software: 1200, sensorRatio: 3 },
    enterprise: { zones: 8, sensors: 32, hwZone: 2100, hwSensor: 430, install: 1550, software: 5200, sensorRatio: 4 }
  };
  const pricing = tierPricing[tier];
  const packageName = inputs.packageName || inputs.package || next.roiModel?.packageName || "standard";
  const multiplier = packageName === "advanced" ? 1.35 : packageName === "basic" ? 0.72 : 1;
  const zones = Number(inputs.zones || inputs.zoneCount || next.roiModel?.assumptions?.zones || pricing.zones);
  const sensors = Number(inputs.sensors || inputs.sensorCount || next.roiModel?.assumptions?.sensors || Math.max(zones * pricing.sensorRatio, 1));
  const tariffRate = Number(inputs.tariffRate || next.settings?.tariffRate || 0.5);
  const hardwareCost =
    inputs.hardwareCost !== undefined && inputs.hardwareCost !== ""
      ? Number(inputs.hardwareCost)
      : money((zones * pricing.hwZone + sensors * pricing.hwSensor) * multiplier);
  const installationCost =
    inputs.installationCost !== undefined && inputs.installationCost !== ""
      ? Number(inputs.installationCost)
      : money(zones * pricing.install * multiplier);
  const softwareCost =
    inputs.softwareCost !== undefined && inputs.softwareCost !== ""
      ? Number(inputs.softwareCost)
      : money(pricing.software * multiplier);
  const estimatedMonthlySavingsKwh =
    inputs.estimatedMonthlySavingsKwh !== undefined && inputs.estimatedMonthlySavingsKwh !== ""
      ? Number(inputs.estimatedMonthlySavingsKwh)
      : money(Number(next.summary?.potentialSavingsKwh || 0) * 30);
  const estimatedMonthlySavingsCost =
    inputs.estimatedMonthlySavingsCost !== undefined && inputs.estimatedMonthlySavingsCost !== ""
      ? Number(inputs.estimatedMonthlySavingsCost)
      : money(estimatedMonthlySavingsKwh * tariffRate);
  const totalCost = money(hardwareCost + installationCost + softwareCost);
  const estimatedAnnualSavingsCost = money(estimatedMonthlySavingsCost * 12);
  const paybackMonths = estimatedMonthlySavingsCost > 0 ? oneDecimal(totalCost / estimatedMonthlySavingsCost) : 0;
  const roiPercent = totalCost > 0 ? oneDecimal(((estimatedAnnualSavingsCost - totalCost) / totalCost) * 100) : 0;

  next.roiModel = {
    packageName,
    hardwareCost: money(hardwareCost),
    installationCost: money(installationCost),
    softwareCost: money(softwareCost),
    totalCost,
    estimatedMonthlySavingsKwh: oneDecimal(estimatedMonthlySavingsKwh),
    estimatedMonthlySavingsCost: money(estimatedMonthlySavingsCost),
    estimatedAnnualSavingsCost,
    paybackMonths,
    roiPercent,
    carbonSavingsPerMonthKg: money(estimatedMonthlySavingsKwh * CARBON_KG_PER_KWH),
    assumptions: {
      tariffRate,
      zones,
      sensors
    }
  };
  next = appendAuditLog(next, {
    action: "Recalculated ROI model",
    target: `${packageName} retrofit package`,
    status: "Calculated",
    impactKwh: estimatedMonthlySavingsKwh,
    note: `Estimated payback is ${paybackMonths} months with ${roiPercent}% first-year ROI.`
  });

  return recomputeDashboardMetrics(next);
}
