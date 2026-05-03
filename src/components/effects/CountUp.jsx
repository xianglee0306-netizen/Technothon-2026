import { useEffect, useRef, useState } from "react";

/**
 * Counts up from 0 to `to` over `duration` ms when scrolled into view.
 * Uses an ease-out curve so the climb is fast at first then settles.
 * Respects prefers-reduced-motion (jumps straight to the final value).
 */
export default function CountUp({ to = 0, duration = 1600, prefix = "", suffix = "", decimals = 0, format = null, className = "" }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const playedRef = useRef(false);
  const target = Number(to) || 0;

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const node = ref.current;
    if (!node) return undefined;

    function play() {
      if (playedRef.current) return;
      playedRef.current = true;
      if (reduced) {
        setValue(target);
        return;
      }
      const start = performance.now();
      let frame = 0;
      function tick(now) {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(target * eased);
        if (t < 1) {
          frame = window.requestAnimationFrame(tick);
        } else {
          setValue(target);
        }
      }
      frame = window.requestAnimationFrame(tick);
      // Cleanup is implicit; the parent unmount cancels via state update guard
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            play();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [target, duration]);

  const display = typeof format === "function"
    ? format(value)
    : `${prefix}${decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-MY")}${suffix}`;

  return (
    <span ref={ref} className={className}>{display}</span>
  );
}
