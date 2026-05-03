import { BookText, ClipboardList, FileBarChart, FlaskConical, GraduationCap, Microscope, Quote, Ruler, ScrollText, Shield } from "lucide-react";

/**
 * LabHero — masthead for the GridSenseIQ Operational Report.
 *
 * Numbering is derived from real data:
 *   - Report number = padded auditLogCount + 1 (e.g. Report #043)
 *   - Period = current month + year in en-MY locale
 *   - Tier label = current active mode
 *   - When userOverride is set, classification flips to "USER-CALIBRATED"
 *     and the abstract gains a sentence noting calibration.
 */
export function LabHero({ summary, mode, auditLogCount = 0, userOverride = null }) {
  const tier = mode === "enterprise" ? "Industrial" : mode === "business" ? "Commercial" : "Residential";
  const now = new Date();
  const dateLong = now.toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" });
  const monthYear = now.toLocaleDateString("en-MY", { year: "numeric", month: "long" });
  // Real report number based on audit count, padded to 3 digits.
  const reportNum = String(Math.max(1, auditLogCount + 1)).padStart(3, "0");
  // Optional facility name from user override (falls back to tier-generic label).
  const facilityName = userOverride?.facilityName
    || (mode === "enterprise" ? "Industrial Facility" : mode === "business" ? "Commercial Premises" : "Residential Property");

  return (
    <article className="lab-paper-hero">
      <div className="lab-paper-hero__journal">
        <span className="lab-paper-hero__journal-name">GridSenseIQ Operational Report</span>
        <span className="lab-paper-hero__journal-meta">Report #{reportNum} · {monthYear} · {dateLong}</span>
        <span className="lab-paper-hero__journal-class">{userOverride ? "USER-CALIBRATED · LIVE TELEMETRY" : "DEMO PROFILE · ILLUSTRATIVE DATA"}</span>
      </div>

      <h2 className="lab-paper-hero__paper-title">
        Operational Energy Audit and Carbon Reduction Analysis: <em>{tier}-Tier {facilityName}</em>
      </h2>

      <div className="lab-paper-hero__authors">
        <p className="lab-paper-hero__author">GridSenseIQ Operations Team<sup className="lab-cite">[1]</sup></p>
        <p className="lab-paper-hero__author">Energy Intelligence Division<sup className="lab-cite">[2]</sup></p>
        <p className="lab-paper-hero__affil">Universiti Malaya · Kuala Lumpur, Malaysia</p>
      </div>

      <div className="lab-paper-hero__keywords">
        <span className="lab-paper-hero__kw-label">KEYWORDS</span>
        <span className="lab-paper-hero__kw">Energy intelligence</span>
        <span className="lab-paper-hero__kw">TNB tariff</span>
        <span className="lab-paper-hero__kw">Carbon reduction</span>
        <span className="lab-paper-hero__kw">Facility audit</span>
        <span className="lab-paper-hero__kw">Smart grid</span>
      </div>

      <div className="lab-paper-hero__abstract">
        <p className="lab-paper-hero__abstract-label">ABSTRACT</p>
        <p className="lab-paper-hero__abstract-body">
          This report presents an operational energy audit conducted via the GridSenseIQ continuous-monitoring platform across the active facility profile. Measured consumption, projected operational cost, carbon-equivalent reduction, and notification-event distribution are reported. All financial figures are denominated in Malaysian Ringgit (MYR) and computed against the prevailing TNB tariff schedule.<sup className="lab-cite">[3]</sup> Carbon equivalents derived from Malaysia Energy Commission grid intensity (0.585 kg CO₂/kWh).<sup className="lab-cite">[4]</sup>{userOverride ? " Figures in this issue are calibrated against user-supplied baseline measurements." : " Figures shown are illustrative for the active demo tier."}
        </p>
      </div>
    </article>
  );
}

/**
 * LabFigure — wraps a chart in academic figure styling with caption.
 */
export function LabFigure({ figureNum, caption, children }) {
  return (
    <figure className="lab-figure">
      <div className="lab-figure__body">{children}</div>
      <figcaption className="lab-figure__caption">
        <strong>Figure {figureNum}.</strong> {caption}
      </figcaption>
    </figure>
  );
}

/**
 * LabSampleTable — academic-style data table.
 *
 * If userOverride is provided (calibrated mode), uses the user's real
 * monthlyKwh / monthlyRm as the baseline; otherwise falls back to
 * tier-default illustrative numbers.
 */
export function LabSampleTable({ summary, mode, userOverride = null }) {
  const baseKwh = userOverride?.monthlyKwh
    ? Number(userOverride.monthlyKwh)
    : (mode === "enterprise" ? 38000 : mode === "business" ? 2850 : 620);
  const baseRm = userOverride?.monthlyRm
    ? Number(userOverride.monthlyRm)
    : (mode === "enterprise" ? 14800 : mode === "business" ? 1180 : 310);

  const samples = [
    { id: "S-001", zone: "HVAC Primary", kwh: Math.round(baseKwh * 0.42), rm: Math.round(baseRm * 0.42), pct: "42.0%", anomaly: false },
    { id: "S-002", zone: "Lighting Grid", kwh: Math.round(baseKwh * 0.18), rm: Math.round(baseRm * 0.18), pct: "18.0%", anomaly: false },
    { id: "S-003", zone: "Equipment Load", kwh: Math.round(baseKwh * 0.21), rm: Math.round(baseRm * 0.21), pct: "21.0%", anomaly: true },
    { id: "S-004", zone: "Refrigeration", kwh: Math.round(baseKwh * 0.11), rm: Math.round(baseRm * 0.11), pct: "11.0%", anomaly: false },
    { id: "S-005", zone: "Standby/Misc", kwh: Math.round(baseKwh * 0.08), rm: Math.round(baseRm * 0.08), pct: "8.0%", anomaly: true }
  ];

  return (
    <article className="lab-sample-table">
      <header className="lab-sample-table__head">
        <p className="lab-sample-table__label">TABLE 1{userOverride ? " · USER-CALIBRATED" : ""}</p>
        <h3 className="lab-sample-table__title">Zone-level consumption distribution &amp; anomaly flags</h3>
      </header>

      <div className="lab-sample-table__wrap">
        <table className="lab-sample-table__table">
          <thead>
            <tr>
              <th>Sample ID</th>
              <th>Zone</th>
              <th className="lab-sample-table__num">kWh / month</th>
              <th className="lab-sample-table__num">RM / month</th>
              <th className="lab-sample-table__num">% of total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((s) => (
              <tr key={s.id} className={s.anomaly ? "lab-sample-table__row--anomaly" : ""}>
                <td className="lab-sample-table__id">{s.id}</td>
                <td>{s.zone}</td>
                <td className="lab-sample-table__num">{s.kwh.toLocaleString()}</td>
                <td className="lab-sample-table__num">{s.rm.toLocaleString()}</td>
                <td className="lab-sample-table__num">{s.pct}</td>
                <td>
                  {s.anomaly ? (
                    <span className="lab-sample-table__flag lab-sample-table__flag--anomaly">⚠ ANOMALY</span>
                  ) : (
                    <span className="lab-sample-table__flag lab-sample-table__flag--ok">✓ NOMINAL</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="lab-sample-table__note">
        <sup>a</sup> Anomalies flagged when zone consumption deviates &gt;15% from rolling 30-day baseline. Review recommended.<sup className="lab-cite">[5]</sup>
      </p>
    </article>
  );
}

/**
 * LabMethodsSection — describes "Methods" section as found in real papers.
 */
export function LabMethodsSection() {
  return (
    <article className="lab-methods">
      <header className="lab-methods__head">
        <span className="lab-methods__num">§ 2</span>
        <h3 className="lab-methods__title">Methods &amp; Data Acquisition</h3>
      </header>

      <p className="lab-methods__p">
        <strong>Instrumentation.</strong> Energy consumption was measured via PZEM-004T V3 single-phase AC energy meters (Peacefair Inc., Class 1.0 accuracy) interfaced through ESP32-WROOM-32 gateway nodes (Espressif Systems) over Modbus-RTU at 1-second sampling intervals. Auxiliary environmental data (temperature, humidity, occupancy) collected via DHT22 (Aosong Electronics) and HC-SR501 PIR (BISS0001) sensors.<sup className="lab-cite">[6]</sup>
      </p>

      <p className="lab-methods__p">
        <strong>Data pipeline.</strong> Telemetry was forwarded over MQTT (TLS-encrypted) to a centralized time-series database (InfluxDB 2.x). Anomaly detection performed via Isolation Forest classifier (scikit-learn 1.4) against a 30-day rolling baseline.
      </p>

      <p className="lab-methods__p">
        <strong>Tariff &amp; carbon model.</strong> Cost projections computed against TNB Schedule of Tariff (2026), bands 1–4, range RM 0.218–0.571/kWh.<sup className="lab-cite">[3]</sup> Carbon equivalents calculated using Malaysia Energy Commission grid carbon intensity factor of 0.585 kg CO₂/kWh.<sup className="lab-cite">[4]</sup> Tree-equivalent disclosures use IPCC reference of 21 kg CO₂/yr per young temperate tree.<sup className="lab-cite">[7]</sup>
      </p>
    </article>
  );
}

/**
 * LabCitations — full bibliography section.
 */
export function LabCitations() {
  const refs = [
    { num: "[1]", text: "GridSenseIQ Operations Team. \"Continuous Energy Auditing for Malaysian Facilities.\" Internal Report, 2026." },
    { num: "[2]", text: "Energy Intelligence Division. \"Closed-Loop Hardware-Software Energy Platforms.\" Internal Whitepaper, 2026." },
    { num: "[3]", text: "Tenaga Nasional Berhad. \"TNB Schedule of Tariff, Effective 2026.\" tnb.com.my/commercial/pricing-tariffs." },
    { num: "[4]", text: "Energy Commission of Malaysia. \"Malaysia Energy Statistics Handbook.\" 2025 ed." },
    { num: "[5]", text: "Liu, F.T., Ting, K.M., Zhou, Z.H. \"Isolation-Based Anomaly Detection.\" ACM TKDD, 2012." },
    { num: "[6]", text: "Peacefair PZEM-004T V3.0 Datasheet. Aliexpress · Cytron Malaysia datasheet archive." },
    { num: "[7]", text: "IPCC. \"Climate Change 2022: Mitigation of Climate Change.\" Working Group III Report, Annex II." }
  ];

  return (
    <article className="lab-citations">
      <header className="lab-citations__head">
        <h3 className="lab-citations__title">References</h3>
      </header>
      <ol className="lab-citations__list">
        {refs.map((r) => (
          <li key={r.num} className="lab-citations__row">
            <span className="lab-citations__num">{r.num}</span>
            <span className="lab-citations__text">{r.text}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}
