import { useEffect, useRef } from "react";

/**
 * Electric cursor — a glowing dot follows the cursor with a soft trailing halo,
 * and clicks emit a small spark burst. Auto-disabled on touch devices and when
 * the user prefers reduced motion. Pure DOM transforms inside requestAnimationFrame
 * for 60fps smoothness with zero React re-renders.
 */
export default function CursorEffect() {
  const dotRef = useRef(null);
  const haloRef = useRef(null);
  const sparkLayerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    // Skip entirely on touch-primary devices and reduced-motion users.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduced) return undefined;

    const dot = dotRef.current;
    const halo = haloRef.current;
    const sparkLayer = sparkLayerRef.current;
    if (!dot || !halo || !sparkLayer) return undefined;

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let haloX = pointerX;
    let haloY = pointerY;
    let visible = false;
    let frame = 0;

    function setVisible(state) {
      if (visible === state) return;
      visible = state;
      dot.style.opacity = state ? "1" : "0";
      halo.style.opacity = state ? "1" : "0";
    }

    function handleMove(event) {
      pointerX = event.clientX;
      pointerY = event.clientY;
      setVisible(true);
    }

    function handleLeave() {
      setVisible(false);
    }

    function handleEnter() {
      setVisible(true);
    }

    function handleDown(event) {
      // Spark burst on click — 6 small particles fanning out.
      const burst = document.createElement("span");
      burst.className = "cursor-spark-burst";
      burst.style.left = `${event.clientX}px`;
      burst.style.top = `${event.clientY}px`;
      for (let i = 0; i < 6; i += 1) {
        const spark = document.createElement("span");
        spark.className = "cursor-spark";
        const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.6;
        const distance = 22 + Math.random() * 14;
        spark.style.setProperty("--spark-x", `${Math.cos(angle) * distance}px`);
        spark.style.setProperty("--spark-y", `${Math.sin(angle) * distance}px`);
        burst.appendChild(spark);
      }
      sparkLayer.appendChild(burst);
      window.setTimeout(() => burst.remove(), 700);
    }

    function handleHoverable(event) {
      const target = event.target;
      const interactive = target.closest("a, button, [role='button'], input, select, textarea, label.cursor-pointer");
      dot.classList.toggle("cursor-dot--hover", Boolean(interactive));
      halo.classList.toggle("cursor-halo--hover", Boolean(interactive));
    }

    function tick() {
      // Smoothly lerp the halo toward the actual pointer.
      haloX += (pointerX - haloX) * 0.18;
      haloY += (pointerY - haloY) * 0.18;
      dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
      halo.style.transform = `translate3d(${haloX}px, ${haloY}px, 0) translate(-50%, -50%)`;
      frame = window.requestAnimationFrame(tick);
    }

    // Hide the native cursor only after the effect is mounted, so users without
    // JS / on touch devices keep their normal cursor.
    document.body.classList.add("cursor-effect-active");
    frame = window.requestAnimationFrame(tick);
    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerover", handleHoverable, { passive: true });
    window.addEventListener("pointerdown", handleDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", handleLeave);
    document.documentElement.addEventListener("pointerenter", handleEnter);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerover", handleHoverable);
      window.removeEventListener("pointerdown", handleDown);
      document.documentElement.removeEventListener("pointerleave", handleLeave);
      document.documentElement.removeEventListener("pointerenter", handleEnter);
      document.body.classList.remove("cursor-effect-active");
    };
  }, []);

  return (
    <>
      <div ref={haloRef} className="cursor-halo" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={sparkLayerRef} className="cursor-spark-layer" aria-hidden="true" />
    </>
  );
}
