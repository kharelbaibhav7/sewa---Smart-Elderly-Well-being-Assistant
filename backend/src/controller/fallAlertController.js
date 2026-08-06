import asyncHandler from "express-async-handler";
import FallEvent from "../schema/fallEvent.js";
import { triggerBuzzer, stopBuzzer } from "../services/buzzerService.js";

export const createFallAlert = asyncHandler(async (req, res) => {
  const { fallType, confidence, timestamp } = req.body;

  if (!fallType || !["ground", "bed"].includes(fallType)) {
    res.status(400);
    throw new Error("Invalid fallType. Must be 'ground' or 'bed'.");
  }

  const event = await FallEvent.create({
    patient: req.user.id,
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
  const events = await FallEvent.find({ patient: req.user.id })
    .sort({ timestamp: -1 })
    .limit(50)
    .lean();

  res.json({ events });
});

export const acknowledgeFallAlert = asyncHandler(async (req, res) => {
  const event = await FallEvent.findOneAndUpdate(
    { _id: req.params.id, patient: req.user.id },
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
