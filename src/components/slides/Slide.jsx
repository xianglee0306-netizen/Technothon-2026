import { useSlide } from "./SlideDeck.jsx";

/**
 * Slide — a single full-viewport slide with enter/exit transitions. Variants
 * pick the choreography style: 'fade-up' is the default soft fade-and-rise,
 * 'mask' is a more dramatic clip-path wipe, 'scale' is a depth-zoom.
 *
 * The wrapper always renders the children but uses CSS transforms + opacity
 * to control visibility. We don't unmount slides on transition because that
 * would tear down the bulb / particle effects.
 */
export default function Slide({ children, variant = "fade-up", index, className = "" }) {
  // Subscribe to deck state so each slide knows where it stands.
  // Used to drive subtle parallax on the active slide content.
  const { current, total } = useSlide();
  const offset = typeof index === "number" ? index - current : 0;
  const isActive = offset === 0;
  const isPast = offset < 0;
  const isFuture = offset > 0;

  return (
    <section
      className={`slide slide--${variant} ${className}`}
      data-slide-state={isActive ? "active" : isPast ? "past" : "future"}
    >
      <div className="slide__inner">
        {children}
      </div>
    </section>
  );
}
