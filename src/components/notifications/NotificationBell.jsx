import { Bell } from "lucide-react";

/**
 * Bell icon button for the top bar. Shows a red dot + count badge when there
 * are active alerts (Critical/Warning/Hardware/High severity). The whole pulse
 * animation fires only when there's at least one active alert — never on idle.
 */
export default function NotificationBell({ alertCount = 0, totalCount = 0, onOpen, open }) {
  const hasAlerts = alertCount > 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={
        hasAlerts
          ? `${alertCount} active ${alertCount === 1 ? "alert" : "alerts"} — open notifications`
          : "Open notifications"
      }
      aria-expanded={open}
      className={`notification-bell ${hasAlerts ? "notification-bell--alerted" : ""}`}
    >
      <span className="notification-bell__icon" aria-hidden="true">
        <Bell size={17} strokeWidth={2.1} />
      </span>
      {totalCount > 0 ? (
        <span
          className={`notification-bell__badge ${hasAlerts ? "notification-bell__badge--alert" : ""}`}
          aria-hidden="true"
        >
          {hasAlerts ? "!" : totalCount > 9 ? "9+" : totalCount}
        </span>
      ) : null}
      {hasAlerts ? <span className="notification-bell__pulse" aria-hidden="true" /> : null}
    </button>
  );
}
