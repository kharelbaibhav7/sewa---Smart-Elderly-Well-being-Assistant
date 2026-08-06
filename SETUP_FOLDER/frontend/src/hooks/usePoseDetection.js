import { useEffect, useRef, useState, useCallback } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";

export function usePoseDetection() {
  const detectorRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await tf.ready();
        await tf.setBackend("webgl");

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          {
            modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true,
          }
        );

        if (!cancelled) {
          detectorRef.current = detector;
          setIsReady(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load pose detection model");
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      detectorRef.current?.dispose?.();
      detectorRef.current = null;
    };
  }, []);

  const detectPose = useCallback(async (videoElement) => {
    if (!detectorRef.current || !videoElement) return null;

    const poses = await detectorRef.current.estimatePoses(videoElement, {
      flipHorizontal: false,
    });

    return poses[0] || null;
  }, []);

  return { isReady, error, detectPose };
}
