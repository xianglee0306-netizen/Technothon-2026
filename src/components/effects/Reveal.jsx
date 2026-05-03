import { useEffect, useRef, useState } from "react";

/**
 * Wraps any block of content in a fade-up reveal that triggers when the
 * element scrolls into view. Uses IntersectionObserver — single observer
 * per instance, disconnected after first reveal so we don't re-trigger
 * on every scroll. Respects prefers-reduced-motion (instant show).
 */
export default function Reveal({ children, delay = 0, distance = 32, duration = 700, as: Tag = "div", className = "", once = true }) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setRevealed(true);
      return undefined;
    }
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setRevealed(false);
          }
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${revealed ? "reveal--in" : ""} ${className}`}
      style={{
        "--reveal-delay": `${delay}ms`,
        "--reveal-distance": `${distance}px`,
        "--reveal-duration": `${duration}ms`
      }}
    >
      {children}
    </Tag>
  );
}
