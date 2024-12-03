// routes/reportRoute.js
import express from "express";
import {
  createMedicalReport,
  getMedicalReports,
  getMedicalReport,
  updateMedicalReport,
  deleteMedicalReport,
  generateReportPDF,
  getDoctorPatients,
} from "../controllers/reportController.js";
import authDoctor from "../middlewares/authDoctor.js";

const reportRouter = express.Router();

// Routes protégées par l'authentification du médecin
reportRouter.use(authDoctor);

reportRouter.get("/patients", getDoctorPatients);

// Route pour créer un nouveau rapport médical
reportRouter.post("/", createMedicalReport);

// Route pour obtenir tous les rapports d'un patient
reportRouter.get("/patient/:patientId", getMedicalReports);

// Route pour obtenir un rapport spécifique
reportRouter.get("/:reportId", getMedicalReport);

// Route pour mettre à jour un rapport
reportRouter.put("/:reportId", updateMedicalReport);

// Route pour supprimer un rapport
reportRouter.delete("/:reportId", deleteMedicalReport);

// Route pour générer un PDF du rapport
reportRouter.get("/:reportId/pdf", generateReportPDF);

export default reportRouter;
