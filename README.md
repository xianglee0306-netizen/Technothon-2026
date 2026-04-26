# GridSense IQ

GridSense IQ is a mobile-friendly prototype for an energy efficiency competition. It demonstrates a smart-hardware-connected monitoring and management platform for Residential / SME and Enterprise / Industrial users, with the enterprise dashboard treated as the primary operational experience.

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
  vite.config.js
  public/
    favicon.svg
  server/
    index.js
    mockData.js
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

## API Routes

- `GET /api/health`
- `GET /api/meta`
- `GET /api/energy/summary?mode=enterprise`
- `GET /api/energy/trends?mode=enterprise&range=daily`
- `GET /api/energy/devices?mode=enterprise`
- `GET /api/recommendations?mode=enterprise`
- `GET /api/notifications?mode=enterprise`
- `GET /api/settings?mode=enterprise`
- `POST /api/settings`
- `POST /api/control/device`

Use `mode=enterprise` or `mode=residential`.

## Run Locally

```bash
npm install
npm run dev
```

The React app runs at `http://127.0.0.1:5173` and the Express API runs at `http://127.0.0.1:4000`.

If npm has trouble on your machine, use Corepack with pnpm:

```bash
corepack pnpm install
corepack pnpm dev
```

To create a production build:

```bash
npm run build
```
