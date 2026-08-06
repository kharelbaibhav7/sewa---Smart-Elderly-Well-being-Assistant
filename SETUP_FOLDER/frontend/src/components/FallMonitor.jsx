import { useRef, useEffect, useState, useCallback } from "react";
import { usePoseDetection } from "../hooks/usePoseDetection";
import {
  createFallDetector,
  defaultBedZone,
  drawPoseOverlay,
} from "../utils/fallDetection";
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
  const [lastFall, setLastFall] = useState(null);
  const [showBedZone, setShowBedZone] = useState(true);

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

      try {
        await fetch(`${API_BASE}/api/fall-alert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

    const bedZone = showBedZone
      ? defaultBedZone(frameWidth, frameHeight)
      : null;

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
    <div className="fall-monitor">
      <div className="monitor-header">
        <h2>Live Fall Monitor</h2>
        <div className="monitor-controls">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showBedZone}
              onChange={(e) => setShowBedZone(e.target.checked)}
              disabled={isMonitoring}
            />
            Bed zone detection
          </label>
          {!isMonitoring ? (
            <button
              className="btn btn-primary"
              onClick={handleStart}
              disabled={!isReady || !!modelError}
            >
              {isReady ? "Start Monitoring" : "Loading AI model..."}
            </button>
          ) : (
            <button className="btn btn-danger" onClick={handleStop}>
              Stop Monitoring
            </button>
          )}
          {status === "fall_detected" && (
            <button className="btn btn-warning" onClick={handleDismissAlert}>
              Dismiss Alert
            </button>
          )}
        </div>
      </div>

      {(cameraError || modelError) && (
        <div className="error-banner">{cameraError || modelError}</div>
      )}

      <div className="video-container">
        <video ref={videoRef} className="camera-feed" playsInline muted />
        <canvas ref={canvasRef} className="pose-overlay" />
        {!isMonitoring && (
          <div className="video-placeholder">
            <span>Camera feed will appear here</span>
          </div>
        )}
      </div>

      <div className={`status-bar status-${status}`}>
        <span className="status-dot" />
        <span>
          {status === "idle" && "Ready — start monitoring to watch the elder"}
          {status === "monitoring" && "Monitoring — elder is upright and safe"}
          {status === "watching" && "Watching — unusual posture detected"}
          {status === "partial_detection" && "Partial detection — reposition camera"}
          {status === "no_person" && "No person detected in frame"}
          {status === "fall_detected" &&
            `ALERT: ${lastFall?.fallType === "bed" ? "Bed fall" : "Ground fall"} detected!`}
        </span>
      </div>
    </div>
  );
}
