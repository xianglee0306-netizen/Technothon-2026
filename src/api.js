const jsonHeaders = {
  "Content-Type": "application/json"
};

async function fetchJson(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...jsonHeaders,
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Request failed: ${response.status}`);
  }

  return response.json();
}

export async function getDashboard(mode, range) {
  const query = new URLSearchParams({ mode, range });
  const dashboard = await fetchJson(`/api/dashboard?${query}`);
  const { meta, ...dashboardData } = dashboard;
  return dashboardData;
}

export async function saveSettings(mode, settings, range) {
  return fetchJson("/api/dashboard", {
    method: "POST",
    body: JSON.stringify({ action: "save-settings", mode, settings, range })
  });
}

export async function controlDevice(mode, deviceId, action, range) {
  return fetchJson("/api/dashboard", {
    method: "POST",
    body: JSON.stringify({ action: "control-device", mode, deviceId, deviceAction: action, range })
  });
}

export async function simulateOptimization(mode, scenarioId, range) {
  return fetchJson("/api/dashboard", {
    method: "POST",
    body: JSON.stringify({ action: "simulate-optimization", mode, scenarioId, range })
  });
}

export async function applyOptimization(mode, scenarioId, range) {
  return fetchJson("/api/dashboard", {
    method: "POST",
    body: JSON.stringify({ action: "apply-optimization", mode, scenarioId, range })
  });
}

export async function simulateRecommendation(mode, recommendationId, range) {
  return fetchJson("/api/dashboard", {
    method: "POST",
    body: JSON.stringify({ action: "simulate-recommendation", mode, recommendationId, range })
  });
}

export async function applyRecommendation(mode, recommendationId, range) {
  return fetchJson("/api/dashboard", {
    method: "POST",
    body: JSON.stringify({ action: "apply-recommendation", mode, recommendationId, range })
  });
}

export async function requestApproval(mode, recommendationId, range) {
  return fetchJson("/api/dashboard", {
    method: "POST",
    body: JSON.stringify({ action: "request-approval", mode, recommendationId, range })
  });
}

export async function saveAutomationRule(mode, rule, range) {
  return fetchJson("/api/dashboard", {
    method: "POST",
    body: JSON.stringify({ action: "save-automation-rule", mode, rule, range })
  });
}

export async function toggleAutomationRule(mode, ruleId, enabled, range) {
  return fetchJson("/api/dashboard", {
    method: "POST",
    body: JSON.stringify({ action: "toggle-automation-rule", mode, ruleId, enabled, range })
  });
}

export async function approveAction(mode, approvalId, range) {
  return fetchJson("/api/dashboard", {
    method: "POST",
    body: JSON.stringify({ action: "approve-action", mode, approvalId, range })
  });
}

export async function rejectAction(mode, approvalId, range) {
  return fetchJson("/api/dashboard", {
    method: "POST",
    body: JSON.stringify({ action: "reject-action", mode, approvalId, range })
  });
}

export async function calculateRoi(mode, inputs, range) {
  return fetchJson("/api/dashboard", {
    method: "POST",
    body: JSON.stringify({ action: "calculate-roi", mode, inputs, range })
  });
}
