import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const SlideContext = createContext({
  current: 0,
  total: 1,
  goNext: () => {},
  goPrev: () => {},
  goTo: () => {},
  progress: 0,
  isMobile: false
});

export function useSlide() {
  return useContext(SlideContext);
}

/**
 * SlideDeck — pinned full-viewport sections that advance on scroll/swipe/keys.
 * Inspired by GSAP/ScrollTrigger pinning patterns popularized by sites like
 * landonorris.com — but implemented with vanilla pointer + wheel events to
 * keep our zero-dependency stance.
 *
 * Behavior:
 *   - Desktop: wheel/trackpad scroll advances by one slide. Throttled to one
 *     advance per ~700ms so a single trackpad flick doesn't skip three slides.
 *   - Mobile: swipe up/down on touch. Threshold ~60px to count as a swipe.
 *   - Keyboard: ArrowDown/PageDown advance, ArrowUp/PageUp reverse.
 *   - The component locks page scroll while active and listens at the window
 *     level so the user can flick anywhere to advance.
 *
 * Children receive `useSlide()` context giving them current index, total
 * count, and progress (current / max). Each slide controls its own enter/exit
 * via the `data-active` attribute we set on its wrapper.
 */
export default function SlideDeck({ children, initialIndex = 0 }) {
  const slides = Array.isArray(children) ? children.filter(Boolean) : [children].filter(Boolean);
  const total = slides.length;
  const [current, setCurrent] = useState(initialIndex);
  const [isMobile, setIsMobile] = useState(false);
  const lastAdvanceRef = useRef(0);
  const touchStartYRef = useRef(null);
  const touchStartTimeRef = useRef(0);
  const containerRef = useRef(null);
  const wheelAccumulatorRef = useRef(0);
  const wheelTimeoutRef = useRef(null);

  // Detect mobile / touch primary input. Used to decide whether to
  // listen for wheel (desktop) or to rely on touch handlers (mobile).
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Lock body scroll while the deck is active so the document doesn't
  // scroll behind the pinned slides.
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  const goTo = useCallback((index) => {
    setCurrent((curr) => {
      const next = Math.max(0, Math.min(total - 1, index));
      if (next !== curr) {
        lastAdvanceRef.current = performance.now();
      }
      return next;
    });
  }, [total]);

  const goNext = useCallback(() => {
    setCurrent((curr) => {
      const next = Math.min(total - 1, curr + 1);
      if (next !== curr) lastAdvanceRef.current = performance.now();
      return next;
    });
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrent((curr) => {
      const next = Math.max(0, curr - 1);
      if (next !== curr) lastAdvanceRef.current = performance.now();
      return next;
    });
  }, []);

  // Wheel handler — desktop path. Throttle on time *and* require enough
  // accumulated delta so a tiny scroll doesn't fire an advance.
  useEffect(() => {
    if (typeof window === "undefined" || isMobile) return undefined;

    function onWheel(event) {
      // Don't intercept wheel inside a child that explicitly opts out
      // (e.g., a scrollable modal). We tag them with [data-no-snap].
      let target = event.target;
      while (target && target !== document.body) {
        if (target.dataset && target.dataset.noSnap === "true") return;
        target = target.parentElement;
      }

      event.preventDefault();
      const now = performance.now();
      const since = now - lastAdvanceRef.current;
      // Throttle: hold off for 700ms after each advance
      if (since < 700) return;

      // Accumulate small wheel events so trackpad inertia doesn't skip
      wheelAccumulatorRef.current += event.deltaY;
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        wheelAccumulatorRef.current = 0;
      }, 200);

      const threshold = 30;
      if (wheelAccumulatorRef.current > threshold) {
        wheelAccumulatorRef.current = 0;
        goNext();
      } else if (wheelAccumulatorRef.current < -threshold) {
        wheelAccumulatorRef.current = 0;
        goPrev();
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    };
  }, [goNext, goPrev, isMobile]);

  // Touch handlers — mobile swipe-to-advance
  useEffect(() => {
    if (typeof window === "undefined" || !isMobile) return undefined;

    function onTouchStart(event) {
      if (event.touches.length !== 1) return;
      touchStartYRef.current = event.touches[0].clientY;
      touchStartTimeRef.current = performance.now();
    }

    function onTouchMove(event) {
      // Don't prevent default on inputs or scrollable children
      let target = event.target;
      while (target && target !== document.body) {
        if (target.dataset && target.dataset.noSnap === "true") return;
        target = target.parentElement;
      }
      // Prevent rubber-band on iOS when on the deck itself
      if (event.cancelable) event.preventDefault();
    }

    function onTouchEnd(event) {
      if (touchStartYRef.current === null) return;
      const startY = touchStartYRef.current;
      const endY = event.changedTouches[0].clientY;
      const delta = startY - endY; // positive = swiped up
      const elapsed = performance.now() - touchStartTimeRef.current;
      touchStartYRef.current = null;

      const SWIPE_DISTANCE = 60;
      const SWIPE_TIME_MAX = 800;

      // Either a long-enough swipe or a fast flick
      const isFlick = elapsed < SWIPE_TIME_MAX && Math.abs(delta) > 30;
      if (Math.abs(delta) >= SWIPE_DISTANCE || isFlick) {
        if (delta > 0) goNext();
        else goPrev();
      }
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [goNext, goPrev, isMobile]);

  // Keyboard support for accessibility & power users
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    function onKey(event) {
      // Don't intercept when typing in an input/textarea
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable) return;

      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        goTo(total - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, goTo, total]);

  const progress = total > 1 ? current / (total - 1) : 0;

  return (
    <SlideContext.Provider value={{ current, total, goNext, goPrev, goTo, progress, isMobile }}>
      <div
        ref={containerRef}
        className="slide-deck"
        role="region"
        aria-roledescription="presentation"
        aria-label="GridSenseIQ landing presentation"
      >
        {slides.map((child, index) => {
          const offset = index - current;
          const state = offset === 0 ? "active" : offset < 0 ? "past" : "future";
          return (
            <div
              key={index}
              className={`slide-deck__slide slide-deck__slide--${state}`}
              data-slide-index={index}
              data-active={offset === 0 ? "true" : "false"}
              aria-hidden={offset !== 0}
              style={{
                "--slide-offset": offset,
                "--slide-abs-offset": Math.abs(offset)
              }}
            >
              {child}
            </div>
          );
        })}

        <SlideIndicator total={total} current={current} onJump={goTo} />
        <SlideAdvanceHint
          isMobile={isMobile}
          isLast={current === total - 1}
          onAdvance={goNext}
          onJumpToTop={() => goTo(0)}
        />
      </div>
    </SlideContext.Provider>
  );
}

function SlideIndicator({ total, current, onJump }) {
  return (
    <nav className="slide-indicator" aria-label="Slide navigation">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          className={`slide-indicator__dot ${i === current ? "slide-indicator__dot--active" : ""} ${i < current ? "slide-indicator__dot--past" : ""}`}
          onClick={() => onJump(i)}
          aria-label={`Go to slide ${i + 1} of ${total}`}
          aria-current={i === current ? "true" : undefined}
        >
          <span className="slide-indicator__dot-fill" aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}

function SlideAdvanceHint({ isMobile, isLast, onAdvance, onJumpToTop }) {
  // On the final slide, the icon becomes a "back to top" arrow.
  // Every other slide, it advances to the next.
  const handleClick = isLast ? onJumpToTop : onAdvance;
  const ariaLabel = isLast
    ? "Return to first slide"
    : (isMobile ? "Swipe up or tap to advance" : "Scroll down or click to advance");

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`slide-arrow ${isLast ? "slide-arrow--top" : ""}`}
      aria-label={ariaLabel}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        {isLast ? (
          // Up arrow (chevron)
          <path d="M6 15 L12 9 L18 15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ) : (
          // Down arrow (chevron)
          <path d="M6 9 L12 15 L18 9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        )}
      </svg>
    </button>
  );
}
