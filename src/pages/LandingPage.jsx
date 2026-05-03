import { ArrowRight, BookOpen, Bot, Building2, Coins, Cpu, Globe2, Home, PlugZap, ShieldCheck, Store, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboardData } from "../app/DashboardContext.jsx";
import CountUp from "../components/effects/CountUp.jsx";
import ArchitectureDiagram from "../components/landing/ArchitectureDiagram.jsx";
import MarketingSite from "../components/landing/MarketingSite.jsx";
import ScrollLitBulb from "../components/landing/ScrollLitBulb.jsx";
import Slide from "../components/slides/Slide.jsx";
import SlideDeck, { useSlide } from "../components/slides/SlideDeck.jsx";

// Roman-numeral pillars — now each gets its own slide (4 separate dramatic moments)
const pillars = [
  { roman: "I", title: "Sense.", text: "Hardware captures every kWh as physical evidence — smart plugs, current sensors, panel monitors.", icon: PlugZap },
  { roman: "II", title: "Understand.", text: "Software turns raw signals into bill projections, room-by-room waste, and clear alerts.", icon: Zap },
  { roman: "III", title: "Recommend.", text: "AI prioritizes actions by RM saved, kWh cut, CO₂ avoided — never noise. Just what works.", icon: Bot },
  { roman: "IV", title: "Act.", text: "Approve a recommendation and the platform schedules it. Hardware enforces it. Done.", icon: ShieldCheck }
];

const tierCards = [
  { id: "residential", roman: "I", icon: Home, title: "Residential", text: "Homes and apartments. Quietly watches AC, plug loads, and standby drain so the bill stops creeping.", highlight: "RM 45/mo savings" },
  { id: "business", roman: "II", icon: Store, title: "Commercial", text: "Shops, cafes, clinics, small offices, retail. Closing-time automation that staff can't forget.", highlight: "RM 180/mo savings" },
  { id: "enterprise", roman: "III", icon: Building2, title: "Industry", text: "Factories, warehouses, facilities. Multi-zone scheduling, AI Twin scenario planning, after-hours enforcement.", highlight: "RM 2,700/mo savings" }
];

// Total slide count - drives the bulb progress
const TOTAL_SLIDES = 10;

export default function LandingPage() {
  const navigate = useNavigate();
  const { actions } = useDashboardData();
  const [demoOpen, setDemoOpen] = useState(false);
  // 'cinema' = slide-deck presentation mode (default)
  // 'site' = scrollable long-form marketing site
  const [mode, setMode] = useState("cinema");

  function openDemo(profile) {
    if (profile) actions.setMode(profile);
    setDemoOpen(false);
    navigate("/dashboard");
  }

  function handleTryDemo(profile) {
    if (profile) {
      openDemo(profile);
    } else {
      setDemoOpen(true);
    }
  }

  function switchToSite() {
    setMode("site");
    // Scroll to top of marketing site after switching
    setTimeout(() => {
      const ms = document.querySelector(".ms");
      if (ms) ms.scrollTop = 0;
      else window.scrollTo(0, 0);
    }, 50);
  }

  function switchToCinema() {
    setMode("cinema");
    window.scrollTo(0, 0);
  }

  // SCENE B: long-form marketing site
  if (mode === "site") {
    return (
      <>
        <MarketingSite
          onWatchPresentation={switchToCinema}
          onTryDemo={handleTryDemo}
        />
        {demoOpen ? (
          <DemoModal tiers={tierCards} onPick={openDemo} onClose={() => setDemoOpen(false)} />
        ) : null}
      </>
    );
  }

  // SCENE A: cinema mode (default — slide deck)
  return (
    <div className="landing-v3">
      {/* Bulb is rendered inside the deck so we can wire it to slide progress */}
      <SlideDeck>
        <SlideHero onTryDemo={() => setDemoOpen(true)} onLogin={() => navigate("/dashboard")} />
        <SlidePillar pillar={pillars[0]} index={0} />
        <SlidePillar pillar={pillars[1]} index={1} />
        <SlidePillar pillar={pillars[2]} index={2} />
        <SlidePillar pillar={pillars[3]} index={3} />
        <SlideStats />
        <SlideTiers tiers={tierCards} onPick={openDemo} />
        <SlideArchitecture />
        <SlideMalaysia />
        <SlideFinalCta onTryDemo={() => setDemoOpen(true)} onViewSite={switchToSite} />
      </SlideDeck>

      {/* Demo modal sits outside the deck so it can render above */}
      {demoOpen ? (
        <DemoModal tiers={tierCards} onPick={openDemo} onClose={() => setDemoOpen(false)} />
      ) : null}
    </div>
  );
}

/* -------- Bulb wrapper: subscribes to slide progress and feeds it down -------- */

function BulbBackdrop({ tone = "default" }) {
  const { progress } = useSlide();
  return (
    <div className={`bulb-backdrop bulb-backdrop--${tone}`} aria-hidden="true">
      <ScrollLitBulb progress={progress} />
    </div>
  );
}

/* ============================================================
   SLIDE 1: HERO
   ============================================================ */

function SlideHero({ onTryDemo, onLogin }) {
  return (
    <Slide variant="fade-up" className="slide-hero">
      <BulbBackdrop tone="hero" />
      <div className="slide-hero__content">
        <span className="lv2-eyebrow lv3-eyebrow-anim">
          <span className="lv2-eyebrow__dot" aria-hidden="true" />
          GridSenseIQ · Hardware + Software intelligence
        </span>

        <h1 className="lv3-hero__title">
          <span className="lv3-hero__line lv3-hero__line--1">Save Energy.</span>
          <span className="lv3-hero__line lv3-hero__line--2">Save Money.</span>
          <span className="lv3-hero__line lv3-hero__line--3">Unlock Smarter Control.</span>
        </h1>

        <p className="lv3-hero__sub">
          <strong>Software gives insight. Hardware gives evidence.</strong>
          <br />
          GridSenseIQ illuminates the way Malaysian homes, businesses, and facilities use electricity.
        </p>

        <div className="lv3-hero__ctas">
          <button type="button" onClick={onTryDemo} className="lv2-cta lv2-cta--primary lv2-cta--big">
            <span>Try the live demo</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <button type="button" onClick={onLogin} className="lv2-cta lv2-cta--ghost lv2-cta--big">
            Login to dashboard
          </button>
        </div>
      </div>
    </Slide>
  );
}

/* ============================================================
   SLIDES 2-5: PILLAR (one per pillar)
   ============================================================ */

function SlidePillar({ pillar, index }) {
  const Icon = pillar.icon;
  return (
    <Slide variant="mask" className="slide-pillar">
      <BulbBackdrop tone="pillar" />
      <div className="slide-pillar__content">
        <span className="slide-pillar__roman" aria-hidden="true">{pillar.roman}</span>
        <div className="slide-pillar__body">
          <span className="slide-pillar__pillar-tag">Pillar {pillar.roman} of IV</span>
          <span className="slide-pillar__icon">
            <Icon size={28} aria-hidden="true" />
          </span>
          <h2 className="slide-pillar__title">{pillar.title}</h2>
          <p className="slide-pillar__text">{pillar.text}</p>
        </div>
      </div>
    </Slide>
  );
}

/* ============================================================
   SLIDE 6: STATS
   ============================================================ */

function SlideStats() {
  return (
    <Slide variant="scale" className="slide-stats">
      <BulbBackdrop tone="stats" />
      <div className="slide-stats__content">
        <p className="slide-eyebrow">Real numbers</p>
        <h2 className="slide-title">
          Built around what Malaysian users <em>actually</em> save.
        </h2>

        <div className="slide-stats__grid">
          <article className="slide-stat slide-stat--warm">
            <p className="slide-stat__value">
              <CountUp to={2700} prefix="RM " duration={1800} />
              <span className="slide-stat__suffix">/mo</span>
            </p>
            <p className="slide-stat__label">Average Industry tier savings</p>
          </article>
          <article className="slide-stat slide-stat--sage">
            <p className="slide-stat__value">
              <CountUp to={3800} duration={1800} />
              <span className="slide-stat__suffix">kg</span>
            </p>
            <p className="slide-stat__label">CO₂ reduction per facility, per month</p>
          </article>
          <article className="slide-stat slide-stat--cool">
            <p className="slide-stat__value">
              <CountUp to={21} duration={1800} />
              <span className="slide-stat__suffix">%</span>
            </p>
            <p className="slide-stat__label">Of facility electricity is avoidable waste</p>
          </article>
        </div>
      </div>
    </Slide>
  );
}

/* ============================================================
   SLIDE 7: TIERS
   ============================================================ */

function SlideTiers({ tiers, onPick }) {
  return (
    <Slide variant="fade-up" className="slide-tiers">
      <BulbBackdrop tone="tiers" />
      <div className="slide-tiers__content">
        <p className="slide-eyebrow">Three tiers</p>
        <h2 className="slide-title">
          One platform. <em>Three different products</em> inside it.
        </h2>
        <p className="slide-lede">
          Each tier ships its own dashboard, automation depth, and recommendation set.
        </p>

        <div className="slide-tiers__grid">
          {tiers.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <article
                key={tier.id}
                className="slide-tier-card"
                style={{ "--tier-delay": `${i * 130}ms` }}
              >
                <span className="slide-tier-card__roman" aria-hidden="true">{tier.roman}</span>
                <span className="slide-tier-card__icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className="slide-tier-card__title">{tier.title}</h3>
                <p className="slide-tier-card__text">{tier.text}</p>
                <p className="slide-tier-card__highlight">{tier.highlight}</p>
                <button
                  type="button"
                  onClick={() => onPick(tier.id)}
                  className="slide-tier-card__btn"
                >
                  <span>Open {tier.title} demo</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </Slide>
  );
}

/* ============================================================
   SLIDE 8: ARCHITECTURE
   ============================================================ */

function SlideArchitecture() {
  return (
    <Slide variant="fade-up" className="slide-arch">
      <BulbBackdrop tone="arch" />
      <div className="slide-arch__content">
        <ArchitectureDiagram />
      </div>
    </Slide>
  );
}

/* ============================================================
   SLIDE 9: MALAYSIA CONTEXT
   ============================================================ */

function SlideMalaysia() {
  return (
    <Slide variant="fade-up" className="slide-malaysia">
      <BulbBackdrop tone="malaysia" />
      <div className="slide-malaysia__content">
        <p className="slide-eyebrow">
          <span className="malaysia-flag" aria-hidden="true" /> Built for Malaysia
        </p>
        <h2 className="slide-title">Local tariffs. Local grid. Local impact.</h2>
        <p className="slide-lede">
          GridSenseIQ uses Malaysia-specific TNB tariff bands and grid carbon intensity so every recommendation translates to real ringgit.
        </p>

        <div className="slide-malaysia__grid">
          <article className="slide-malaysia__card">
            <Coins size={20} className="slide-malaysia__icon" aria-hidden="true" />
            <p className="slide-malaysia__value">RM 0.218 – 0.571</p>
            <p className="slide-malaysia__label">TNB tariff range, RM / kWh</p>
          </article>
          <article className="slide-malaysia__card">
            <Zap size={20} className="slide-malaysia__icon" aria-hidden="true" />
            <p className="slide-malaysia__value"><CountUp to={0.585} decimals={3} /></p>
            <p className="slide-malaysia__label">kg CO₂ / kWh, national grid</p>
          </article>
          <article className="slide-malaysia__card">
            <Building2 size={20} className="slide-malaysia__icon" aria-hidden="true" />
            <p className="slide-malaysia__value"><CountUp to={1.2} decimals={1} suffix="M+" /></p>
            <p className="slide-malaysia__label">Malaysian commercial businesses, mostly without intelligence</p>
          </article>
          <article className="slide-malaysia__card">
            <Globe2 size={20} className="slide-malaysia__icon" aria-hidden="true" />
            <p className="slide-malaysia__value">SDG 7 · 11 · 12 · 13</p>
            <p className="slide-malaysia__label">Affordable energy, climate, sustainable cities</p>
          </article>
        </div>
      </div>
    </Slide>
  );
}

/* ============================================================
   SLIDE 10: FINAL CTA
   ============================================================ */

function SlideFinalCta({ onTryDemo, onViewSite }) {
  return (
    <Slide variant="fade-up" className="slide-final">
      <BulbBackdrop tone="final" />
      <div className="slide-final__content">
        <p className="slide-eyebrow">Are you ready?</p>
        <h2 className="slide-final__title">
          Light up your <em>energy intelligence</em>.
        </h2>
        <p className="slide-final__lede">
          Book an energy assessment, or jump into the live demo right now. Every tier has its own dashboard, recommendations, and savings story.
        </p>
        <div className="slide-final__ctas">
          <button type="button" onClick={onTryDemo} className="lv2-cta lv2-cta--primary lv2-cta--big">
            <span>Try the live demo</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <a
            href="mailto:hello@gridsense.iq?subject=Book%20energy%20assessment"
            className="lv2-cta lv2-cta--ghost lv2-cta--big"
          >
            Book energy assessment
          </a>
        </div>
        {onViewSite ? (
          <button type="button" onClick={onViewSite} className="slide-final__site-btn">
            <span className="slide-final__site-btn-icon" aria-hidden="true">
              <BookOpen size={16} />
            </span>
            <span className="slide-final__site-btn-label">
              <span className="slide-final__site-btn-text">View full site</span>
              <span className="slide-final__site-btn-sub">Read the in-depth product details</span>
            </span>
            <span className="slide-final__site-btn-arrow" aria-hidden="true">↓</span>
          </button>
        ) : null}
      </div>
    </Slide>
  );
}

/* ============================================================
   DEMO MODAL — opt-out of slide-snap so it can scroll if needed
   ============================================================ */

function DemoModal({ tiers, onPick, onClose }) {
  return (
    <div
      className="lv2-modal"
      role="dialog"
      aria-label="Choose a demo profile"
      data-no-snap="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="lv2-modal__panel" data-no-snap="true">
        <p className="lv2-modal__eyebrow">Try the live demo</p>
        <h3 className="lv2-modal__title">Pick a tier to open</h3>
        <p className="lv2-modal__lede">Each one boots a different dashboard with realistic mock data and tier-specific features.</p>
        <div className="lv2-modal__grid">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => onPick(tier.id)}
                className="lv2-modal__option"
              >
                <span className="lv2-modal__option-icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className="lv2-modal__option-title">{tier.title}</span>
                <span className="lv2-modal__option-text">{tier.text}</span>
                <span className="lv2-modal__option-go">Open <ArrowRight size={14} aria-hidden="true" /></span>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={onClose} className="lv2-modal__close">
          Cancel
        </button>
      </div>
    </div>
  );
}
