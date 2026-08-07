import { Router } from "express";
import {
  getHospitalProfile,
  linkPatient,
  getHospitalPatients,
  addHospitalNote,
} from "../controller/hospitalController.js";
import { verifyToken, isHospital } from "../middleware/authMiddleware.js";

const hospitalRouter = Router();

hospitalRouter.use(verifyToken, isHospital);

hospitalRouter.route("/profile").get(getHospitalProfile);
hospitalRouter.route("/link-patient").post(linkPatient);
hospitalRouter.route("/patients").get(getHospitalPatients);
hospitalRouter.route("/patient-note").post(addHospitalNote);

export default hospitalRouter;
