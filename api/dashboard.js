import { appMeta, mockData } from "./_data.js";

const store = JSON.parse(JSON.stringify(mockData));

function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

function getUrl(req) {
  const host = req.headers?.host || "localhost";
  return new URL(req.url || "/api/dashboard", `http://${host}`);
}

function getMode(input = {}) {
  const mode = input.mode || input.profileType || "enterprise";

  if (!store[mode]) {
    const error = new Error(`Unsupported profile type "${mode}". Use "enterprise" or "residential".`);
    error.statusCode = 400;
    throw error;
  }

  return mode;
}

function money(value) {
  return Number(value.toFixed(2));
}

function withComputedFinancials(mode) {
  const data = store[mode];
  const tariff = Number(data.settings.tariffRate);

  return {
    ...data.summary,
    estimatedCost: money(data.summary.totalEnergyKwh * tariff),
    projectedMonthlyCost: money(data.summary.projectedMonthlyKwh * tariff),
    potentialSavingsCost: money(data.summary.potentialSavingsKwh * tariff),
    tariffRate: tariff,
    currency: data.settings.currency
  };
}

function withDeviceCosts(mode) {
  const tariff = Number(store[mode].settings.tariffRate);
  const total = store[mode].devices.reduce((sum, device) => sum + device.usageKwh, 0);

  return store[mode].devices.map((device) => ({
    ...device,
    costContribution: money(device.usageKwh * tariff),
    sharePercent: Number(((device.usageKwh / total) * 100).toFixed(1))
  }));
}

function dashboardPayload(mode, range) {
  const trends = store[mode].trends[range];

  if (!trends) {
    const error = new Error(`Unsupported range "${range}". Use hourly, daily, weekly, or monthly.`);
    error.statusCode = 400;
    throw error;
  }

  return {
    meta: appMeta,
    summary: withComputedFinancials(mode),
    trends: {
      range,
      unit: "kWh",
      data: trends
    },
    devices: withDeviceCosts(mode),
    recommendations: store[mode].recommendations,
    notifications: store[mode].notifications,
    settings: store[mode].settings
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

async function saveSettings(body) {
  const mode = getMode(body);
  const incomingSettings = body.settings || {};

  store[mode].settings = {
    ...store[mode].settings,
    ...incomingSettings
  };

  return {
    message: "Settings saved",
    settings: store[mode].settings,
    summary: withComputedFinancials(mode)
  };
}

async function controlDevice(body) {
  const mode = getMode(body);
  const { deviceId, deviceAction } = body;
  const device = store[mode].devices.find((item) => item.id === deviceId);

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

  if (deviceAction === "turn-off") {
    device.isOn = false;
    device.status = "Standby";
  } else if (deviceAction === "turn-on") {
    device.isOn = true;
    device.status = device.trendPercent > 15 ? "Overconsuming" : "Running";
  } else if (deviceAction === "simulate-ai") {
    device.status = "Idle";
    device.isOn = true;
  } else {
    const error = new Error("Unsupported action. Use turn-on, turn-off, or simulate-ai.");
    error.statusCode = 400;
    throw error;
  }

  return {
    message: `Control command "${deviceAction}" accepted for ${device.name}.`,
    device: {
      ...device,
      costContribution: money(device.usageKwh * Number(store[mode].settings.tariffRate))
    },
    safetyNote: "Prototype control only. Real deployment requires hardware validation, electrical safety approval, and authorized personnel."
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

      if (body.action === "save-settings") {
        sendJson(res, 200, await saveSettings(body));
        return;
      }

      if (body.action === "control-device") {
        sendJson(res, 200, await controlDevice(body));
        return;
      }

      sendJson(res, 400, { message: "Unsupported action. Use save-settings or control-device." });
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
