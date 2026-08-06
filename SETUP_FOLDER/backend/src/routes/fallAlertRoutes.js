import { Router } from "express";
import {
  createFallAlert,
  getFallAlerts,
  acknowledgeFallAlert,
  manualBuzzerTest,
} from "../controllers/fallAlertController.js";

const router = Router();

router.post("/fall-alert", createFallAlert);
router.get("/fall-alert", getFallAlerts);
router.patch("/fall-alert/:id/acknowledge", acknowledgeFallAlert);
router.post("/buzzer/test", manualBuzzerTest);

export default router;
