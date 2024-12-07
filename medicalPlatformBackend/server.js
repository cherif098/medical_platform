import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectToSnowflake, executeQuery } from "./config/snowflake.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import patientRouter from "./routes/patientRoute.js";
import appointmentRouter from "./routes/appointmentRoute.js";
import reportRouter from "./routes/reportRoute.js"; // Nouvelle importation
import stripeRouter from "./routes/stripeRoute.js";

//App config
const app = express();
const port = process.env.PORT || 3000;
connectCloudinary();

//Middlewares
app.use(express.json());
app.use(cors());

// Initialiser la connexion Snowflake au demarrage du serveur
let snowflakeConnected = false;

async function initializeSnowflake() {
  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout")), 5000)
    );
    await Promise.race([connectToSnowflake(), timeout]);
    snowflakeConnected = true;
    console.log("Snowflake connection initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Snowflake connection:", error);
    snowflakeConnected = false;
  }
}

//api endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/patient", patientRouter);
app.use("/api/appointment", appointmentRouter);
app.use("/api/reports", reportRouter);
app.use("/api/stripe", stripeRouter);

// Démarrer le serveur
const startServer = async () => {
  try {
    await initializeSnowflake();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
  }
};

startServer();
