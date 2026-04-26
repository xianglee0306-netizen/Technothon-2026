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
  return fetchJson("/api/meta");
}

export async function getDashboard(mode, range) {
  const query = new URLSearchParams({ mode });
  const trendQuery = new URLSearchParams({ mode, range });

  const [summary, trends, devices, recommendations, notifications, settings] = await Promise.all([
    fetchJson(`/api/energy/summary?${query}`),
    fetchJson(`/api/energy/trends?${trendQuery}`),
    fetchJson(`/api/energy/devices?${query}`),
    fetchJson(`/api/recommendations?${query}`),
    fetchJson(`/api/notifications?${query}`),
    fetchJson(`/api/settings?${query}`)
  ]);

  return {
    summary,
    trends,
    devices,
    recommendations,
    notifications,
    settings
  };
}

export async function saveSettings(mode, settings) {
  return fetchJson("/api/settings", {
    method: "POST",
    body: JSON.stringify({ mode, settings })
  });
}

export async function controlDevice(mode, deviceId, action) {
  return fetchJson("/api/control/device", {
    method: "POST",
    body: JSON.stringify({ mode, deviceId, action })
  });
}
