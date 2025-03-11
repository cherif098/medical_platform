import express from "express";
import cors from "cors";
import "dotenv/config";
import { Server } from "socket.io";
import { createServer } from "http";
import { connectToSnowflake, executeQuery } from "./config/snowflake.js";

import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import patientRouter from "./routes/patientRoute.js";
import appointmentRouter from "./routes/appointmentRoute.js";
import reportRouter from "./routes/reportRoute.js";
import stripeRouter from "./routes/stripeRoute.js";
import nurseRouter from "./routes/nurseRoute.js";
import messageRouter from "./routes/messageRoute.js";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const port = process.env.PORT || 3000;
app.set('io', io);
process.env.GOOGLE_APPLICATION_CREDENTIALS = "C:\\protean-set-439816-u5-9842f9fa35d4.json";

// Middlewares
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  //console.log(`🔹 Requête reçue : ${req.method} ${req.originalUrl}`);
  next();
});

//  connexion Snowflake 
let snowflakeConnected = false;

async function initializeSnowflake() {
  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("❌ Connection timeout")), 5000)
    );
    await Promise.race([connectToSnowflake(), timeout]);
    snowflakeConnected = true;
    console.log("Snowflake connection initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Snowflake connection:", error);
    snowflakeConnected = false;
  }
}


io.on("connection", (socket) => {
  //console.log(`Nouveau client WebSocket connecté (${socket.id})`);
const joinConversation = async ({ userId, userType, otherUserId, otherUserType }, callback) => {
  try {
    const formattedSender = `${userType}_${userId}`;
    const formattedReceiver = `${otherUserType}_${otherUserId}`;
    const [first, second] = [formattedSender, formattedReceiver].sort();
    const conversationId = `${first}-${second}`;

    await socket.join(conversationId);
    callback({ status: "success", room: conversationId });
  } catch (error) {
    console.error("Erreur joinConversation:", error);
    callback({ status: "error" });
  }
};

  const leaveConversation = (conversationId) => {
    socket.leave(conversationId);
    console.log(`${socket.id} a quitté: ${conversationId}`);
  };

  // Événements
  socket.on("joinConversation", joinConversation);
  socket.on("leaveConversation", leaveConversation);

// Middleware pour logger les émissions
io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} a rejoint ${room}`);
});

io.of("/").adapter.on("leave-room", (room, id) => {
  console.log(`socket ${id} a quitté ${room}`);
});
  // ecoute les changements de statut
  socket.on("updateUserStatus", async ({ userId, userType, isOnline }) => {
    try {
      
      io.emit("userStatusUpdate", { userId, userType, isOnline });
    } catch (error) {
      console.error("Erreur de mise à jour du statut :", error);
    }
  });


  socket.on("userOffline", async ({ userId, userType }) => {
   // console.log(` Utilisateur ${userId} (${userType}) hors ligne`);
    io.emit("userOffline", { userId, userType });
  });

  // Déconnexion WebSocket
  socket.on("disconnect", () => {
    //console.log(`Client WebSocket déconnecté (${socket.id})`);
  });
});




// API Endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/patient", patientRouter);
app.use("/api/appointment", appointmentRouter);
app.use("/api/reports", reportRouter);
app.use("/api/stripe", stripeRouter);
app.use("/api/nurse", nurseRouter);
app.use("/api/messages", messageRouter);

// Démarrer le serveur
const startServer = async () => {
  try {
    await initializeSnowflake();
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
  }
};

startServer();
export { io };
