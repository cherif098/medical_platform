import express from "express";
import cors from "cors";
import 'dotenv/config'
import { connectToSnowflake, executeQuery } from "./config/snowflake.js";
import connectCloudinary from "./config/cloudinary.js";
import { insertDoctor } from "./models/doctorModel.js"
import { insertPatient } from "./models/patientModel.js"
import adminRouter from "./routes/adminRoute.js";

//App config
const app = express();
const port = process.env.PORT || 3000;
connectCloudinary()

//Middlewares
app.use(express.json());
app.use(cors());

// Initialiser la connexion Snowflake au demarrage du serveur
let snowflakeConnected = false;

async function initializeSnowflake() {
    try {
        const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), 5000) // Timeout apres 5 secondes
        );
        await Promise.race([connectToSnowflake(), timeout]); 
        snowflakeConnected = true;
        console.log('Snowflake connection initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Snowflake connection:', error);
        snowflakeConnected = false;
    }
}


//api endpoints
app.get("/", (req, res) => {
    res.status(200).send("Hello Medical Platform API");
});

app.use('/api/admin', adminRouter)


// Endpoint to add a doctor
app.post("/doctors", async (req, res) => {
    try {
        const doctor = req.body;
        if (!snowflakeConnected) {
            return res.status(503).json({ error: "Database connection not available" });
        }
        await insertDoctor(doctor);
        res.status(201).json({ message: "Doctor added successfully" });
    } catch (error) {
        console.error("Error adding doctor:", error);
        res.status(500).json({ error: "Failed to add doctor" });
    }
});


// Dmarrer le serveur
const startServer = async () => {
    try {
        await initializeSnowflake();
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Server startup error:', error);
    }
};

startServer();