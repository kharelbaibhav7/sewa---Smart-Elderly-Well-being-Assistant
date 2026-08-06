import { Router } from "express";
import {
  getPatientProfile,
  triggerEmergency,
  getMedicineSchedule,
  updateProfile,
  logMedicineRecord,
} from "../controller/patientController.js";
import { verifyToken, isPatient } from "../middleware/authMiddleware.js";

const patientRouter = Router();

patientRouter.use(verifyToken, isPatient);

patientRouter.route("/profile").get(getPatientProfile).patch(updateProfile);
patientRouter.route("/emergency").post(triggerEmergency);
patientRouter.route("/medicine-schedule").get(getMedicineSchedule);
patientRouter.route("/medicine-record").post(logMedicineRecord);

export default patientRouter;
