import { Router } from "express";
import {
  getGuardianProfile,
  linkPatient,
  getPatientData,
  scheduleMedicine,
} from "../controller/guardianController.js";
import { verifyToken, isGuardian } from "../middleware/authMiddleware.js";

const guardianRouter = Router();

guardianRouter.use(verifyToken, isGuardian);

guardianRouter.route("/profile").get(getGuardianProfile);
guardianRouter.route("/link-patient").post(linkPatient);
guardianRouter.route("/patient-info").get(getPatientData);
guardianRouter.route("/schedule-medicine").post(scheduleMedicine);

export default guardianRouter;
