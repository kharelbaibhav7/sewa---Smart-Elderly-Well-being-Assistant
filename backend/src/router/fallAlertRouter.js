import { Router } from "express";
import {
  createFallAlert,
  getFallAlerts,
  acknowledgeFallAlert,
} from "../controller/fallAlertController.js";

const router = Router();

router.post("/", createFallAlert);
router.get("/", getFallAlerts);
router.patch("/:id/acknowledge", acknowledgeFallAlert);

export default router;
