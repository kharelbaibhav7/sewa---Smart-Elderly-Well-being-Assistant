import asyncHandler from "express-async-handler";
import FallEvent from "../models/FallEvent.js";
import { triggerBuzzer, stopBuzzer } from "../services/buzzerService.js";

export const createFallAlert = asyncHandler(async (req, res) => {
  const { fallType, confidence, timestamp } = req.body;

  if (!fallType || !["ground", "bed"].includes(fallType)) {
    res.status(400);
    throw new Error("Invalid fallType. Must be 'ground' or 'bed'.");
  }

  const event = await FallEvent.create({
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
  const events = await FallEvent.find()
    .sort({ timestamp: -1 })
    .limit(50)
    .lean();

  res.json({ events });
});

export const acknowledgeFallAlert = asyncHandler(async (req, res) => {
  const event = await FallEvent.findByIdAndUpdate(
    req.params.id,
    { acknowledged: true },
    { new: true }
  );

  if (!event) {
    res.status(404);
    throw new Error("Fall event not found");
  }

  await stopBuzzer();

  res.json({ message: "Alert acknowledged", event });
});

export const manualBuzzerTest = asyncHandler(async (req, res) => {
  await triggerBuzzer(3000);
  res.json({ message: "Buzzer test triggered for 3 seconds" });
});
