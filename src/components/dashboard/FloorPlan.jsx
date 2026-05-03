import { Activity, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { SoftCard } from "./HomeShell.jsx";

// Tier-specific room layouts. Coordinates are in a 0–100 viewBox so the SVG
// scales perfectly on phones. Each room is matched to a zone id from the
// dashboard's occupancyZones data so we can color-fill by waste/risk.
const layoutByMode = {
  residential: {
    label: "Home floor plan",
    rooms: [
      { id: "res-zone-living", name: "Living Area", x: 4, y: 6, w: 38, h: 32 },
      { id: "res-zone-kitchen", name: "Kitchen", x: 44, y: 6, w: 24, h: 22 },
      { id: "res-zone-office", name: "Home Office", x: 70, y: 6, w: 26, h: 22 },
      { id: "res-zone-bedroom", name: "Bedrooms", x: 44, y: 30, w: 52, h: 30 },
      { id: "res-zone-living-2", name: "Hallway", x: 4, y: 40, w: 38, h: 18 },
      { id: "res-zone-bath", name: "Bathroom", x: 4, y: 60, w: 18, h: 18 },
      { id: "res-zone-utility", name: "Utility", x: 24, y: 60, w: 20, h: 18 }
    ]
  },
  business: {
    label: "Café / Commercial floor plan",
    rooms: [
      { id: "bus-zone-customer", name: "Customer Area", x: 4, y: 6, w: 60, h: 36 },
      { id: "bus-zone-kitchen", name: "Kitchen / Prep", x: 66, y: 6, w: 30, h: 22 },
      { id: "bus-zone-cold", name: "Cold Storage", x: 66, y: 30, w: 30, h: 18 },
      { id: "bus-zone-storefront", name: "Storefront", x: 4, y: 44, w: 30, h: 22 },
      { id: "bus-zone-office", name: "Office", x: 36, y: 44, w: 28, h: 22 },
      { id: "bus-zone-back", name: "Back Room", x: 66, y: 50, w: 30, h: 18 },
      { id: "bus-zone-restroom", name: "Restroom", x: 4, y: 68, w: 30, h: 14 },
      { id: "bus-zone-storage", name: "Storage", x: 36, y: 68, w: 60, h: 14 }
    ]
  },
  enterprise: {
    label: "Facility zone map",
    rooms: [
      { id: "ent-zone-prod-a", name: "Production A", x: 4, y: 6, w: 36, h: 28 },
      { id: "ent-zone-prod-b", name: "Production B", x: 42, y: 6, w: 36, h: 28 },
      { id: "ent-zone-server", name: "Server Room", x: 80, y: 6, w: 16, h: 14 },
      { id: "ent-zone-compressor", name: "Compressor", x: 80, y: 22, w: 16, h: 12 },
      { id: "ent-zone-hvac", name: "HVAC System", x: 4, y: 36, w: 24, h: 22 },
      { id: "ent-zone-warehouse", name: "Warehouse", x: 30, y: 36, w: 48, h: 22 },
      { id: "ent-zone-lighting", name: "Lighting Zone", x: 80, y: 36, w: 16, h: 22 },
      { id: "ent-zone-office", name: "Office Area", x: 4, y: 60, w: 50, h: 22 },
      { id: "ent-zone-loading", name: "Loading Bay", x: 56, y: 60, w: 40, h: 22 }
    ]
  }
};

function zoneTone(zone) {
  if (!zone) return { fill: "rgba(34,211,238,0.05)", stroke: "rgba(148,163,184,0.25)", glow: "" };
  const risk = String(zone.risk || "Low").toLowerCase();
  const wasted = Number(zone.wastedKwh || 0);
  if (risk === "critical" || wasted > 8) {
    return {
      fill: "rgba(244,63,94,0.28)",
      stroke: "rgba(251,113,133,0.85)",
      glow: "url(#glow-critical)",
      level: "critical"
    };
  }
  if (risk === "high" || wasted > 3) {
    return {
      fill: "rgba(251,146,60,0.22)",
      stroke: "rgba(251,191,36,0.8)",
      glow: "url(#glow-warning)",
      level: "warning"
    };
  }
  if (risk === "medium" || wasted > 1) {
    return {
      fill: "rgba(250,204,21,0.18)",
      stroke: "rgba(253,224,71,0.7)",
      glow: "",
      level: "moderate"
    };
  }
  return {
    fill: "rgba(52,211,153,0.18)",
    stroke: "rgba(110,231,183,0.7)",
    glow: "",
    level: "good"
  };
}

function legendDot(level) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2.5 w-2.5 rounded-full ${level}`}
    />
  );
}

export default function FloorPlan({ mode = "residential", zones = [], currency = "MYR" }) {
  const [activeId, setActiveId] = useState(null);
  const layout = layoutByMode[mode] || layoutByMode.residential;

  // Build a map of zoneId -> zone data, with a fallback by name when ids
  // don't line up (defensive — data is normally clean, but profiles can shift).
  const zoneById = useMemo(() => {
    const map = new Map();
    (zones || []).forEach((zone) => {
      if (zone?.id) map.set(zone.id, zone);
    });
    return map;
  }, [zones]);

  const zoneByName = useMemo(() => {
    const map = new Map();
    (zones || []).forEach((zone) => {
      if (zone?.name) map.set(zone.name.toLowerCase(), zone);
    });
    return map;
  }, [zones]);

  function findZone(room) {
    return zoneById.get(room.id) || zoneByName.get(room.name.toLowerCase());
  }

  const activeRoom = layout.rooms.find((room) => room.id === activeId);
  const activeZone = activeRoom ? findZone(activeRoom) : null;
  const totalWastedKwh = (zones || []).reduce((sum, zone) => sum + Number(zone.wastedKwh || 0), 0);
  const totalWastedCost = (zones || []).reduce((sum, zone) => sum + Number(zone.wasteCost || 0), 0);

  return (
    <SoftCard variant="default" className="floorplan-soft">
      <div className="floorplan-soft__head">
        <div>
          <p className="card-eyebrow flex items-center gap-2">
            <MapPin size={13} aria-hidden="true" />
            Spatial heatmap
          </p>
          <h2 className="card-title">{layout.label}</h2>
        </div>
        <div className="floorplan-legend">
          <span className="floorplan-legend__item"><span className="legend-dot legend-dot--good" /> Optimized</span>
          <span className="floorplan-legend__item"><span className="legend-dot legend-dot--moderate" /> Moderate</span>
          <span className="floorplan-legend__item"><span className="legend-dot legend-dot--warning" /> Warning</span>
          <span className="floorplan-legend__item"><span className="legend-dot legend-dot--critical" /> Critical</span>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="floorplan-shell relative overflow-hidden rounded-2xl border border-cyan-300/15 bg-slate-950/55 p-3 sm:p-4">
          <svg viewBox="0 0 100 88" className="floorplan-svg block w-full" role="img" aria-label={`${layout.label} with zone status`}>
            <defs>
              <pattern id="grid-pattern" width="4" height="4" patternUnits="userSpaceOnUse">
                <path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(34,211,238,0.06)" strokeWidth="0.18" />
              </pattern>
              <filter id="glow-critical" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.7" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-warning" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect x="0" y="0" width="100" height="88" fill="url(#grid-pattern)" />
            <rect x="0.5" y="0.5" width="99" height="87" fill="none" stroke="rgba(103,232,249,0.18)" strokeWidth="0.25" rx="1.4" />

            {layout.rooms.map((room) => {
              const zone = findZone(room);
              const tone = zoneTone(zone);
              const isActive = activeId === room.id;
              const isCritical = tone.level === "critical";
              const labelX = room.x + room.w / 2;
              const labelY = room.y + room.h / 2;

              return (
                <g
                  key={room.id}
                  className={`floorplan-room ${isCritical ? "floorplan-room--critical" : ""}`}
                  onMouseEnter={() => setActiveId(room.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onFocus={() => setActiveId(room.id)}
                  onBlur={() => setActiveId(null)}
                  onClick={() => setActiveId((current) => (current === room.id ? null : room.id))}
                  tabIndex="0"
                  role="button"
                  aria-label={`${room.name}: ${zone?.risk || "Optimized"} risk, ${(zone?.wastedKwh || 0).toFixed(1)} kWh wasted`}
                >
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.w}
                    height={room.h}
                    rx="1.2"
                    ry="1.2"
                    fill={tone.fill}
                    stroke={tone.stroke}
                    strokeWidth={isActive ? 0.55 : 0.32}
                    filter={tone.glow}
                  />
                  <text
                    x={labelX}
                    y={labelY - 0.5}
                    textAnchor="middle"
                    fill="rgba(241,245,249,0.92)"
                    fontSize="2.2"
                    fontWeight="600"
                    style={{ pointerEvents: "none" }}
                  >
                    {room.name}
                  </text>
                  {zone ? (
                    <text
                      x={labelX}
                      y={labelY + 2.4}
                      textAnchor="middle"
                      fill="rgba(186,230,253,0.7)"
                      fontSize="1.6"
                      style={{ pointerEvents: "none" }}
                    >
                      {Math.round(zone.occupancyPercent || 0)}% used · {(zone.wastedKwh || 0).toFixed(1)} kWh
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>

          <div className="floorplan-corner-meta">
            <Activity size={11} aria-hidden="true" />
            Live occupancy + waste
          </div>
        </div>

        <div className="space-y-3">
          <div className="hud-tile rounded-2xl border border-cyan-300/18 bg-slate-950/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/65">Whole-{mode === "residential" ? "home" : mode === "business" ? "premise" : "facility"} waste</p>
            <p className="mt-2 text-2xl font-semibold text-white">{totalWastedKwh.toFixed(1)} kWh</p>
            <p className="mt-1 text-xs text-slate-400">≈ RM {totalWastedCost.toFixed(2)} avoidable per cycle</p>
          </div>

          {activeRoom && activeZone ? (
            <div className="hud-tile rounded-2xl border border-rose-300/22 bg-rose-400/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-100/80">{activeRoom.name}</p>
              <p className="mt-2 text-sm font-semibold text-white">{activeZone.loadStatus || "Tracking load"}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <span className="rounded-xl border border-white/10 bg-slate-950/30 px-2.5 py-2 text-slate-300">Occupancy: {Math.round(activeZone.occupancyPercent || 0)}%</span>
                <span className="rounded-xl border border-white/10 bg-slate-950/30 px-2.5 py-2 text-slate-300">Wasted: {(activeZone.wastedKwh || 0).toFixed(1)} kWh</span>
                <span className="rounded-xl border border-white/10 bg-slate-950/30 px-2.5 py-2 text-slate-300">Sensors: {activeZone.sensorType || "—"}</span>
                <span className="rounded-xl border border-white/10 bg-slate-950/30 px-2.5 py-2 text-slate-300">Risk: {activeZone.risk || "Low"}</span>
              </div>
              {activeZone.recommendation ? (
                <p className="mt-3 rounded-xl border border-cyan-300/22 bg-cyan-300/10 px-3 py-2 text-xs leading-5 text-cyan-50">
                  {activeZone.recommendation}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="hud-tile rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/65">Tap or hover a zone</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Each room is colored by its current waste signature. Critical zones pulse red — check them first.
              </p>
            </div>
          )}
        </div>
      </div>
    </SoftCard>
  );
}
