# GridSense IQ

GridSense IQ is a mobile-friendly prototype for an energy efficiency competition. It uses a Vite React frontend and a Vercel serverless API.

## App Name Options

1. GridSense IQ
2. WattWise Operations
3. EcoGrid Sentinel
4. Enervise Control
5. CarbonFlux Monitor

**Selected name:** GridSense IQ

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

- `GET /api/dashboard?mode=enterprise&range=daily`
- `POST /api/dashboard` with `action: "save-settings"`
- `POST /api/dashboard` with `action: "control-device"`

Use `mode=enterprise` or `mode=residential`.

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
