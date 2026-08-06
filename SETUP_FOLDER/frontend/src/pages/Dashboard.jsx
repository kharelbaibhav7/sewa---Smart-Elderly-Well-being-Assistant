import { useState } from "react";
import FallMonitor from "../components/FallMonitor";
import AlertPanel from "../components/AlertPanel";

export default function Dashboard() {
  const [currentStatus, setCurrentStatus] = useState({ status: "idle" });
  const [recentFall, setRecentFall] = useState(null);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>SEWA</h1>
          <p className="subtitle">Smart Elderly Well-being Assistant</p>
        </div>
        <div className="header-badge">
          <span className="pulse-dot" />
          Real-time Monitoring
        </div>
      </header>

      <div className="dashboard-grid">
        <FallMonitor
          onStatusChange={setCurrentStatus}
          onFallEvent={setRecentFall}
        />
        <AlertPanel currentStatus={currentStatus} recentFall={recentFall} />
      </div>

      <section className="info-section">
        <h3>How it works</h3>
        <div className="info-cards">
          <div className="info-card">
            <strong>Camera Monitoring</strong>
            <p>Uses your device camera with AI pose detection to track the elder in real time.</p>
          </div>
          <div className="info-card">
            <strong>Fall Detection</strong>
            <p>Detects when the elder falls to the ground or falls from the bed based on body posture.</p>
          </div>
          <div className="info-card">
            <strong>Buzzer Alert</strong>
            <p>Triggers an audible alarm immediately and notifies the backend to activate the hardware buzzer.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
