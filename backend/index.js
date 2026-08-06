import express, { json } from "express";
import { port } from "./src/constant/constant.js";
import cors from "cors";
import errorMiddleware from "./src/middleware/errorMiddleware.js";
import connectToMongoDb from "./src/connectDB/connectToMongoDB.js";

const app = express();
app.use(cors());
app.use(json());

import authRouter from "./src/router/authRouter.js";
import guardianRouter from "./src/router/guardianRouter.js";
import patientRouter from "./src/router/patientRouter.js";
import hospitalRouter from "./src/router/hospitalRouter.js";

app.use("/api/auth", authRouter);
app.use("/api/guardian", guardianRouter);
app.use("/api/patient", patientRouter);
app.use("/api/hospital", hospitalRouter);

app.use(errorMiddleware);

const current_port = port || 8000;
app.listen(current_port, () => {
  console.log(`express app is listening at port ${current_port}`);
  connectToMongoDb();
});
