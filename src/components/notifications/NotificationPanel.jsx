import { AlertTriangle, BellOff, CircleAlert, Info, ServerCog, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

const ALERT_SEVERITIES = ["critical", "warning", "hardware", "high"];

function severityKey(severity) {
  return String(severity || "").toLowerCase();
}

function isAlertSeverity(severity) {
  return ALERT_SEVERITIES.includes(severityKey(severity));
}

function severityIcon(severity) {
  const key = severityKey(severity);
  if (key === "critical") return CircleAlert;
  if (key === "warning" || key === "high") return AlertTriangle;
  if (key === "hardware") return ServerCog;
  return Info;
}

function severityLabel(severity) {
  const key = severityKey(severity);
  if (key === "critical") return "Critical";
  if (key === "warning") return "Warning";
  if (key === "high") return "High";
  if (key === "hardware") return "Hardware";
  return "Info";
}

function severityClassName(severity) {
  const key = severityKey(severity);
  if (key === "critical") return "noti-card noti-card--critical";
  if (key === "warning" || key === "high") return "noti-card noti-card--warning";
  if (key === "hardware") return "noti-card noti-card--hardware";
  return "noti-card noti-card--info";
}

/**
 * Slide-in notification panel. Sorts alerts (Critical / Warning / Hardware /
 * High) above Info-level items, both visually highlighted on a warning-yellow
 * tinted background so they're impossible to miss.
 */
export default function NotificationPanel({ open, onClose, notifications = [] }) {
  const panelRef = useRef(null);

  const { alerts, info } = useMemo(() => {
    const arr = Array.isArray(notifications) ? notifications : [];
    return {
      alerts: arr.filter((item) => isAlertSeverity(item.severity)),
      info: arr.filter((item) => !isAlertSeverity(item.severity))
    };
  }, [notifications]);

  // Close on Escape; trap focus to the panel for accessibility.
  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    document.body.classList.add("noti-panel-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("noti-panel-open");
    };
  }, [open, onClose]);

  // Move keyboard focus to close button when panel opens.
  useEffect(() => {
    if (!open) return;
    const closeBtn = panelRef.current?.querySelector("[data-noti-close]");
    if (closeBtn instanceof HTMLElement) {
      closeBtn.focus();
    }
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`noti-overlay ${open ? "noti-overlay--open" : ""}`}
      aria-hidden={!open}
      onClick={(event) => {
        // Click on backdrop, not the panel itself, closes the panel.
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <aside
        ref={panelRef}
        className={`noti-panel ${open ? "noti-panel--open" : ""}`}
        role="dialog"
        aria-label="Notifications"
        aria-modal="true"
      >
        <header className="noti-panel__head">
          <div>
            <p className="noti-panel__eyebrow">Notification center</p>
            <h2 className="noti-panel__title">
              {alerts.length > 0
                ? `${alerts.length} ${alerts.length === 1 ? "alert needs" : "alerts need"} attention`
                : "All clear"}
            </h2>
          </div>
          <button
            type="button"
            data-noti-close
            onClick={onClose}
            className="noti-panel__close"
            aria-label="Close notifications"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="noti-panel__body">
          {alerts.length === 0 && info.length === 0 ? (
            <div className="noti-empty">
              <span className="noti-empty__icon" aria-hidden="true">
                <BellOff size={28} />
              </span>
              <p className="noti-empty__title">No notifications yet</p>
              <p className="noti-empty__msg">When the system detects waste, anomalies, or hardware issues, they'll show up here.</p>
            </div>
          ) : null}

          {alerts.length > 0 ? (
            <section className="noti-section noti-section--alerts">
              <div className="noti-section__head">
                <span className="noti-section__chip">
                  <AlertTriangle size={12} aria-hidden="true" />
                  Alerts ({alerts.length})
                </span>
                <p className="noti-section__hint">Take a look first — these affect cost, comfort, or hardware health.</p>
              </div>
              <ul className="noti-list">
                {alerts.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ) : null}

          {info.length > 0 ? (
            <section className="noti-section noti-section--info">
              <div className="noti-section__head">
                <span className="noti-section__chip noti-section__chip--info">
                  <Info size={12} aria-hidden="true" />
                  Info ({info.length})
                </span>
                <p className="noti-section__hint">Background updates and AI suggestions.</p>
              </div>
              <ul className="noti-list">
                {info.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </aside>
    </div>,
    document.body
  );
}

function NotificationCard({ item }) {
  const Icon = severityIcon(item.severity);
  return (
    <li className={severityClassName(item.severity)}>
      <span className="noti-card__icon" aria-hidden="true">
        <Icon size={15} strokeWidth={2} />
      </span>
      <div className="noti-card__body">
        <div className="noti-card__head">
          <p className="noti-card__title">{item.title}</p>
          <span className="noti-card__sev">{severityLabel(item.severity)}</span>
        </div>
        {item.message ? <p className="noti-card__msg">{item.message}</p> : null}
        <dl className="noti-card__meta">
          {item.time ? (
            <div>
              <dt>Time</dt>
              <dd>{item.time}</dd>
            </div>
          ) : null}
          {item.affectedZone ? (
            <div>
              <dt>Zone</dt>
              <dd>{item.affectedZone}</dd>
            </div>
          ) : null}
          {item.estimatedImpact ? (
            <div>
              <dt>Impact</dt>
              <dd>{item.estimatedImpact}</dd>
            </div>
          ) : null}
        </dl>
        {item.suggestedAction ? (
          <p className="noti-card__action">
            <span className="noti-card__action-label">Suggested · </span>
            {item.suggestedAction}
          </p>
        ) : null}
      </div>
    </li>
  );
}
