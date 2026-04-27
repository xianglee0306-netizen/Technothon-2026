git# GridSenseIQ

GridSenseIQ is a mobile-friendly smart energy monitoring prototype for an energy efficiency competition.

**Tagline:** AI-Powered Energy Intelligence for Smarter Buildings

It uses a Vite React frontend, a Vercel-style serverless API, Recharts, mock energy data, and localStorage for demo authentication, energy profiles, profile selection, settings, and dashboard customization.

## App Name Options

1. GridSenseIQ
2. WattWise Operations
3. EcoGrid Sentinel
4. Enervise Control
5. CarbonFlux Monitor

**Selected name:** GridSenseIQ

## Project Structure

```text
gridsense-iq/
  index.html
  package.json
  postcss.config.js
  vercel.json
  vite.config.js
  api/
    _data.js
    dashboard.js
  public/
    favicon.svg
  src/
    App.jsx
    api.js
    main.jsx
    styles.css
    components/
      ControlPanel.jsx
      CostAnalysis.jsx
      DeviceBreakdown.jsx
      EnergyTrendChart.jsx
      Header.jsx
      HighConsumptionRanking.jsx
      ModeSwitch.jsx
      NotificationsPanel.jsx
      RecommendationPanel.jsx
      SettingsPanel.jsx
      SummaryCards.jsx
      SustainabilityMetrics.jsx
      ui.jsx
```

## API Route

- `GET /api/dashboard?profileType=enterprise&range=hourly`
- `GET /api/dashboard?mode=residential&range=monthly`
- `POST /api/dashboard` with `action: "save-settings"`
- `POST /api/dashboard` with `action: "control-device"`

Use `profileType=enterprise` / `mode=enterprise` or `profileType=residential` / `mode=residential`.
Supported ranges are `hourly`, `daily`, `weekly`, and `monthly`.

## Run Locally

```bash
npm install
npm run dev
```

The React app and local API route run at `http://127.0.0.1:5173`.

To create a production build:

```bash
npm run build
```
