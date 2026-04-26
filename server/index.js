import cors from "cors";
import express from "express";
import { appMeta, mockData } from "./mockData.js";

const app = express();
const port = process.env.PORT || 4000;
const store = JSON.parse(JSON.stringify(mockData));

app.use(cors());
app.use(express.json());

function getModeFromRequest(req) {
  const mode = req.query.mode || req.body.mode || "enterprise";

  if (!store[mode]) {
    const error = new Error(`Unsupported mode "${mode}". Use "enterprise" or "residential".`);
    error.status = 400;
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

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "GridSense IQ mock hardware API",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/meta", (_req, res) => {
  res.json(appMeta);
});

app.get("/api/energy/summary", (req, res, next) => {
  try {
    const mode = getModeFromRequest(req);
    res.json(withComputedFinancials(mode));
  } catch (error) {
    next(error);
  }
});

app.get("/api/energy/trends", (req, res, next) => {
  try {
    const mode = getModeFromRequest(req);
    const range = req.query.range || "daily";
    const trends = store[mode].trends[range];

    if (!trends) {
      return res.status(400).json({ message: `Unsupported range "${range}". Use daily, weekly, or monthly.` });
    }

    res.json({
      range,
      unit: "kWh",
      data: trends
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/energy/devices", (req, res, next) => {
  try {
    const mode = getModeFromRequest(req);
    res.json(withDeviceCosts(mode));
  } catch (error) {
    next(error);
  }
});

app.get("/api/recommendations", (req, res, next) => {
  try {
    const mode = getModeFromRequest(req);
    res.json(store[mode].recommendations);
  } catch (error) {
    next(error);
  }
});

app.get("/api/notifications", (req, res, next) => {
  try {
    const mode = getModeFromRequest(req);
    res.json(store[mode].notifications);
  } catch (error) {
    next(error);
  }
});

app.get("/api/settings", (req, res, next) => {
  try {
    const mode = getModeFromRequest(req);
    res.json(store[mode].settings);
  } catch (error) {
    next(error);
  }
});

app.post("/api/settings", (req, res, next) => {
  try {
    const mode = getModeFromRequest(req);
    const incomingSettings = req.body.settings || {};

    store[mode].settings = {
      ...store[mode].settings,
      ...incomingSettings
    };

    res.json({
      message: "Settings saved",
      settings: store[mode].settings,
      summary: withComputedFinancials(mode)
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/control/device", (req, res, next) => {
  try {
    const mode = getModeFromRequest(req);
    const { deviceId, action } = req.body;
    const device = store[mode].devices.find((item) => item.id === deviceId);

    if (!device) {
      return res.status(404).json({ message: `Device "${deviceId}" was not found.` });
    }

    if (!device.controlEnabled) {
      return res.status(409).json({
        message: `${device.name} is marked as a critical or locked load and cannot be controlled in this prototype.`
      });
    }

    if (action === "turn-off") {
      device.isOn = false;
      device.status = "Standby";
    } else if (action === "turn-on") {
      device.isOn = true;
      device.status = device.trendPercent > 15 ? "Overconsuming" : "Running";
    } else if (action === "simulate-ai") {
      device.status = "Idle";
      device.isOn = true;
    } else {
      return res.status(400).json({ message: "Unsupported action. Use turn-on, turn-off, or simulate-ai." });
    }

    res.json({
      message: `Control command "${action}" accepted for ${device.name}.`,
      device: {
        ...device,
        costContribution: money(device.usageKwh * Number(store[mode].settings.tariffRate))
      },
      safetyNote: "Prototype control only. Real deployment requires hardware validation and safety authorization."
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  res.status(error.status || 500).json({
    message: error.message || "Unexpected server error"
  });
});

app.listen(port, () => {
  console.log(`GridSense IQ API running at http://127.0.0.1:${port}`);
});
