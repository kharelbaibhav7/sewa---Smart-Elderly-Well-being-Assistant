import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FallMonitor from "../components/FallMonitor";
import AlertPanel from "../components/AlertPanel";

export default function FallDetection() {
    const navigate = useNavigate();
    const [currentStatus, setCurrentStatus] = useState({ status: "idle" });
    const [recentFall, setRecentFall] = useState(null);

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
            <button
                onClick={() => navigate("/patient/dashboard")}
                className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>

            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr] items-start">
                <div>
                    <div className="mb-6 rounded-3xl bg-gray-800 border border-gray-700 p-6 shadow-xl shadow-black/20">
                        <h1 className="text-3xl font-bold text-white">Fall Detection</h1>
                        <p className="mt-3 text-gray-400">
                            Use the live camera monitor to detect falls and trigger an urgent alarm if an elderly person falls.
                        </p>
                    </div>
                    <FallMonitor onStatusChange={setCurrentStatus} onFallEvent={setRecentFall} />
                </div>

                <div className="space-y-6">
                    <AlertPanel currentStatus={currentStatus} recentFall={recentFall} />
                    <div className="rounded-3xl bg-gray-800 border border-gray-700 p-6 shadow-xl shadow-black/20">
                        <h2 className="text-2xl font-semibold text-white">How it works</h2>
                        <ul className="mt-4 space-y-3 text-gray-400 list-disc list-inside">
                            <li>Live pose detection runs in the browser using your camera.</li>
                            <li>Falls are classified as ground falls or bed falls.</li>
                            <li>When a fall is detected, an audible buzzer plays and the backend records the event.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
