import { useEffect, useRef } from "react";

/**
 * Lightweight electricity-themed ambient background. Floating "electrons" drift
 * upward with subtle drift sway; periodic pulse waves cross from left to right.
 * Canvas-based for performance, auto-pauses when tab is hidden, respects
 * prefers-reduced-motion.
 */
export default function EnergyParticles({ density = 0.6 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let pulseStart = performance.now();
    let frame = 0;
    let running = true;

    function spawn(x, y) {
      return {
        x: x ?? Math.random() * width,
        y: y ?? Math.random() * height,
        radius: 1 + Math.random() * 1.8,
        vy: -(0.18 + Math.random() * 0.55),
        vx: (Math.random() - 0.5) * 0.2,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.005 + Math.random() * 0.011,
        hue: 175 + Math.random() * 80, // cyan → magenta range
        alpha: 0.18 + Math.random() * 0.42,
        life: 0
      };
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Particle count scales with viewport area, capped for mobile perf.
      const target = Math.min(140, Math.round((width * height * density) / 14000));
      particles = Array.from({ length: target }, () => spawn());
    }

    function step(now) {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      // Pulse wave: a soft vertical band sweeping left-to-right every ~7s.
      const elapsed = (now - pulseStart) % 7000;
      const pulseProgress = elapsed / 7000;
      if (pulseProgress < 1) {
        const px = pulseProgress * (width + 220) - 110;
        const grd = ctx.createLinearGradient(px - 90, 0, px + 90, 0);
        grd.addColorStop(0, "rgba(34,211,238,0)");
        grd.addColorStop(0.5, "rgba(34,211,238,0.07)");
        grd.addColorStop(1, "rgba(34,211,238,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(px - 90, 0, 180, height);
      }

      for (const particle of particles) {
        particle.wobble += particle.wobbleSpeed;
        particle.x += particle.vx + Math.sin(particle.wobble) * 0.18;
        particle.y += particle.vy;
        particle.life += 1;

        // Recycle particles that drift off the top or live too long.
        if (particle.y < -10 || particle.life > 1400) {
          Object.assign(particle, spawn(Math.random() * width, height + 8));
        }

        const grd = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 6);
        grd.addColorStop(0, `hsla(${particle.hue}, 95%, 70%, ${particle.alpha})`);
        grd.addColorStop(1, `hsla(${particle.hue}, 95%, 70%, 0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${particle.hue}, 100%, 86%, ${Math.min(0.9, particle.alpha + 0.18)})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = window.requestAnimationFrame(step);
    }

    function pause() {
      running = false;
      window.cancelAnimationFrame(frame);
    }

    function resume() {
      if (running) return;
      running = true;
      frame = window.requestAnimationFrame(step);
    }

    function handleVisibility() {
      if (document.hidden) pause();
      else resume();
    }

    resize();
    frame = window.requestAnimationFrame(step);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      pause();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [density]);

  return <canvas ref={canvasRef} className="energy-particles" aria-hidden="true" />;
}
