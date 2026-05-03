import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Scroll-lit realistic Edison-style bulb. Modeled after a clear-glass LED
 * filament bulb: thin metal support stems hold four parallel vertical
 * filament strips in a cage pattern, with the classic E27 screw cap.
 *
 * The composition is surrounded by a constellation of glowing dots and
 * faint lines, with ~22% of dots designated as twinkling stars that pulse
 * independently of scroll progress.
 *
 * Progress source:
 *   - When the `progress` prop is provided (number 0..1), use it directly.
 *     This is how the SlideDeck drives the bulb in v9 — slide index / total.
 *   - Otherwise (legacy / non-deck pages), self-drive from window.scrollY.
 */

function buildConstellation() {
  const dots = [];
  const cx = 500;
  const cy = 260;
  const ringSpecs = [
    { count: 14, r: 200, jitter: 18 },
    { count: 22, r: 290, jitter: 24 },
    { count: 26, r: 380, jitter: 32 },
    { count: 30, r: 470, jitter: 40 }
  ];

  // Deterministic PRNG so layout is stable across renders
  let seed = 13;
  function rnd() {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  }

  ringSpecs.forEach((ring, ringIndex) => {
    for (let i = 0; i < ring.count; i += 1) {
      const angle = (i / ring.count) * Math.PI * 2 + rnd() * 0.15;
      const r = ring.r + (rnd() - 0.5) * ring.jitter * 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r * 0.78;
      const size = 0.9 + rnd() * 1.6;
      const isStar = rnd() > 0.78;
      const phase = rnd() * 6;
      const dur = 1.6 + rnd() * 2.4;
      dots.push({ id: `${ringIndex}-${i}`, x, y, size, ring: ringIndex, isStar, phase, dur });
    }
  });

  const lines = [];
  for (let i = 0; i < dots.length; i += 1) {
    const a = dots[i];
    const dists = [];
    for (let j = 0; j < dots.length; j += 1) {
      if (i === j) continue;
      const b = dots[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 130) dists.push({ j, d });
    }
    dists.sort((u, v) => u.d - v.d);
    for (let k = 0; k < Math.min(2, dists.length); k += 1) {
      const j = dists[k].j;
      if (i < j) lines.push({ id: `${a.id}-${dots[j].id}`, a, b: dots[j] });
    }
  }

  return { dots, lines };
}

export default function ScrollLitBulb({ progress: progressProp = null }) {
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);
  const animFrameRef = useRef(0);
  const constellation = useMemo(() => buildConstellation(), []);

  // When `progress` prop is given (slide-driven mode), tween smoothly toward
  // the target value over ~600ms instead of snapping. Lets the bulb fade
  // brighter between slide transitions in a controlled way.
  useEffect(() => {
    if (progressProp === null || progressProp === undefined) return undefined;
    const target = Math.min(1, Math.max(0, Number(progressProp) || 0));
    let raf = 0;
    const startValue = progress;
    const start = performance.now();
    const duration = 600;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      // Ease-in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setProgress(startValue + (target - startValue) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressProp]);

  // Legacy scroll-driven mode — only when progress prop NOT given
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (progressProp !== null && progressProp !== undefined) return undefined;

    function compute() {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const value = Math.min(1, Math.max(0, window.scrollY / max));
      setProgress(value);
      ticking.current = false;
    }

    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(compute);
    }

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", compute);
    };
  }, [progressProp]);

  const eased = progress < 0.08 ? progress * 0.4 : Math.min(1, 0.03 + (progress - 0.08) * 1.18);
  const filamentOpacity = 0.22 + eased * 0.78;
  const networkOpacity = 0.18 + eased * 0.7;
  const lineOpacity = 0.12 + eased * 0.45;
  const beamOpacity = Math.max(0, eased - 0.45) * 1.4;

  // Filament strip x-coordinates — four parallel vertical bars, like image 2
  // Spaced symmetrically around the bulb centerline (x=500)
  const filamentXs = [474, 492, 508, 526];

  return (
    <div
      className="scroll-bulb"
      style={{
        "--bulb-progress": eased,
        "--bulb-filament-opacity": filamentOpacity,
        "--bulb-network-opacity": networkOpacity,
        "--bulb-line-opacity": lineOpacity,
        "--bulb-beam-opacity": beamOpacity
      }}
      aria-hidden="true"
    >
      <div className="scroll-bulb__roomglow" />

      <svg
        className="scroll-bulb__svg"
        viewBox="0 0 1000 600"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Realistic glowing light bulb surrounded by a network of dots"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Glass envelope — mostly transparent with subtle blue cast */}
          <radialGradient id="bulb-glass-real" cx="50%" cy="38%" r="58%">
            <stop offset="0%" stopColor="rgba(186, 230, 253, 0.16)" />
            <stop offset="65%" stopColor="rgba(96, 165, 250, 0.08)" />
            <stop offset="100%" stopColor="rgba(8, 16, 36, 0)" />
          </radialGradient>

          {/* Filament glow — warm-tinted core that gets brighter when lit */}
          <radialGradient id="filament-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 1)" />
            <stop offset="35%" stopColor="rgba(255, 240, 200, 0.95)" />
            <stop offset="100%" stopColor="rgba(255, 200, 120, 0)" />
          </radialGradient>

          {/* Beam below screw cap */}
          <linearGradient id="bulb-beam" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(186, 230, 253, 0.65)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
          </linearGradient>

          {/* Soft blur for filament aura */}
          <filter id="filament-aura" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>

          {/* Sharper blur for inner filament glow */}
          <filter id="filament-inner-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>

          {/* Constellation dot glow */}
          <radialGradient id="dot-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(186, 230, 253, 1)" />
            <stop offset="60%" stopColor="rgba(96, 165, 250, 0.4)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
          </radialGradient>

          {/* Metal cap gradient (brass-silver) */}
          <linearGradient id="cap-metal" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          <linearGradient id="cap-metal-shine" x1="0%" x2="100%" y1="50%" y2="50%">
            <stop offset="0%" stopColor="rgba(15, 23, 42, 0.6)" />
            <stop offset="35%" stopColor="rgba(226, 232, 240, 0.85)" />
            <stop offset="55%" stopColor="rgba(248, 250, 252, 0.95)" />
            <stop offset="75%" stopColor="rgba(148, 163, 184, 0.65)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0.7)" />
          </linearGradient>
        </defs>

        {/* CONSTELLATION LINES (behind everything) */}
        <g className="scroll-bulb__lines" opacity={lineOpacity}>
          {constellation.lines.map((line) => (
            <line
              key={line.id}
              x1={line.a.x}
              y1={line.a.y}
              x2={line.b.x}
              y2={line.b.y}
              stroke="rgba(147, 197, 253, 0.45)"
              strokeWidth="0.6"
            />
          ))}
        </g>

        {/* CONSTELLATION DOTS */}
        <g className="scroll-bulb__dots" opacity={networkOpacity}>
          {constellation.dots.filter((d) => !d.isStar).map((dot) => (
            <circle
              key={dot.id}
              cx={dot.x}
              cy={dot.y}
              r={dot.size}
              fill="rgba(186, 230, 253, 0.92)"
            />
          ))}
        </g>

        {/* BLINKING STARS */}
        <g className="scroll-bulb__stars" opacity={networkOpacity + 0.1}>
          {constellation.dots.filter((d) => d.isStar).map((star) => (
            <g
              key={star.id}
              className="scroll-bulb__star"
              style={{
                animationDelay: `${star.phase}s`,
                animationDuration: `${star.dur}s`,
                transformOrigin: `${star.x}px ${star.y}px`
              }}
            >
              <circle cx={star.x} cy={star.y} r={star.size * 4} fill="url(#dot-glow)" opacity="0.55" />
              <circle cx={star.x} cy={star.y} r={star.size * 1.3} fill="rgba(255, 255, 255, 1)" />
              <line x1={star.x - star.size * 4} y1={star.y} x2={star.x + star.size * 4} y2={star.y} stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.4" />
              <line x1={star.x} y1={star.y - star.size * 4} x2={star.x} y2={star.y + star.size * 4} stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.4" />
            </g>
          ))}
        </g>

        {/* DOWNWARD BEAM */}
        <path
          d="M 480 460 L 360 600 L 640 600 L 520 460 Z"
          fill="url(#bulb-beam)"
          opacity={beamOpacity}
          style={{ transition: "opacity 200ms linear" }}
        />

        {/* OUTER WARM HALO behind bulb (only visible when lit) */}
        <circle
          cx="500"
          cy="260"
          r="180"
          fill="url(#filament-core-glow)"
          opacity={eased * 0.35}
        />

        {/* GLASS ENVELOPE — A19 / classic teardrop bulb shape */}
        <g>
          <path
            d="M 500 60
               C 600 60, 666 130, 666 220
               C 666 280, 638 332, 596 366
               C 584 376, 580 388, 580 398
               L 420 398
               C 420 388, 416 376, 404 366
               C 362 332, 334 280, 334 220
               C 334 130, 400 60, 500 60 Z"
            fill="url(#bulb-glass-real)"
            stroke="rgba(186, 230, 253, 0.42)"
            strokeWidth="1.4"
          />

          {/* Subtle highlight stripe (left side reflection) */}
          <ellipse cx="392" cy="170" rx="10" ry="48" fill="rgba(255, 255, 255, 0.08)" />
          {/* Smaller highlight on right */}
          <ellipse cx="612" cy="180" rx="6" ry="32" fill="rgba(255, 255, 255, 0.05)" />
        </g>

        {/* INNER GLASS BASE COLLAR — the white plastic/ceramic disc that holds the filaments */}
        <ellipse
          cx="500"
          cy="378"
          rx="46"
          ry="9"
          fill="rgba(241, 245, 249, 0.55)"
          stroke="rgba(186, 230, 253, 0.45)"
          strokeWidth="0.8"
        />

        {/* SUPPORT WIRES — thin metal stems holding the filament bars */}
        <g stroke="rgba(203, 213, 225, 0.7)" strokeWidth="0.9" strokeLinecap="round" fill="none">
          {/* Central support post rising from the base */}
          <line x1="500" y1="378" x2="500" y2="180" />
          {/* Top horizontal cross-arm holding filament tops */}
          <path d="M 466 184 Q 500 174 534 184" />
          {/* Bottom horizontal cross-arm holding filament bottoms */}
          <path d="M 466 358 Q 500 366 534 358" />
          {/* Small angled support struts from base to filament bottoms */}
          <line x1="490" y1="378" x2="474" y2="358" />
          <line x1="510" y1="378" x2="526" y2="358" />
        </g>

        {/* FILAMENT BARS — four parallel vertical glowing strips */}
        <g style={{ transition: "opacity 200ms linear" }}>
          {/* Outer aura (blurred, only when lit) */}
          <g filter="url(#filament-aura)" opacity={Math.max(0, eased - 0.1) * 0.85}>
            {filamentXs.map((x) => (
              <line
                key={`aura-${x}`}
                x1={x}
                y1="186"
                x2={x}
                y2="356"
                stroke="rgba(255, 240, 200, 0.95)"
                strokeWidth="6"
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* Mid filament glow */}
          <g filter="url(#filament-inner-blur)" opacity={filamentOpacity}>
            {filamentXs.map((x) => (
              <line
                key={`mid-${x}`}
                x1={x}
                y1="188"
                x2={x}
                y2="354"
                stroke="rgba(255, 230, 160, 0.95)"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* Sharp filament core — the bright white-yellow line */}
          <g opacity={filamentOpacity}>
            {filamentXs.map((x) => (
              <line
                key={`core-${x}`}
                x1={x}
                y1="190"
                x2={x}
                y2="352"
                stroke="rgba(255, 248, 220, 1)"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* Tiny connection points where filament meets cross-arms */}
          {filamentXs.map((x) => (
            <g key={`pts-${x}`}>
              <circle cx={x} cy="188" r="1.4" fill="rgba(255, 200, 120, 0.95)" opacity={filamentOpacity} />
              <circle cx={x} cy="354" r="1.4" fill="rgba(255, 200, 120, 0.95)" opacity={filamentOpacity} />
            </g>
          ))}

          {/* Central warm glow plume — appears when bulb is lit */}
          {eased > 0.18 ? (
            <ellipse
              cx="500"
              cy="270"
              rx={44 * eased}
              ry={70 * eased}
              fill="url(#filament-core-glow)"
              opacity={eased * 0.55}
            />
          ) : null}
        </g>

        {/* E27 SCREW CAP — realistic threaded base */}
        <g>
          {/* Top metal collar (smooth band) */}
          <rect x="446" y="398" width="108" height="14" rx="2" fill="url(#cap-metal)" stroke="rgba(186, 230, 253, 0.25)" strokeWidth="0.6" />
          {/* Reflected sheen */}
          <rect x="446" y="398" width="108" height="14" rx="2" fill="url(#cap-metal-shine)" opacity="0.4" />

          {/* Screw threading — diagonal stripes giving the spiral look */}
          {[0, 1, 2, 3, 4].map((i) => {
            const yTop = 412 + i * 8;
            return (
              <g key={`thread-${i}`}>
                <path
                  d={`M 450 ${yTop} L 554 ${yTop - 2} L 554 ${yTop + 6} L 450 ${yTop + 8} Z`}
                  fill="url(#cap-metal)"
                  stroke="rgba(15, 23, 42, 0.45)"
                  strokeWidth="0.4"
                />
                <path
                  d={`M 450 ${yTop} L 554 ${yTop - 2} L 554 ${yTop + 6} L 450 ${yTop + 8} Z`}
                  fill="url(#cap-metal-shine)"
                  opacity="0.32"
                />
              </g>
            );
          })}

          {/* Black insulator ring between threading and tip */}
          <path d="M 460 454 L 540 454 L 534 470 L 466 470 Z" fill="rgba(31, 41, 55, 0.95)" stroke="rgba(15, 23, 42, 0.6)" strokeWidth="0.5" />

          {/* Bottom contact tip */}
          <ellipse cx="500" cy="472" rx="14" ry="4" fill="rgba(71, 85, 105, 0.95)" stroke="rgba(186, 230, 253, 0.3)" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
}
