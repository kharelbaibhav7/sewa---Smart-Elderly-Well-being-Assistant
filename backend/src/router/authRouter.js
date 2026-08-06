import { Router } from "express";
import {
  registerGuardian,
  registerPatient,
  registerHospital,
  login,
} from "../controller/authController.js";

const authRouter = Router();

authRouter.route("/register/guardian").post(registerGuardian);
authRouter.route("/register/patient").post(registerPatient);
authRouter.route("/register/hospital").post(registerHospital);
authRouter.route("/login").post(login);

export default authRouter;
