import express, { json } from "express";
import { port } from "./src/constant/constant.js";
import cors from "cors";
import errorMiddleware from "./src/middleware/errorMiddleware.js";
import connectToMongoDb from "./src/connectDB/connectToMongoDB.js";
import fallAlertRoutes from "./src/routes/fallAlertRoutes.js";

const app = express();
const current_port = port || 8000;

app.use(cors());
app.use(json());
app.use("/api", fallAlertRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "SEWA Backend" });
});

app.use(errorMiddleware);

app.listen(current_port, () => {
  console.log(`SEWA backend listening on port ${current_port}`);
  connectToMongoDb();
});
