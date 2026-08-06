import express, { json } from "express";
import { port } from "./src/constant/constant.js";
import cors from "cors";
import errorMiddleware from "./src/middleware/errorMiddleware.js";
// import connectToMongoDb from "./src/connectDB/connectToMongoDB.js";

const app = express();
app.use(cors());

const current_port = port || 8000;
app.listen(port, () => {
  console.log(`express app is listening at port ${current_port}`);
  // connectToMongoDb();
});
app.use(json());

// app.use("/api", router)
// import authRouter from "./src/router/authRouter.js";
// import guardianRouter from "./src/router/guardianRouter.js";
// import patientRouter from "./src/router/patientRouter.js";

// app.use("/api/auth", authRouter);
// app.use("/api/guardian", guardianRouter);
// app.use("/api/patient", patientRouter);

app.use(errorMiddleware);
