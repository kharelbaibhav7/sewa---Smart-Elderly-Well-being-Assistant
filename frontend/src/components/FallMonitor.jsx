import { useRef, useEffect, useState, useCallback } from "react";
import { usePoseDetection } from "../hooks/usePoseDetection";
import { createFallDetector, defaultBedZone, drawPoseOverlay } from "../utils/fallDetection";
import { startBuzzer, stopBuzzer } from "../utils/buzzer";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const ALERT_COOLDOWN_MS = 15000;

export default function FallMonitor({ onStatusChange, onFallEvent }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const detectorRef = useRef(null);
    const animFrameRef = useRef(null);
    const lastAlertRef = useRef(0);

    const { isReady, error: modelError, detectPose } = usePoseDetection();
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [status, setStatus] = useState("idle");
    const [showBedZone, setShowBedZone] = useState(true);
    const [lastFall, setLastFall] = useState(null);

    const updateStatus = useCallback(
        (newStatus, extra = {}) => {
            setStatus(newStatus);
            onStatusChange?.({ status: newStatus, ...extra });
        },
        [onStatusChange]
    );

    const triggerAlert = useCallback(
        async (fallType, confidence) => {
            const now = Date.now();
            if (now - lastAlertRef.current < ALERT_COOLDOWN_MS) return;
            lastAlertRef.current = now;

            const event = {
                fallType,
                confidence,
                timestamp: new Date().toISOString(),
            };

            setLastFall(event);
            onFallEvent?.(event);
            startBuzzer();

            toast.error(
                fallType === "bed"
                    ? "Bed fall detected! Buzzer activated."
                    : "Fall detected! Buzzer activated.",
                { duration: 6000 }
            );

            const token = localStorage.getItem("token");
            try {
                await fetch(`${API_BASE}/api/patient/fall-alert`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(event),
                });
            } catch {
                toast("Backend unreachable — local buzzer still active.", {
                    icon: "⚠️",
                });
            }
        },
        [onFallEvent]
    );

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: 640, height: 480 },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setCameraError(null);
            return true;
        } catch (err) {
            setCameraError(
                err.name === "NotAllowedError"
                    ? "Camera permission denied. Please allow camera access."
                    : "Could not access camera."
            );
            return false;
        }
    };

    const stopCamera = () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        stopBuzzer();
        setIsMonitoring(false);
        updateStatus("idle");
    };

    const runDetectionLoop = useCallback(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) {
            animFrameRef.current = requestAnimationFrame(runDetectionLoop);
            return;
        }

        const frameWidth = video.videoWidth;
        const frameHeight = video.videoHeight;

        if (canvas.width !== frameWidth) canvas.width = frameWidth;
        if (canvas.height !== frameHeight) canvas.height = frameHeight;

        const bedZone = showBedZone ? defaultBedZone(frameWidth, frameHeight) : null;
        if (!detectorRef.current) {
            detectorRef.current = createFallDetector(bedZone);
        }

        const pose = await detectPose(video);
        const result = detectorRef.current.analyze(pose, frameWidth, frameHeight);

        updateStatus(result.status, {
            fallType: result.fallType,
            confidence: result.confidence,
            metrics: result.metrics,
        });

        if (result.status === "fall_detected") {
            await triggerAlert(result.fallType, result.confidence);
        }

        const ctx = canvas.getContext("2d");
        drawPoseOverlay(ctx, pose, frameWidth, frameHeight, bedZone, result);

        animFrameRef.current = requestAnimationFrame(runDetectionLoop);
    }, [detectPose, showBedZone, triggerAlert, updateStatus]);

    const handleStart = async () => {
        if (!isReady) return;
        const ok = await startCamera();
        if (!ok) return;

        detectorRef.current = null;
        lastAlertRef.current = 0;
        setIsMonitoring(true);
        updateStatus("monitoring");
        animFrameRef.current = requestAnimationFrame(runDetectionLoop);
    };

    const handleStop = () => stopCamera();

    const handleDismissAlert = () => {
        stopBuzzer();
        lastAlertRef.current = Date.now();
        updateStatus("monitoring");
    };

    useEffect(() => () => stopCamera(), []);

    return (
        <div className="rounded-3xl bg-gray-800 border border-gray-700 p-5 space-y-6 shadow-xl shadow-black/20">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-white">Live Fall Monitor</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Use the device camera to detect falls and sound an alarm automatically.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={handleStart}
                        disabled={!isReady || isMonitoring}
                    >
                        {isReady ? "Start Monitoring" : "Loading AI model..."}
                    </button>
                    <button
                        className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={handleStop}
                        disabled={!isMonitoring}
                    >
                        Stop Monitoring
                    </button>
                    {status === "fall_detected" && (
                        <button
                            className="rounded-2xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-400"
                            onClick={handleDismissAlert}
                        >
                            Dismiss Alert
                        </button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_320px]">
                <div className="relative rounded-3xl overflow-hidden bg-black">
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                    <canvas ref={canvasRef} className="absolute inset-0" />
                    {!isMonitoring && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-white text-center p-6">
                            <span>Camera feed will appear here when monitoring starts.</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="rounded-3xl bg-gray-900 p-4 border border-gray-700">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-sm uppercase tracking-[0.2em] text-gray-500">Status</div>
                                <div className="mt-2 text-xl font-semibold text-white">
                                    {status === "idle" && "Standby"}
                                    {status === "monitoring" && "Monitoring"}
                                    {status === "watching" && "Watching"}
                                    {status === "partial_detection" && "Partial Detection"}
                                    {status === "no_person" && "No Person Detected"}
                                    {status === "fall_detected" && "Fall Detected"}
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                                {status === "fall_detected" ? "!" : "OK"}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-gray-900 p-4 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Detection Settings</h3>
                        </div>
                        <label className="mt-4 flex items-center gap-3 text-gray-300">
                            <input
                                type="checkbox"
                                checked={showBedZone}
                                onChange={(e) => setShowBedZone(e.target.checked)}
                                disabled={isMonitoring}
                                className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-emerald-500"
                            />
                            Show bed zone overlay
                        </label>
                        {cameraError && <p className="mt-3 text-sm text-red-400">{cameraError}</p>}
                        {modelError && <p className="mt-3 text-sm text-red-400">{modelError}</p>}
                    </div>

                    {lastFall && (
                        <div className="rounded-3xl bg-gray-900 p-4 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white">Last Fall Event</h3>
                            <p className="mt-2 text-sm text-gray-400">Type: {lastFall.fallType === "bed" ? "Bed fall" : "Ground fall"}</p>
                            <p className="mt-1 text-sm text-gray-400">Confidence: {(lastFall.confidence * 100).toFixed(0)}%</p>
                            <p className="mt-1 text-sm text-gray-400">Recorded at: {new Date(lastFall.timestamp).toLocaleString()}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
