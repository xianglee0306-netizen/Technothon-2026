import CountUp from "../effects/CountUp.jsx";
import Reveal from "../effects/Reveal.jsx";

/**
 * Massive stat block — big number with a small label. Loud-style typography
 * meant to shout. Used in the impact section.
 */
export default function StatGiant({ value, label, prefix = "", suffix = "", decimals = 0, accent = "default", delay = 0 }) {
  return (
    <Reveal delay={delay} className={`stat-giant stat-giant--${accent}`}>
      <p className="stat-giant__value">
        <CountUp to={value} prefix={prefix} suffix={suffix} decimals={decimals} duration={1800} />
      </p>
      <p className="stat-giant__label">{label}</p>
    </Reveal>
  );
}
