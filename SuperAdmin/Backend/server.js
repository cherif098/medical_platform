import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectToSnowflake } from "./config/snowflake.js";
import superAdminRouter from "../Backend/routes/superAdminRoute.js";
import paymentRouter from "../Backend/routes/paymentRoutes.js";

//App config
const app = express();
const port = process.env.PORT || 4000;

//Middlewares
app.use(
  cors({
    origin: [
      "http://localhost:5175",
      "http://localhost:3000",
      "http://localhost:3001",
    ], // Ajoute toutes les origines nécessaires
    credentials: true, // Permet l'envoi de cookies et headers d'auth
    methods: ["GET", "POST", "PUT", "DELETE"], // Autoriser les requêtes HTTP spécifiques
  })
);
app.use(express.json());

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
app.use("/api/superAdmin", superAdminRouter);
app.use("/api/payment", paymentRouter);

// Vérification du statut Snowflake
app.get("/api/status", (req, res) => {
  res.json({
    snowflakeConnected,
    serverStatus: "running",
  });
});

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
