import { Router } from "express";
import {
  getGuardianProfile,
  linkPatient,
  getPatientData,
  scheduleMedicine,
} from "../controller/guardianController.js";
import {
  createFallAlert,
  getFallAlerts,
  acknowledgeFallAlert,
} from "../controller/fallAlertController.js";
import { verifyToken, isGuardian } from "../middleware/authMiddleware.js";

const guardianRouter = Router();

guardianRouter.use(verifyToken, isGuardian);

guardianRouter.route("/profile").get(getGuardianProfile);
guardianRouter.route("/link-patient").post(linkPatient);
guardianRouter.route("/patient-info").get(getPatientData);
guardianRouter.route("/schedule-medicine").post(scheduleMedicine);
guardianRouter.route("/fall-alert").post(createFallAlert).get(getFallAlerts);
guardianRouter.route("/fall-alert/:id/acknowledge").patch(acknowledgeFallAlert);

export default guardianRouter;
