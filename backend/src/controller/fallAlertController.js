import asyncHandler from "express-async-handler";
import FallEvent from "../schema/fallEvent.js";
import Guardian from "../schema/guardian.js";
import { triggerBuzzer, stopBuzzer } from "../services/buzzerService.js";

const resolvePatientId = async (req) => {
  if (req.user.role === "guardian") {
    const guardian = await Guardian.findById(req.user.id);
    if (!guardian || !guardian.patient) {
      const error = new Error("No patient linked to this guardian.");
      error.statusCode = 404;
      throw error;
    }
    return guardian.patient;
  }

  if (req.user.role === "patient") {
    return req.user.id;
  }

  const error = new Error("Invalid role for fall alert access.");
  error.statusCode = 403;
  throw error;
};

export const createFallAlert = asyncHandler(async (req, res) => {
  const { fallType, confidence, timestamp } = req.body;

  if (!fallType || !["ground", "bed"].includes(fallType)) {
    res.status(400);
    throw new Error("Invalid fallType. Must be 'ground' or 'bed'.");
  }

  const patientId = await resolvePatientId(req);

  const event = await FallEvent.create({
    patient: patientId,
    fallType,
    confidence: confidence ?? 0.5,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    buzzerTriggered: true,
  });

  await triggerBuzzer();

  res.status(201).json({
    message: "Fall alert recorded and buzzer triggered",
    event,
  });
});

export const getFallAlerts = asyncHandler(async (req, res) => {
  const patientId = await resolvePatientId(req);

  const events = await FallEvent.find({ patient: patientId })
    .sort({ timestamp: -1 })
    .limit(50)
    .lean();

  res.json({ events });
});

export const acknowledgeFallAlert = asyncHandler(async (req, res) => {
  const patientId = await resolvePatientId(req);

  const event = await FallEvent.findOneAndUpdate(
    { _id: req.params.id, patient: patientId },
    { acknowledged: true, acknowledgedAt: new Date() },
    { new: true },
  );

  if (!event) {
    res.status(404);
    throw new Error("Fall event not found");
  }

  await stopBuzzer();

  res.json({ message: "Alert acknowledged", event });
});
