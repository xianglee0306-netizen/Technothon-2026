import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  applyOptimization,
  applyRecommendation,
  approveAction,
  calculateRoi,
  controlDevice,
  getDashboard,
  rejectAction,
  requestApproval,
  saveAutomationRule,
  saveSettings,
  simulateOptimization,
  simulateRecommendation,
  toggleAutomationRule
} from "../api.js";

const DashboardContext = createContext(null);

function mergeDashboard(current, response) {
  if (response?.dashboard) return response.dashboard;
  if (!response || !current) return current;

  return {
    ...current,
    summary: response.summary || current.summary,
    devices: response.devices || current.devices,
    recommendations: response.recommendations || current.recommendations,
    notifications: response.notifications || current.notifications,
    settings: response.settings || current.settings,
    automationRules: response.automationRules || current.automationRules,
    approvalQueue: response.approvalQueue || current.approvalQueue,
    auditLog: response.auditLog || current.auditLog,
    roiModel: response.roiModel || current.roiModel,
    anomalies: response.anomalies || current.anomalies,
    energyScore: response.energyScore || current.energyScore,
    carbonStory: response.carbonStory || current.carbonStory,
    twinScenarios: response.twinScenarios || current.twinScenarios,
    hardwareStatus: response.hardwareStatus || current.hardwareStatus,
    featureAccess: response.featureAccess || current.featureAccess,
    tier: response.tier || current.tier,
    target: response.target || current.target,
    trends: response.trends || current.trends
  };
}

export function DashboardProvider({ children }) {
  const [mode, setMode] = useState("residential");
  const [range, setRange] = useState("daily");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadDashboard = useCallback(async (nextMode = mode, nextRange = range) => {
    setLoading(true);
    setError("");
    try {
      const data = await getDashboard(nextMode, nextRange);
      setDashboard(data);
      setFeedback("Dashboard telemetry synced.");
    } catch (loadError) {
      setError(loadError?.message || "Dashboard data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [mode, range]);

  useEffect(() => {
    loadDashboard(mode, range);
  }, [loadDashboard, mode, range]);

  const runApiAction = useCallback(
    async (action, successMessage) => {
      setError("");
      try {
        const response = await action();
        setDashboard((current) => mergeDashboard(current, response));
        setFeedback(response?.message || successMessage || "Action completed.");
        return response;
      } catch (actionError) {
        const message = actionError?.message || "Action failed.";
        setError(message);
        throw actionError;
      }
    },
    []
  );

  const actions = useMemo(
    () => ({
      reload: () => loadDashboard(mode, range),
      setMode,
      setRange,
      saveSettings: (settings) => runApiAction(() => saveSettings(mode, settings, range), "Settings saved."),
      controlDevice: (deviceId, deviceAction) => runApiAction(() => controlDevice(mode, deviceId, deviceAction, range), "Device command accepted."),
      simulateOptimization: (scenarioId) =>
        runApiAction(() => simulateOptimization(mode, scenarioId, range), "Optimization simulation completed."),
      applyOptimization: (scenarioId) => runApiAction(() => applyOptimization(mode, scenarioId, range), "Optimization scenario applied."),
      simulateRecommendation: (recommendationId) =>
        runApiAction(() => simulateRecommendation(mode, recommendationId, range), "Recommendation impact simulated."),
      applyRecommendation: (recommendationId) =>
        runApiAction(() => applyRecommendation(mode, recommendationId, range), "Recommendation applied."),
      requestApproval: (recommendationId) => runApiAction(() => requestApproval(mode, recommendationId, range), "Approval requested."),
      saveAutomationRule: (rule) => runApiAction(() => saveAutomationRule(mode, rule, range), "Automation rule saved."),
      toggleAutomationRule: (ruleId, enabled) =>
        runApiAction(() => toggleAutomationRule(mode, ruleId, enabled, range), "Automation rule updated."),
      approveAction: (approvalId) => runApiAction(() => approveAction(mode, approvalId, range), "Approval accepted."),
      rejectAction: (approvalId) => runApiAction(() => rejectAction(mode, approvalId, range), "Approval rejected."),
      calculateRoi: (inputs) => runApiAction(() => calculateRoi(mode, inputs, range), "ROI model recalculated.")
    }),
    [loadDashboard, mode, range, runApiAction]
  );

  const activeAlerts = useMemo(
    () =>
      (dashboard?.notifications || []).filter((item) =>
        ["Critical", "Warning", "Hardware", "High"].includes(item.severity)
      ).length,
    [dashboard?.notifications]
  );

  const value = useMemo(
    () => ({
      activeAlerts,
      actions,
      dashboard,
      error,
      feedback,
      loading,
      mode,
      range
    }),
    [activeAlerts, actions, dashboard, error, feedback, loading, mode, range]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardData() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardData must be used inside DashboardProvider");
  }

  return context;
}
