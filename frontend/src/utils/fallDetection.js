const KEYPOINTS = {
  NOSE: 0,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
};

const MIN_CONFIDENCE = 0.35;
const TORSO_ANGLE_THRESHOLD = 52;
const GROUND_HIP_RATIO = 0.58;
const BED_EXIT_VELOCITY = 0.04;
const HISTORY_SIZE = 15;

function getKeypoint(keypoints, index) {
  const kp = keypoints[index];
  if (!kp || kp.score < MIN_CONFIDENCE) return null;
  return kp;
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function torsoAngleFromVertical(
  leftShoulder,
  rightShoulder,
  leftHip,
  rightHip,
) {
  const shoulderMid = midpoint(leftShoulder, rightShoulder);
  const hipMid = midpoint(leftHip, rightHip);
  const dx = hipMid.x - shoulderMid.x;
  const dy = hipMid.y - shoulderMid.y;
  return Math.abs((Math.atan2(dx, dy) * 180) / Math.PI);
}

function isInZone(point, zone) {
  if (!point || !zone) return false;
  return (
    point.x >= zone.x &&
    point.x <= zone.x + zone.width &&
    point.y >= zone.y &&
    point.y <= zone.y + zone.height
  );
}

export function createFallDetector(bedZone = null) {
  const history = [];

  return {
    analyze(pose, frameWidth, frameHeight) {
      if (!pose?.keypoints?.length) {
        return { status: "no_person", fallType: null, confidence: 0 };
      }

      const kps = pose.keypoints;
      const leftShoulder = getKeypoint(kps, KEYPOINTS.LEFT_SHOULDER);
      const rightShoulder = getKeypoint(kps, KEYPOINTS.RIGHT_SHOULDER);
      const leftHip = getKeypoint(kps, KEYPOINTS.LEFT_HIP);
      const rightHip = getKeypoint(kps, KEYPOINTS.RIGHT_HIP);

      if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
        return { status: "partial_detection", fallType: null, confidence: 0 };
      }

      const hipMid = midpoint(leftHip, rightHip);
      const torsoAngle = torsoAngleFromVertical(
        leftShoulder,
        rightShoulder,
        leftHip,
        rightHip,
      );
      const normalizedHipY = hipMid.y / frameHeight;
      const bodyHeight = Math.abs(leftShoulder.y - hipMid.y);
      const isHorizontal = torsoAngle >= TORSO_ANGLE_THRESHOLD;
      const isLow = normalizedHipY >= GROUND_HIP_RATIO;
      const isCollapsed = bodyHeight < frameHeight * 0.18;

      history.push({
        hipY: normalizedHipY,
        inBed: bedZone ? isInZone(hipMid, bedZone) : false,
        torsoAngle,
        timestamp: Date.now(),
      });
      if (history.length > HISTORY_SIZE) history.shift();

      let fallType = null;
      let confidence = 0;

      if (isHorizontal && (isLow || isCollapsed)) {
        fallType = "ground";
        confidence = Math.min(
          1,
          (torsoAngle - TORSO_ANGLE_THRESHOLD) / 30 +
            (normalizedHipY - 0.5) * 0.8,
        );
      }

      if (bedZone && history.length >= 4) {
        const wasInBed = history.slice(0, -3).some((h) => h.inBed);
        const nowOutOfBed = !isInZone(hipMid, bedZone);
        const recent = history.slice(-4);
        const yVelocity = recent[recent.length - 1].hipY - recent[0].hipY;

        if (
          wasInBed &&
          nowOutOfBed &&
          yVelocity > BED_EXIT_VELOCITY &&
          isHorizontal
        ) {
          fallType = "bed";
          confidence = Math.max(confidence, Math.min(1, yVelocity * 8 + 0.4));
        }
      }

      if (fallType) {
        return {
          status: "fall_detected",
          fallType,
          confidence,
          metrics: { torsoAngle, normalizedHipY, isHorizontal, isLow },
        };
      }

      const isUpright = torsoAngle < 25 && normalizedHipY < 0.55;
      return {
        status: isUpright ? "monitoring" : "watching",
        fallType: null,
        confidence: 0,
        metrics: { torsoAngle, normalizedHipY },
      };
    },

    reset() {
      history.length = 0;
    },
  };
}

export function defaultBedZone(frameWidth, frameHeight) {
  return {
    x: frameWidth * 0.1,
    y: frameHeight * 0.05,
    width: frameWidth * 0.8,
    height: frameHeight * 0.35,
  };
}

export function drawPoseOverlay(
  ctx,
  pose,
  frameWidth,
  frameHeight,
  bedZone,
  result,
) {
  if (!pose?.keypoints) return;

  ctx.clearRect(0, 0, frameWidth, frameHeight);
  if (bedZone) {
    ctx.strokeStyle = "rgba(100, 149, 237, 0.7)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(bedZone.x, bedZone.y, bedZone.width, bedZone.height);
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(100, 149, 237, 0.12)";
    ctx.fillRect(bedZone.x, bedZone.y, bedZone.width, bedZone.height);
    ctx.fillStyle = "rgba(100, 149, 237, 0.9)";
    ctx.font = "13px sans-serif";
    ctx.fillText("Bed Zone", bedZone.x + 8, bedZone.y + 20);
  }

  const connections = [
    [5, 6],
    [5, 11],
    [6, 12],
    [11, 12],
    [11, 13],
    [12, 14],
  ];

  const isFall = result?.status === "fall_detected";
  ctx.strokeStyle = isFall ? "#ff4444" : "#4ade80";
  ctx.lineWidth = 3;

  for (const [a, b] of connections) {
    const kpA = pose.keypoints[a];
    const kpB = pose.keypoints[b];
    if (kpA?.score > MIN_CONFIDENCE && kpB?.score > MIN_CONFIDENCE) {
      ctx.beginPath();
      ctx.moveTo(kpA.x, kpA.y);
      ctx.lineTo(kpB.x, kpB.y);
      ctx.stroke();
    }
  }

  for (const kp of pose.keypoints) {
    if (kp.score > MIN_CONFIDENCE) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = isFall ? "#ff4444" : "#4ade80";
      ctx.fill();
    }
  }

  if (isFall) {
    ctx.fillStyle = "rgba(255, 68, 68, 0.85)";
    ctx.fillRect(0, 0, frameWidth, 48);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px sans-serif";
    const label =
      result.fallType === "bed" ? "BED FALL DETECTED!" : "FALL DETECTED!";
    ctx.fillText(label, 16, 32);
  }
}
