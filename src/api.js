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

export async function getMeta() {
  const dashboard = await fetchJson("/api/dashboard");
  return dashboard.meta;
}

export async function getDashboard(mode, range) {
  const query = new URLSearchParams({ mode, range });
  const dashboard = await fetchJson(`/api/dashboard?${query}`);
  const { meta, ...dashboardData } = dashboard;
  return dashboardData;
}

export async function saveSettings(mode, settings) {
  return fetchJson("/api/dashboard", {
    method: "POST",
    body: JSON.stringify({ action: "save-settings", mode, settings })
  });
}

export async function controlDevice(mode, deviceId, action) {
  return fetchJson("/api/dashboard", {
    method: "POST",
    body: JSON.stringify({ action: "control-device", mode, deviceId, deviceAction: action })
  });
}
