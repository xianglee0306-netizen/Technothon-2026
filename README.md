# GridSenseIQ

GridSenseIQ is a Vite + React smart energy management prototype for UM Technothon 2026. It presents an AI-assisted energy digital twin that helps users understand simulated electricity usage, detect waste, preview optimization scenarios, request approval for higher-risk actions, and estimate ROI before deploying real hardware.

The project is built as a judge-ready prototype for the theme **Smart Energy Management for a Sustainable Future**. It focuses on avoidable electricity waste from lighting, air-conditioning, refrigeration, HVAC, compressors, machines, appliances, and plug loads that continue running when they are not needed.

All telemetry, AI recommendations, control actions, approval decisions, ROI outputs, fault signals, and reports are simulated mock data. The app does not connect to real meters, TNB accounts, payment data, production hardware, or external AI APIs.

## Features

- Three operating profiles: Residential, Commercial, and Industry.
- Dashboard hub with tier-specific operational views.
- AI Energy Twin Simulator for before/after optimization scenarios.
- AI recommendations with confidence, savings, cost impact, carbon impact, simulation, apply, and approval request flows.
- Safety approval workflow for sensitive or higher-risk actions.
- Automation rule engine for simulated IF/THEN energy actions.
- Action audit log and notification center.
- ROI and payback calculator for retrofit planning.
- Fault detection and anomaly views.
- Research-style reports with printable/exportable output.
- Local setup page that stores calibrated profile values in browser `localStorage`.
- Vercel-style API route mounted locally by a custom Vite plugin.

## Tech Stack

- React 19
- React Router 7
- Vite 7
- Tailwind CSS 4 via PostCSS
- Recharts
- lucide-react
- Vercel serverless-style API handlers

## Requirements

- Node.js 20 or newer is recommended.
- npm, included with Node.js.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the app:

```text
http://127.0.0.1:5173
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The preview server uses:

```text
http://127.0.0.1:4173
```

## Available Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Starts the Vite development server on `127.0.0.1:5173`. |
| `npm run build` | Creates a production build in `dist/`. |
| `npm run preview` | Serves the production build locally on `127.0.0.1:4173`. |

## Project Structure

```text
GridSenseIQ-v18/
  api/
    _data.js                 Mock profile data for Residential, Commercial, and Industry
    dashboard.js             Vercel-style API handler for dashboard reads and actions
  docs/
    GridSenseIQ-Hardware-Spec.md
    GridSenseIQ-hardware-schematic.svg
  public/
    favicon.svg
    stitch_gridsense_iq_dashboard/
      ...                    Preserved design references and screenshots
  src/
    app/
      DashboardContext.jsx   Shared dashboard state, loading, feedback, and API actions
    components/
      dashboard/             Tier-specific dashboard surfaces
      effects/               Cursor, particles, reveal, and count-up effects
      landing/               Landing page sections
      notifications/         Notification bell and drawer
      slides/                Slide/deck primitives
      ApprovalWorkflow.jsx
      AutomationRulesPanel.jsx
      DeviceBreakdown.jsx
      EnergyTrendChart.jsx
      EnergyTwinSimulator.jsx
      RecommendationPanel.jsx
      ROICalculator.jsx
      SummaryCards.jsx
      ui.jsx
    pages/
      ActionsPage.jsx
      AiTwinPage.jsx
      AutomationPage.jsx
      DashboardHubPage.jsx
      DashboardPage.jsx
      FaultDetectionPage.jsx
      LandingPage.jsx
      ReportsPage.jsx
      ROIPage.jsx
      SettingsPage.jsx
      pageShared.jsx
    api.js                   Frontend API client
    App.jsx                  Router and app-level effects
    main.jsx                 React entry point
    simulationEngine.js      Deterministic simulation and recomputation logic
    styles.css               Global styling and Tailwind utilities
  index.html
  package.json
  postcss.config.js
  vercel.json
  vite.config.js
```

## Application Flow

1. `src/main.jsx` mounts the React app.
2. `src/App.jsx` defines browser routes and wraps the app in `DashboardProvider`.
3. `DashboardProvider` loads data from `/api/dashboard` and exposes state plus action methods.
4. UI pages call methods from the shared dashboard context.
5. `src/api.js` sends GET and POST requests to `/api/dashboard`.
6. `api/dashboard.js` reads or mutates the in-memory mock store.
7. `src/simulationEngine.js` recalculates energy, cost, carbon, device, zone, anomaly, audit, and score values after simulated actions.

## Main Routes

| Route | Purpose |
|---|---|
| `/` | Landing and project overview. |
| `/dashboard` | Dashboard hub and module navigation. |
| `/dashboard/details` | Tier-specific operational dashboard. |
| `/ai-twin` | AI Energy Twin Simulator. |
| `/actions` | AI recommendations and approval request entry points. |
| `/automation` | Automation rules, approval queue, and audit trail. |
| `/fault-detection` | Diagnostic/anomaly view. |
| `/roi` | ROI and payback calculator. |
| `/reports` | Operational report and print/export view. |
| `/setup` | Energy profile setup. |
| `/settings` | Preferences and assumptions. |

Legacy routes such as `/simulation`, `/recommendations`, `/business-case`, `/demo`, and `/system-log` redirect to current app routes.

## API

The local Vite server mounts a Vercel-style handler at:

```text
/api/dashboard
```

### GET Dashboard Data

```text
GET /api/dashboard?mode=residential&range=daily
GET /api/dashboard?mode=business&range=weekly
GET /api/dashboard?mode=enterprise&range=monthly
```

Supported profile values:

- `residential`
- `business`
- `enterprise`

Supported range values:

- `hourly`
- `daily`
- `weekly`
- `monthly`

The response contains profile metadata, summary metrics, trend data, devices, recommendations, notifications, settings, zones, twin scenarios, automation rules, approval queue, audit log, ROI model, retrofit plan, anomalies, carbon story, and energy score.

### POST Actions

All mutations use:

```text
POST /api/dashboard
Content-Type: application/json
```

Supported action names:

| Action | Purpose |
|---|---|
| `save-settings` | Save profile assumptions and recompute dashboard metrics. |
| `control-device` | Simulate a device command such as `turn-on`, `turn-off`, or `simulate-ai`. |
| `simulate-optimization` | Preview an AI Twin scenario. |
| `apply-optimization` | Apply an AI Twin scenario to the in-memory dashboard. |
| `simulate-recommendation` | Preview one recommendation's impact. |
| `apply-recommendation` | Apply a recommendation directly to the in-memory dashboard. |
| `request-approval` | Add a recommendation to the approval queue. |
| `save-automation-rule` | Create a simulated automation rule. |
| `toggle-automation-rule` | Enable or disable an automation rule. |
| `approve-action` | Approve a queued action and apply it in simulation. |
| `reject-action` | Reject a queued action without applying it. |
| `calculate-roi` | Recalculate ROI and payback assumptions. |

Example:

```json
{
  "action": "simulate-optimization",
  "mode": "enterprise",
  "range": "daily",
  "scenarioId": "full-ai-optimization"
}
```

Example:

```json
{
  "action": "control-device",
  "mode": "residential",
  "range": "daily",
  "deviceId": "res-ac",
  "deviceAction": "simulate-ai"
}
```

## Simulation Model

The prototype uses deterministic mock logic rather than live machine learning. The important behavior lives in `src/simulationEngine.js`:

- `recomputeDashboardMetrics` recalculates summary, zone waste, carbon story, anomaly severity, and energy score.
- `simulateDashboardOptimization` previews an AI Twin scenario.
- `applyOptimizationScenario` mutates device, trend, zone, anomaly, audit, and notification state.
- `simulateRecommendationImpact` previews one recommendation.
- `applyRecommendationToDashboard` updates linked devices and dashboard metrics.
- `requestApprovalForRecommendation`, `approvePendingAction`, and `rejectPendingAction` manage the safety queue.
- `createAutomationRuleInDashboard` and `toggleAutomationRuleInDashboard` manage automation rules.
- `calculateRoiModel` recalculates cost, payback, ROI, and carbon savings.

The API keeps state in memory, so API-driven changes persist only while the local dev or preview server is running. Restarting the server resets the API store to `api/_data.js`.

The setup/settings page also writes selected calibrated values to:

```text
localStorage["gridsenseiq:user-profile"]
```

Those values survive browser reloads and are used by the reports page for calibrated reporting.

## Demo Walkthrough

1. Open `/dashboard`.
2. Use the profile selector to switch between Residential, Commercial, and Industry.
3. Open `/dashboard/details` to view the active tier dashboard.
4. Open `/ai-twin`, choose a scenario, run the simulation, then apply it.
5. Open `/actions`, simulate a recommendation, apply it, or request approval.
6. Open `/automation`, create a rule, toggle rules, and review the approval queue.
7. Open `/roi` and adjust package or cost assumptions.
8. Open `/reports`, then export or print the report.
9. Open `/setup` or `/settings` to calibrate baseline usage, bill amount, tariff, targets, categories, and zones.

## Hardware Notes

Hardware planning documents are stored in `docs/`:

- `docs/GridSenseIQ-Hardware-Spec.md`
- `docs/GridSenseIQ-hardware-schematic.svg`

These documents describe a possible future physical deployment using smart plugs, circuit meters, ESP32 gateways, MQTT, relays, and approval-gated actuation. They are reference material only; this web app does not connect to those devices.

## Deployment Notes

`vercel.json` is configured for a Vite deployment:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

The `api/` folder contains the serverless-style handler. Locally, `vite.config.js` mounts that handler into the development and preview servers so the frontend can call `/api/dashboard` without a separate backend process.

## Known Limitations

- Data is simulated and stored in memory on the API side.
- The app has no authentication or authorization layer.
- The API accepts local prototype actions and is not hardened for production traffic.
- Higher-risk recommendations can currently be requested for approval, but the direct apply API path still exists for prototype convenience.
- There is no automated test suite in this repository yet.
- No real hardware, meter, TNB, MQTT, database, or external AI integration is active.

## Production Hardening Ideas

- Add request validation schemas for all API actions.
- Add automated unit tests for `simulationEngine.js`.
- Add integration tests for recommendation, approval, automation, ROI, and settings flows.
- Replace the in-memory store with a database.
- Add authentication, role-based approval permissions, and audit immutability.
- Separate direct apply actions from approval-gated actions.
- Add live telemetry ingestion through MQTT or a time-series backend.
- Add environment-specific configuration for API base URLs and deployment targets.

## License

This prototype is marked as private in `package.json`. Add a license before distributing or publishing the project publicly.
