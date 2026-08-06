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
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/patient/fall-alert`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
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
        <div className="rounded-3xl bg-gray-800 border border-gray-700 p-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-white">Alert Status</h3>
                    <p className="text-sm text-gray-400 mt-1">Fall event history and monitoring status.</p>
                </div>
                <div className={`rounded-full px-3 py-1 text-sm font-semibold ${currentStatus?.status === "fall_detected" ? "bg-red-600 text-white" : "bg-emerald-500 text-black"}`}>
                    {currentStatus?.status === "fall_detected" ? "ALERT" : "SAFE"}
                </div>
            </div>

            <div className="mt-6 rounded-3xl bg-gray-900 p-4 border border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Current</span>
                    <span className="font-medium text-white">
                        {currentStatus?.status === "idle"
                            ? "Standby"
                            : currentStatus?.status === "monitoring"
                                ? "Monitoring"
                                : currentStatus?.status === "fall_detected"
                                    ? "Fall Detected"
                                    : "Watching"}
                    </span>
                </div>

                {currentStatus?.metrics && (
                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-300">
                        <div className="rounded-2xl bg-gray-800 p-3">
                            Torso angle: {currentStatus.metrics.torsoAngle?.toFixed(0)}°
                        </div>
                        <div className="rounded-2xl bg-gray-800 p-3">
                            Hip ratio: {(currentStatus.metrics.normalizedHipY * 100).toFixed(0)}%
                        </div>
                    </div>
                )}
            </div>

            <h4 className="mt-6 text-lg font-semibold text-white">Recent Falls</h4>
            {loading && history.length === 0 ? (
                <p className="mt-4 text-gray-400">Loading fall history...</p>
            ) : history.length === 0 ? (
                <p className="mt-4 text-gray-400">No fall events recorded yet.</p>
            ) : (
                <ul className="mt-4 space-y-3">
                    {history.map((event, index) => (
                        <li key={event._id || event.timestamp || index} className="rounded-3xl bg-gray-900 p-4 border border-gray-700">
                            <div className="flex items-center justify-between gap-3 text-sm text-gray-300">
                                <span className="font-semibold text-white">{event.fallType === "bed" ? "Bed Fall" : "Ground Fall"}</span>
                                <span>{new Date(event.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-400">
                                Confidence: {(event.confidence * 100).toFixed(0)}%
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
