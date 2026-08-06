import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AlertPanel({ currentStatus, recentFall }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (recentFall) {
      setHistory((prev) => [recentFall, ...prev].slice(0, 20));
    }
  }, [recentFall]);

  async function fetchHistory() {
    try {
      const res = await fetch(`${API_BASE}/api/fall-alert`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.events || []);
      }
    } catch {
      /* backend may be offline during dev */
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="alert-panel">
      <h3>Alert Status</h3>

      <div className={`alert-card ${currentStatus?.status === "fall_detected" ? "alert-active" : ""}`}>
        <div className="alert-card-label">Current Status</div>
        <div className="alert-card-value">
          {currentStatus?.status === "fall_detected"
            ? "FALL ALERT"
            : currentStatus?.status === "monitoring"
              ? "All Clear"
              : currentStatus?.status === "idle"
                ? "Standby"
                : "Monitoring"}
        </div>
        {currentStatus?.metrics && (
          <div className="alert-metrics">
            <span>Torso angle: {currentStatus.metrics.torsoAngle?.toFixed(0)}°</span>
            <span>Hip position: {(currentStatus.metrics.normalizedHipY * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>

      <h4>Fall Event History</h4>
      {loading && history.length === 0 ? (
        <p className="muted">Loading...</p>
      ) : history.length === 0 ? (
        <p className="muted">No fall events recorded yet.</p>
      ) : (
        <ul className="event-list">
          {history.map((event, i) => (
            <li key={event._id || event.timestamp || i} className="event-item">
              <span className={`event-type event-${event.fallType}`}>
                {event.fallType === "bed" ? "Bed Fall" : "Ground Fall"}
              </span>
              <span className="event-time">
                {new Date(event.timestamp).toLocaleString()}
              </span>
              <span className="event-confidence">
                {(event.confidence * 100).toFixed(0)}% confidence
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
