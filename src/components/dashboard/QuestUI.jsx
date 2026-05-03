import { useEffect, useState } from "react";
import { Award, Crown, Flame, Lock, Sparkles, Star, Target, Trophy, Zap } from "lucide-react";

/**
 * QuestHero — full quest-card style hero replacing the simple progress strip.
 * Shows player avatar, level, XP bar, daily streaks, energy class.
 * Pulls "saved this month" data from dashboard summary if available.
 */
export function QuestHero({ recommendations, summary, mode }) {
  const totalXp = Math.min(1000, 200 + recommendations.length * 80);
  const lvl = Math.floor(totalXp / 250) + 1;
  const xpPct = Math.round((totalXp / 1000) * 100);
  const streak = 12;
  const co2Saved = Math.round(recommendations.reduce((s, r) => s + Number(r.estimatedCo2ReductionKg || 0), 0));
  const rmSaved = Math.round(recommendations.reduce((s, r) => s + Number(r.estimatedSavingsCost || 0), 0));

  const tierClass = mode === "enterprise" ? "S+" : mode === "business" ? "A" : "B";

  return (
    <article className="quest-hero">
      <div className="quest-hero__bg" aria-hidden="true">
        <svg viewBox="0 0 800 280" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="quest-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(52, 211, 153, 0.18)" />
              <stop offset="100%" stopColor="rgba(251, 191, 36, 0.12)" />
            </linearGradient>
          </defs>
          <rect width="800" height="280" fill="url(#quest-glow)" />
          {Array.from({ length: 16 }, (_, i) => (
            <circle key={i} cx={50 + i * 48} cy={140 + Math.sin(i) * 60} r={2 + (i % 3)} fill="rgba(254, 240, 138, 0.4)">
              <animate attributeName="opacity" values="0.3;1;0.3" dur={`${2 + (i % 3)}s`} begin={`${i * 0.2}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      </div>

      <div className="quest-hero__inner">
        <div className="quest-hero__avatar-block">
          <div className="quest-hero__avatar">
            <Trophy size={36} aria-hidden="true" />
            <span className="quest-hero__avatar-class">{tierClass}</span>
          </div>
          <div className="quest-hero__streak">
            <Flame size={14} aria-hidden="true" />
            <span>{streak}-day streak</span>
          </div>
        </div>

        <div className="quest-hero__player">
          <div className="quest-hero__player-top">
            <span className="quest-hero__lvl-badge">LVL {lvl}</span>
            <span className="quest-hero__title">Energy Champion</span>
            <span className="quest-hero__path">Path of the Conserver</span>
          </div>

          <div className="quest-hero__xp">
            <div className="quest-hero__xp-label-row">
              <span className="quest-hero__xp-label">EXPERIENCE</span>
              <span className="quest-hero__xp-num">{totalXp} / 1000 XP</span>
            </div>
            <div className="quest-hero__xp-track">
              <div className="quest-hero__xp-fill" style={{ width: `${xpPct}%` }} />
              <div className="quest-hero__xp-marker" style={{ left: `${xpPct}%` }} />
            </div>
            <p className="quest-hero__xp-next">{1000 - totalXp} XP until LVL {lvl + 1} → unlocks new automation rules</p>
          </div>

          <div className="quest-hero__stats">
            <QuestStat icon={Sparkles} label="RM saved" value={`RM ${rmSaved.toLocaleString()}`} tone="emerald" />
            <QuestStat icon={Zap} label="Quests done" value={recommendations.filter((r) => r.status === "Applied").length} tone="gold" />
            <QuestStat icon={Award} label="CO₂ avoided" value={`${co2Saved.toLocaleString()} kg`} tone="emerald" />
          </div>
        </div>
      </div>
    </article>
  );
}

function QuestStat({ icon: Icon, label, value, tone }) {
  return (
    <div className={`quest-hero__stat quest-hero__stat--${tone}`}>
      <Icon size={14} aria-hidden="true" />
      <div>
        <p className="quest-hero__stat-label">{label}</p>
        <p className="quest-hero__stat-value">{value}</p>
      </div>
    </div>
  );
}

/**
 * QuestAchievements — row of 5 achievement medallions.
 * Some unlocked (glowing), some locked.
 */
export function QuestAchievements({ recommendations }) {
  const applied = recommendations.filter((r) => r.status === "Applied").length;
  const achievements = [
    { id: "first", icon: Star, name: "First Quest", desc: "Apply your first recommendation", unlocked: applied >= 1, rarity: "common" },
    { id: "five", icon: Target, name: "Marksman", desc: "Apply 5 recommendations", unlocked: applied >= 5, rarity: "rare" },
    { id: "ten", icon: Crown, name: "Conserver", desc: "Apply 10 recommendations", unlocked: applied >= 10, rarity: "epic" },
    { id: "streak", icon: Flame, name: "Streak Master", desc: "Maintain a 30-day streak", unlocked: false, rarity: "legendary" },
    { id: "co2", icon: Award, name: "Carbon Slayer", desc: "Avoid 1000 kg CO₂", unlocked: false, rarity: "legendary" }
  ];

  return (
    <section className="quest-achievements">
      <div className="quest-achievements__head">
        <h2 className="quest-achievements__title">
          <Trophy size={16} aria-hidden="true" />
          <span>Achievements</span>
        </h2>
        <span className="quest-achievements__count">
          {achievements.filter((a) => a.unlocked).length} / {achievements.length} unlocked
        </span>
      </div>

      <div className="quest-achievements__grid">
        {achievements.map((a) => {
          const Icon = a.icon;
          return (
            <article key={a.id} className={`quest-medal quest-medal--${a.rarity} ${a.unlocked ? "quest-medal--unlocked" : "quest-medal--locked"}`}>
              <div className="quest-medal__ring" aria-hidden="true" />
              <div className="quest-medal__icon">
                {a.unlocked ? <Icon size={22} aria-hidden="true" /> : <Lock size={18} aria-hidden="true" />}
              </div>
              <p className="quest-medal__name">{a.name}</p>
              <p className="quest-medal__desc">{a.desc}</p>
              <span className="quest-medal__rarity">{a.rarity}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/**
 * QuestDailyChallenges — 3 quests derived from the user's top
 * unapplied recommendations. Each quest's title is the rec name, desc is
 * the rec description, reward shows real RM/CO₂ impact, progress reflects
 * status (Pending=0, In review=33, Approved=66, Applied=100). Rarity is
 * mapped from estimatedSavingsCost magnitude. The "resets in" timer
 * counts down to midnight MYT.
 */
export function QuestDailyChallenges({ mode, recommendations = [], onSimulate }) {
  // Map status → progress percent
  const statusProgress = {
    "Pending": 10,
    "Pending review": 33,
    "In review": 33,
    "Awaiting approval": 66,
    "Approved": 80,
    "Applied": 100,
    "Completed": 100
  };

  // Map savings to rarity tier
  function rarityFor(rec) {
    const savings = Number(rec.estimatedSavingsCost || 0);
    if (savings > 250) return "legendary";
    if (savings > 100) return "epic";
    if (savings > 30) return "rare";
    return "common";
  }

  // Map keywords in description to icon
  function iconFor(rec) {
    const text = `${rec.title || ""} ${rec.description || ""}`.toLowerCase();
    if (text.includes("hvac") || text.includes("ac") || text.includes("cooling")) return Zap;
    if (text.includes("audit") || text.includes("review") || text.includes("compare")) return Target;
    return Sparkles;
  }

  // Pick top 3 unapplied recommendations sorted by savings impact
  const candidates = recommendations
    .filter((r) => r.status !== "Applied" && r.status !== "Completed")
    .sort((a, b) => Number(b.estimatedSavingsCost || 0) - Number(a.estimatedSavingsCost || 0))
    .slice(0, 3);

  // Fallback: if no real recs, show generic but tier-aware quests
  const quests = candidates.length > 0
    ? candidates.map((rec, i) => {
        const status = rec.status || "Pending";
        const progress = statusProgress[status] != null ? statusProgress[status] : 25;
        const savings = Number(rec.estimatedSavingsCost || 0);
        const co2 = Math.round(Number(rec.estimatedCo2ReductionKg || 0));
        const xp = Math.max(40, Math.round(savings * 1.5));
        const rewardParts = [`+${xp} XP`];
        if (savings > 0) rewardParts.push(`RM ${Math.round(savings)}`);
        else if (co2 > 0) rewardParts.push(`${co2} kg CO₂`);

        return {
          id: rec.id || `q${i}`,
          icon: iconFor(rec),
          title: (rec.title || rec.name || "Recommendation").slice(0, 56),
          desc: (rec.description || rec.detail || "Apply this recommendation to claim the reward.").slice(0, 120),
          reward: rewardParts.join(" · "),
          progress,
          rarity: rarityFor(rec),
          // Pass-through for click action
          recId: rec.id
        };
      })
    : (mode === "enterprise"
        ? [
            { id: "q1", icon: Zap, title: "Reduce HVAC by 5%", desc: "Apply the AI Twin scenario before 6 PM", reward: "+150 XP · RM 280", progress: 60, rarity: "epic" },
            { id: "q2", icon: Target, title: "Audit 3 zones", desc: "Open and review zone consumption", reward: "+80 XP", progress: 33, rarity: "rare" },
            { id: "q3", icon: Sparkles, title: "Set after-hours rule", desc: "Configure compressor lockout 10 PM–6 AM", reward: "+200 XP · RM 420", progress: 0, rarity: "legendary" }
          ]
        : mode === "business"
          ? [
              { id: "q1", icon: Zap, title: "Closing-time auto", desc: "Enable closing-time automation", reward: "+120 XP · RM 60", progress: 80, rarity: "rare" },
              { id: "q2", icon: Target, title: "Benchmark vs peers", desc: "View industry comparison", reward: "+60 XP", progress: 45, rarity: "common" },
              { id: "q3", icon: Sparkles, title: "Standby drain hunt", desc: "Identify 2 idle devices", reward: "+90 XP · RM 25", progress: 20, rarity: "rare" }
            ]
          : [
              { id: "q1", icon: Zap, title: "AC schedule", desc: "Set bedroom AC to switch off at 6 AM", reward: "+80 XP · RM 18", progress: 70, rarity: "common" },
              { id: "q2", icon: Target, title: "Standby audit", desc: "Find 3 standby drainers", reward: "+100 XP · RM 12", progress: 33, rarity: "rare" },
              { id: "q3", icon: Sparkles, title: "Bill projection", desc: "Review projected vs actual", reward: "+40 XP", progress: 100, rarity: "common" }
            ]);

  // Live "resets in" countdown to midnight MYT (UTC+8). Updates each second.
  const [resetCountdown, setResetCountdown] = useState("");
  useEffect(() => {
    function update() {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / (60 * 60 * 1000));
      const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      setResetCountdown(`${h}h ${String(m).padStart(2, "0")}m`);
    }
    update();
    const id = setInterval(update, 30 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="quest-dailies">
      <div className="quest-dailies__head">
        <h2 className="quest-dailies__title">
          <Flame size={16} aria-hidden="true" />
          <span>Daily Quests</span>
        </h2>
        <span className="quest-dailies__refresh">Resets in {resetCountdown}</span>
      </div>

      <div className="quest-dailies__list">
        {quests.map((q) => {
          const Icon = q.icon;
          const isClickable = Boolean(q.recId && onSimulate);
          return (
            <article
              key={q.id}
              className={`quest-daily quest-daily--${q.rarity} ${isClickable ? "quest-daily--clickable" : ""}`}
              onClick={isClickable ? () => onSimulate(q.recId) : undefined}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSimulate(q.recId); } } : undefined}
            >
              <div className="quest-daily__icon-wrap" aria-hidden="true">
                <span className="quest-daily__icon">
                  <Icon size={18} />
                </span>
              </div>
              <div className="quest-daily__body">
                <div className="quest-daily__top-row">
                  <h3 className="quest-daily__title">{q.title}</h3>
                  <span className="quest-daily__rarity">{q.rarity}</span>
                </div>
                <p className="quest-daily__desc">{q.desc}</p>
                <div className="quest-daily__progress-wrap">
                  <div className="quest-daily__progress">
                    <div className="quest-daily__progress-fill" style={{ width: `${q.progress}%` }} />
                  </div>
                  <span className="quest-daily__progress-pct">{q.progress}%</span>
                </div>
                <div className="quest-daily__bottom-row">
                  <span className="quest-daily__reward">{q.reward}</span>
                  {isClickable ? (
                    <span className="quest-daily__time">Tap to simulate →</span>
                  ) : (
                    <span className="quest-daily__time">View →</span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/**
 * QuestPanelHeader — replacement section header for RecommendationPanel.
 * Themed as a "main quests" board.
 */
export function QuestPanelHeader({ count }) {
  return (
    <div className="quest-main-quests-head">
      <div className="quest-main-quests-head__left">
        <span className="quest-main-quests-head__icon" aria-hidden="true">
          <Trophy size={18} />
        </span>
        <div>
          <p className="quest-main-quests-head__eyebrow">MAIN STORY · CHAPTER 4</p>
          <h2 className="quest-main-quests-head__title">Recommendation Quests</h2>
        </div>
      </div>
      <div className="quest-main-quests-head__right">
        <span className="quest-main-quests-head__count">{count} active</span>
      </div>
    </div>
  );
}
