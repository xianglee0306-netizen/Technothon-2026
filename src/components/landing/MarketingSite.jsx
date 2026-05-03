import { ArrowRight, ArrowUpRight, Building2, CheckCircle2, ChevronDown, Cpu, Home, Mail, MapPin, Radio, Server, ShieldCheck, Sparkles, Store, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * MarketingSite — long-form B2B marketing pages that scroll normally.
 * Lives below the slide-deck cinema mode. User toggles between modes via
 * the "View site" / "Watch presentation" buttons.
 *
 * Sections:
 *   - Sticky top nav with anchor links and CTAs
 *   - Hero band (text-only, no slide engine)
 *   - Trust strip
 *   - Problem / opportunity
 *   - How it works (the 4 layers)
 *   - Hardware showcase (BOM teaser + schematic ref)
 *   - Three tier products
 *   - Real use cases (Sarah, Ahmad, Lim)
 *   - Pricing per tier
 *   - FAQ accordion
 *   - Final CTA band
 *   - Full footer
 */
export default function MarketingSite({ onWatchPresentation, onTryDemo }) {
  return (
    <div className="ms" data-no-snap="true">
      <MsTopNav onWatchPresentation={onWatchPresentation} onTryDemo={onTryDemo} />
      <MsHero onTryDemo={onTryDemo} />
      <MsTrustStrip />
      <MsProblem />
      <MsHowItWorks />
      <MsHardware />
      <MsTiers onTryDemo={onTryDemo} />
      <MsUseCases />
      <MsPricing onTryDemo={onTryDemo} />
      <MsFaq />
      <MsFinalBand onTryDemo={onTryDemo} />
      <MsFooter onWatchPresentation={onWatchPresentation} />
    </div>
  );
}

/* ============================================================
   STICKY TOP NAV
   ============================================================ */

function MsTopNav({ onWatchPresentation, onTryDemo }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    function onScroll() {
      const target = document.querySelector(".ms");
      if (!target) return;
      setScrolled(target.scrollTop > 24);
    }
    const target = document.querySelector(".ms");
    if (!target) return undefined;
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <nav className={`ms-nav ${scrolled ? "ms-nav--scrolled" : ""}`}>
      <div className="ms-nav__inner">
        <div className="ms-nav__brand">
          <span className="ms-nav__brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M13 2 L4 14 L11 14 L9 22 L20 8 L13 8 Z" fill="currentColor" />
            </svg>
          </span>
          <span className="ms-nav__brand-text">GridSenseIQ</span>
        </div>

        <div className="ms-nav__links" role="navigation">
          <button type="button" onClick={() => scrollToSection("how")}>How it works</button>
          <button type="button" onClick={() => scrollToSection("hardware")}>Hardware</button>
          <button type="button" onClick={() => scrollToSection("tiers")}>Products</button>
          <button type="button" onClick={() => scrollToSection("pricing")}>Pricing</button>
          <button type="button" onClick={() => scrollToSection("faq")}>FAQ</button>
        </div>

        <div className="ms-nav__ctas">
          <button type="button" onClick={onWatchPresentation} className="ms-nav__cta-ghost">
            ◀ Cinema mode
          </button>
          <button type="button" onClick={onTryDemo} className="ms-nav__cta-primary">
            <span>Try the demo</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ============================================================
   HERO BAND
   ============================================================ */

function MsHero({ onTryDemo }) {
  return (
    <section className="ms-hero" id="top">
      <div className="ms-hero__bg" aria-hidden="true">
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" className="ms-hero__svg">
          <defs>
            <linearGradient id="ms-hero-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.18)" />
              <stop offset="100%" stopColor="rgba(167, 139, 250, 0.10)" />
            </linearGradient>
          </defs>
          <rect width="1200" height="600" fill="url(#ms-hero-grad)" />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1="0" y1={50 * i} x2="1200" y2={50 * i} stroke="rgba(186, 230, 253, 0.05)" strokeWidth="0.5" />
          ))}
        </svg>
      </div>

      <div className="ms-hero__inner">
        <p className="ms-eyebrow">
          <span className="ms-eyebrow__dot" aria-hidden="true" />
          UM Technothon 2026 · Smart Energy Management Track
        </p>

        <h1 className="ms-hero__title">
          Hardware-software energy intelligence,
          <br />
          <span className="ms-hero__title-grad">built for Malaysian electricity</span>
        </h1>

        <p className="ms-hero__sub">
          GridSenseIQ pairs <strong>real measurement hardware</strong> with <strong>AI recommendations</strong> to turn every kilowatt-hour into a clear ringgit-saving decision. From a single home to a multi-zone factory — one platform, three real products inside it.
        </p>

        <div className="ms-hero__ctas">
          <button type="button" onClick={onTryDemo} className="ms-cta ms-cta--primary">
            <span>Open the live demo</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <a href="#how" className="ms-cta ms-cta--ghost">
            <span>See how it works</span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>

        <p className="ms-hero__signal">
          Software gives insight. <strong>Hardware gives evidence.</strong>
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   TRUST STRIP
   ============================================================ */

function MsTrustStrip() {
  const items = [
    { value: "RM 0.218–0.571", label: "TNB tariff bands · 2026" },
    { value: "0.585", label: "kg CO₂ per kWh · MY grid" },
    { value: "1.2M+", label: "Malaysian businesses without intelligence" },
    { value: "SDG 7·11·12·13", label: "Aligned" }
  ];
  return (
    <section className="ms-trust">
      <div className="ms-section__inner ms-trust__inner">
        {items.map((item, i) => (
          <div key={i} className="ms-trust__item">
            <p className="ms-trust__value">{item.value}</p>
            <p className="ms-trust__label">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   PROBLEM SECTION
   ============================================================ */

function MsProblem() {
  return (
    <section className="ms-section ms-problem" id="problem">
      <div className="ms-section__inner">
        <div className="ms-section__header">
          <p className="ms-section__eyebrow">The problem</p>
          <h2 className="ms-section__title">
            Most facilities don't know <em>where</em> they waste electricity — only that the bill is too high.
          </h2>
          <p className="ms-section__lede">
            TNB sends a single monthly number. There's no per-room visibility, no per-device measurement, no actionable recommendations. Energy waste hides in plain sight.
          </p>
        </div>

        <div className="ms-problem__grid">
          {[
            { pct: "14–21%", label: "of every facility's electricity bill is avoidable waste — varies by tier" },
            { pct: "0", label: "real-time visibility into per-zone or per-device consumption for most users" },
            { pct: "RM 2,160", label: "annual savings missed by an average café — closing-time loads alone" },
            { pct: "100%", label: "of TNB bills give monthly totals, not actionable patterns" }
          ].map((stat, i) => (
            <article key={i} className="ms-problem__card">
              <p className="ms-problem__pct">{stat.pct}</p>
              <p className="ms-problem__label">{stat.label}</p>
            </article>
          ))}
        </div>

        <div className="ms-quote">
          <p className="ms-quote__mark">"</p>
          <p className="ms-quote__body">
            We knew the bill was high. We just didn't know <em>which appliance</em> was high. By the time we figured it out manually, we'd wasted a year of bills.
          </p>
          <p className="ms-quote__cite">— Common SME owner refrain across Malaysia</p>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   HOW IT WORKS — 4 layers
   ============================================================ */

function MsHowItWorks() {
  const layers = [
    { num: "01", icon: Radio, title: "Sense", text: "Smart plugs, current sensors, and panel meters capture real measurements at the device, circuit, and whole-building level. Every kWh becomes a verifiable data point." },
    { num: "02", icon: Server, title: "Aggregate", text: "An ESP32 gateway buffers, anomaly-checks, and forwards readings over MQTT/TLS to the cloud. Edge processing means privacy-respecting data, sub-second latency." },
    { num: "03", icon: Cpu, title: "Recommend", text: "AI ranks every action by RM saved, kWh cut, and CO₂ avoided. Tier-aware recommendations — never factory advice for homeowners. Confidence scoring on every suggestion." },
    { num: "04", icon: ShieldCheck, title: "Act", text: "User approves a recommendation. The platform schedules it. Hardware enforces it through smart switches or industrial contactors. Approval-gated for safety." }
  ];

  return (
    <section className="ms-section ms-how" id="how">
      <div className="ms-section__inner">
        <div className="ms-section__header">
          <p className="ms-section__eyebrow">How it works</p>
          <h2 className="ms-section__title">
            Four layers. <em>One closed loop.</em>
          </h2>
          <p className="ms-section__lede">
            Sensor measurement to enforced action — without humans typing data into spreadsheets.
          </p>
        </div>

        <div className="ms-how__steps">
          {layers.map((layer, i) => {
            const Icon = layer.icon;
            return (
              <article key={i} className="ms-how__step">
                <div className="ms-how__step-num">{layer.num}</div>
                <div className="ms-how__step-icon">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h3 className="ms-how__step-title">{layer.title}</h3>
                <p className="ms-how__step-text">{layer.text}</p>
                {i < layers.length - 1 ? (
                  <div className="ms-how__step-arrow" aria-hidden="true">
                    <ArrowRight size={18} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="ms-how__flow">
          <code className="ms-how__flow-text">
            Sensors → ESP32 Gateway → MQTT/TLS → Time-series Store → AI Engine → User App → Approved Command → Hardware Cutoff
          </code>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   HARDWARE SHOWCASE
   ============================================================ */

function MsHardware() {
  const components = [
    { name: "ESP32-WROOM-32", desc: "Dual-core gateway · WiFi+BLE", price: "RM 20–30", source: "Cytron MY" },
    { name: "PZEM-004T V3", desc: "AC energy meter · 80–260V · 100A CT", price: "RM 60–90", source: "Cytron MY" },
    { name: "Sonoff Smart Plug", desc: "16A · WiFi · per-device monitoring", price: "RM 35–55", source: "Shopee MY" },
    { name: "DHT22 Sensor", desc: "Temperature + humidity · ±0.5°C", price: "RM 12–18", source: "Myduino" },
    { name: "PIR HC-SR501", desc: "Motion · 7m range · zone occupancy", price: "RM 5–10", source: "Shopee MY" },
    { name: "4-CH Relay Module", desc: "Optoisolated · 250VAC/10A per ch", price: "RM 18–30", source: "Cytron MY" }
  ];

  return (
    <section className="ms-section ms-hardware" id="hardware">
      <div className="ms-section__inner">
        <div className="ms-section__header">
          <p className="ms-section__eyebrow">Hardware</p>
          <h2 className="ms-section__title">
            Off-the-shelf components. <em>Open protocols.</em> Buildable today.
          </h2>
          <p className="ms-section__lede">
            No custom PCBs, no vendor lock-in, no exotic parts. Every component on our BOM is in stock at Cytron Malaysia, Myduino, and Shopee right now.
          </p>
        </div>

        <div className="ms-hardware__grid">
          {components.map((c, i) => (
            <article key={i} className="ms-hardware__card">
              <div className="ms-hardware__card-top">
                <div className="ms-hardware__chip" aria-hidden="true">
                  <svg viewBox="0 0 40 40" width="32" height="32">
                    <rect x="6" y="6" width="28" height="28" rx="3" fill="rgba(56,189,248,0.18)" stroke="rgba(56,189,248,0.6)" strokeWidth="1.2" />
                    <line x1="2" y1="14" x2="6" y2="14" stroke="rgba(186,230,253,0.7)" strokeWidth="1" />
                    <line x1="2" y1="20" x2="6" y2="20" stroke="rgba(186,230,253,0.7)" strokeWidth="1" />
                    <line x1="2" y1="26" x2="6" y2="26" stroke="rgba(186,230,253,0.7)" strokeWidth="1" />
                    <line x1="34" y1="14" x2="38" y2="14" stroke="rgba(186,230,253,0.7)" strokeWidth="1" />
                    <line x1="34" y1="20" x2="38" y2="20" stroke="rgba(186,230,253,0.7)" strokeWidth="1" />
                    <line x1="34" y1="26" x2="38" y2="26" stroke="rgba(186,230,253,0.7)" strokeWidth="1" />
                  </svg>
                </div>
                <span className="ms-hardware__price">{c.price}</span>
              </div>
              <h3 className="ms-hardware__card-title">{c.name}</h3>
              <p className="ms-hardware__card-desc">{c.desc}</p>
              <p className="ms-hardware__card-source">via {c.source}</p>
            </article>
          ))}
        </div>

        <div className="ms-hardware__cta-row">
          <div className="ms-hardware__cta-left">
            <h3 className="ms-hardware__cta-title">Full hardware spec available</h3>
            <p className="ms-hardware__cta-text">
              Architecture diagram, ESP32 firmware responsibilities, complete BOM by tier, deployment cost rollup, Malaysian sourcing list.
            </p>
          </div>
          <a href="#pricing" className="ms-cta ms-cta--ghost">
            <span>See per-tier pricing</span>
            <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   THREE TIER PRODUCTS
   ============================================================ */

function MsTiers({ onTryDemo }) {
  const tiers = [
    {
      id: "residential",
      name: "Residential",
      price: "RM 200–350",
      target: "Homes & apartments",
      icon: Home,
      saving: "RM 45/mo",
      features: [
        "Per-room walkthrough with plain-English status",
        "Bill projection with over/under indicator",
        "Standby drain detection & alerts",
        "AC scheduling and auto-shutoff",
        "Friendly nudges, no jargon",
        "2× smart plugs, 1× ESP32, 1× DHT22, 1× PIR"
      ]
    },
    {
      id: "business",
      name: "Commercial",
      price: "RM 800–1,500",
      target: "Cafés, shops, clinics, SMEs",
      icon: Store,
      saving: "RM 180/mo",
      features: [
        "Open / Close shift flow with phase detection",
        "Closing-time automation (lighting → AC → fridge)",
        "Same-industry benchmark comparison",
        "Staff-proof scheduled enforcement",
        "Approval workflow for big changes",
        "1× PZEM panel meter, 4× plugs, gateway, 4-CH relay, 2× wall switches"
      ],
      featured: true
    },
    {
      id: "enterprise",
      name: "Industry",
      price: "RM 3,500–8,000+",
      target: "Factories, warehouses, facilities",
      icon: Building2,
      saving: "RM 2,700/mo",
      features: [
        "Multi-zone scheduling and AI Twin scenarios",
        "After-hours enforcement on big loads",
        "Schneider contactor cutoff per zone",
        "Shift handover narrative reports",
        "Industrial-grade redundancy (dual gateways)",
        "3–6× PZEM panel meters, contactors per zone, DIN-rail enclosure"
      ]
    }
  ];

  return (
    <section className="ms-section ms-tiers" id="tiers">
      <div className="ms-section__inner">
        <div className="ms-section__header">
          <p className="ms-section__eyebrow">Three products inside one platform</p>
          <h2 className="ms-section__title">
            Each tier is genuinely different — <em>not a watered-down version</em> of the same dashboard.
          </h2>
          <p className="ms-section__lede">
            Different hardware kits. Different recommendation depth. Different UI. Same software backbone.
          </p>
        </div>

        <div className="ms-tiers__grid">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <article key={tier.id} className={`ms-tier ${tier.featured ? "ms-tier--featured" : ""}`}>
                {tier.featured ? <span className="ms-tier__badge">Most popular</span> : null}
                <div className="ms-tier__head">
                  <span className="ms-tier__icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="ms-tier__name">{tier.name}</h3>
                    <p className="ms-tier__target">{tier.target}</p>
                  </div>
                </div>

                <div className="ms-tier__price-row">
                  <p className="ms-tier__price">{tier.price}</p>
                  <p className="ms-tier__price-detail">hardware kit · one-time</p>
                </div>

                <div className="ms-tier__saving">
                  <Sparkles size={14} aria-hidden="true" />
                  <span>Saves {tier.saving} on average</span>
                </div>

                <ul className="ms-tier__features">
                  {tier.features.map((feat, i) => (
                    <li key={i}>
                      <CheckCircle2 size={14} aria-hidden="true" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => onTryDemo(tier.id)}
                  className={`ms-tier__cta ${tier.featured ? "ms-tier__cta--primary" : ""}`}
                >
                  <span>Try {tier.name} demo</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   USE CASES
   ============================================================ */

function MsUseCases() {
  const cases = [
    {
      tier: "Residential",
      icon: Home,
      who: "Sarah · Petaling Jaya apartment",
      story: "Her TNB bill jumped RM 80 last month. GridSenseIQ flagged her water heater running on standby 14 hours a day. One scheduled rule later, RM 45/month saved consistently.",
      result: "RM 540 saved per year"
    },
    {
      tier: "Commercial",
      icon: Store,
      who: "Ahmad · Café owner, Subang Jaya",
      story: "Espresso machine and lights staying on 2–3 hours after closing. Staff would forget. Closing-time automation now triggers at 10:30 PM sharp — without staff effort.",
      result: "RM 2,160 saved per year · staff-proof"
    },
    {
      tier: "Industry",
      icon: Building2,
      who: "Lim · Factory manager, Penang",
      story: "After-hours HVAC was running unnecessarily on production-paused zones. AI Twin simulated zone-by-zone reduction, ran through 6 scenarios. Approved the safest. Schneider contactors enforce it nightly.",
      result: "RM 32,400 saved per year · zero safety incidents"
    }
  ];

  return (
    <section className="ms-section ms-cases" id="cases">
      <div className="ms-section__inner">
        <div className="ms-section__header">
          <p className="ms-section__eyebrow">Real use cases</p>
          <h2 className="ms-section__title">
            Where the savings <em>actually</em> come from.
          </h2>
        </div>

        <div className="ms-cases__grid">
          {cases.map((c, i) => {
            const Icon = c.icon;
            return (
              <article key={i} className="ms-case">
                <div className="ms-case__head">
                  <span className="ms-case__icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="ms-case__tier">{c.tier}</span>
                </div>
                <p className="ms-case__who">{c.who}</p>
                <p className="ms-case__story">{c.story}</p>
                <div className="ms-case__result">
                  <TrendingUp size={14} aria-hidden="true" />
                  <span>{c.result}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PRICING DETAIL
   ============================================================ */

function MsPricing({ onTryDemo }) {
  return (
    <section className="ms-section ms-pricing" id="pricing">
      <div className="ms-section__inner">
        <div className="ms-section__header">
          <p className="ms-section__eyebrow">Transparent pricing</p>
          <h2 className="ms-section__title">
            Hardware costs by tier, <em>itemized in ringgit</em>.
          </h2>
          <p className="ms-section__lede">
            All prices verified at Malaysian retailers as of April 2026. Software platform pricing TBD post-pilot.
          </p>
        </div>

        <div className="ms-pricing__table-wrap">
          <table className="ms-pricing__table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Residential</th>
                <th>Commercial</th>
                <th>Industry</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ESP32 gateway</td>
                <td>1× RM 20–30</td>
                <td>1× RM 20–30</td>
                <td>2× RM 20–30 (redundant)</td>
              </tr>
              <tr>
                <td>PZEM-004T panel meter</td>
                <td>—</td>
                <td>1× RM 60–90</td>
                <td>3–6× RM 60–90</td>
              </tr>
              <tr>
                <td>Smart plugs</td>
                <td>2–3× RM 35–55</td>
                <td>4× RM 35–55</td>
                <td>—</td>
              </tr>
              <tr>
                <td>Smart wall switches</td>
                <td>—</td>
                <td>2× RM 50–90</td>
                <td>—</td>
              </tr>
              <tr>
                <td>Industrial contactors</td>
                <td>—</td>
                <td>—</td>
                <td>4–8× RM 180–450</td>
              </tr>
              <tr>
                <td>Sensors (DHT22, PIR)</td>
                <td>RM 17–28</td>
                <td>RM 39–66</td>
                <td>RM 112–300</td>
              </tr>
              <tr>
                <td>Enclosures, power, cabling</td>
                <td>RM 70–110</td>
                <td>RM 140–270</td>
                <td>RM 630–1,250</td>
              </tr>
              <tr>
                <td>Electrician install</td>
                <td>DIY</td>
                <td>RM 250–500</td>
                <td>RM 1,200–2,500</td>
              </tr>
              <tr className="ms-pricing__total">
                <td>Total deployment</td>
                <td>RM 200–350</td>
                <td>RM 800–1,500</td>
                <td>RM 3,500–8,000+</td>
              </tr>
              <tr className="ms-pricing__payback">
                <td>Estimated payback</td>
                <td>~5–8 months</td>
                <td>~6–9 months</td>
                <td>~4–7 months</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="ms-pricing__cta-row">
          <button type="button" onClick={() => onTryDemo("residential")} className="ms-cta ms-cta--primary">
            <span>Try the demo first</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
          <a href="mailto:hello@gridsense.iq?subject=Energy%20assessment" className="ms-cta ms-cta--ghost">
            <span>Book site assessment</span>
            <Mail size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */

function MsFaq() {
  const faqs = [
    {
      q: "Do I need to rewire my home or office?",
      a: "No. Smart plugs are zero-install — they sit between the wall outlet and the device. Smart wall switches replace existing switches in 15 minutes per gang. Only the Industry tier requires a licensed electrician for panel-level installation."
    },
    {
      q: "Will this work with TNB's existing smart meter program?",
      a: "GridSenseIQ is independent of TNB's metering. We install our own measurement layer because TNB does not currently expose a real-time API. If TNB launches one, we'll integrate."
    },
    {
      q: "Is my consumption data private?",
      a: "Edge aggregation on the ESP32 gateway means raw readings stay local. Only aggregated metrics leave your premises, encrypted via TLS. You own your data — full export available anytime."
    },
    {
      q: "What if my WiFi goes down?",
      a: "The ESP32 gateway buffers up to 24 hours of readings locally. Approval-gated automation rules continue to enforce on the local schedule even without internet. Watchdog timers ensure safe failover."
    },
    {
      q: "How accurate are the savings estimates?",
      a: "Recommendations include a confidence percentage. The AI Twin simulates the projected outcome before you approve any change. Confidence below 70% is flagged. Real measured savings are reconciled against estimates monthly."
    },
    {
      q: "Can I scale from Residential to Commercial later?",
      a: "Yes. The hardware kit is modular — every Residential install can grow into Commercial by adding the PZEM panel meter and smart wall switches. Same gateway, same software."
    },
    {
      q: "What about three-phase industrial loads?",
      a: "PZEM-004T is single-phase. Industry deployments use three single-phase meters (one per phase) reporting to the same gateway, or upgrade to PZEM-016 for direct three-phase. The dashboard handles both seamlessly."
    },
    {
      q: "Is this open source?",
      a: "The firmware on the ESP32 is open and auditable. The cloud platform and recommendation engine are proprietary. Open protocols (MQTT, Modbus) mean you're never locked in."
    }
  ];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="ms-section ms-faq" id="faq">
      <div className="ms-section__inner ms-faq__inner">
        <div className="ms-section__header">
          <p className="ms-section__eyebrow">Frequently asked</p>
          <h2 className="ms-section__title">
            The questions <em>everyone</em> asks first.
          </h2>
        </div>

        <div className="ms-faq__list">
          {faqs.map((item, i) => (
            <article
              key={i}
              className={`ms-faq__item ${openIndex === i ? "ms-faq__item--open" : ""}`}
            >
              <button
                type="button"
                className="ms-faq__q"
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                aria-expanded={openIndex === i}
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={18}
                  className="ms-faq__chev"
                  aria-hidden="true"
                />
              </button>
              <div className="ms-faq__a">
                <p>{item.a}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FINAL CTA BAND
   ============================================================ */

function MsFinalBand({ onTryDemo }) {
  return (
    <section className="ms-final">
      <div className="ms-section__inner">
        <div className="ms-final__inner">
          <p className="ms-section__eyebrow ms-section__eyebrow--center">Ready to see it in action?</p>
          <h2 className="ms-final__title">
            Stop guessing what your bill is doing.
            <br />
            <span className="ms-final__title-grad">See every kWh, every minute.</span>
          </h2>
          <p className="ms-final__lede">
            Spin up the live demo with realistic Malaysian data. Pick a tier — Residential, Commercial, or Industry — and explore the dashboard, AI Twin scenarios, and automation workflow.
          </p>
          <div className="ms-final__ctas">
            <button type="button" onClick={() => onTryDemo()} className="ms-cta ms-cta--primary ms-cta--big">
              <span>Open the live demo</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <a
              href="mailto:hello@gridsense.iq?subject=Pilot%20program"
              className="ms-cta ms-cta--ghost ms-cta--big"
            >
              <span>Talk to our team</span>
              <Mail size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */

function MsFooter({ onWatchPresentation }) {
  return (
    <footer className="ms-footer">
      <div className="ms-section__inner">
        <div className="ms-footer__top">
          <div className="ms-footer__brand">
            <div className="ms-nav__brand">
              <span className="ms-nav__brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path d="M13 2 L4 14 L11 14 L9 22 L20 8 L13 8 Z" fill="currentColor" />
                </svg>
              </span>
              <span className="ms-nav__brand-text">GridSenseIQ</span>
            </div>
            <p className="ms-footer__tagline">
              Hardware-software energy intelligence, built for Malaysian electricity. Software gives insight. Hardware gives evidence.
            </p>
            <button type="button" onClick={onWatchPresentation} className="ms-cta ms-cta--ghost ms-cta--small">
              <span>◀ Watch presentation</span>
            </button>
          </div>

          <div className="ms-footer__cols">
            <div className="ms-footer__col">
              <h4>Product</h4>
              <a href="#how">How it works</a>
              <a href="#hardware">Hardware</a>
              <a href="#tiers">Three tiers</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="ms-footer__col">
              <h4>Company</h4>
              <a href="#cases">Use cases</a>
              <a href="#faq">FAQ</a>
              <a href="mailto:hello@gridsense.iq">Contact</a>
              <a href="mailto:hello@gridsense.iq?subject=Press">Press</a>
            </div>
            <div className="ms-footer__col">
              <h4>Built for</h4>
              <span>Malaysia · TNB tariff</span>
              <span>SDG 7 · 11 · 12 · 13</span>
              <span>UM Technothon 2026</span>
            </div>
            <div className="ms-footer__col">
              <h4>Reach us</h4>
              <a href="mailto:hello@gridsense.iq">
                <Mail size={12} aria-hidden="true" />
                hello@gridsense.iq
              </a>
              <span>
                <MapPin size={12} aria-hidden="true" />
                Kuala Lumpur, Malaysia
              </span>
            </div>
          </div>
        </div>

        <div className="ms-footer__bottom">
          <p>© 2026 GridSenseIQ · Built for UM Technothon 2026 · Smart Energy Management track</p>
          <div className="ms-footer__legal">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
