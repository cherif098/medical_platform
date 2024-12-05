import express from "express";
import {
  createMedicalReport,
  getMedicalReports,
  getMedicalReport,
  updateMedicalReport,
  deleteMedicalReport,
  generateReportPDF,
  getDoctorPatients,
  getPatientMedicalReport,
  generatePatientReportPDF,
  getPatientMedicalReports,
} from "../controllers/reportController.js";
import authDoctor from "../middlewares/authDoctor.js";
import authPatient from "../middlewares/authPatient.js";

const reportRouter = express.Router();

// Routes pour les patients (à placer AVANT les routes avec :reportId)
reportRouter.get("/patient-reports", authPatient, getPatientMedicalReports);
reportRouter.get(
  "/patient-report/:reportId",
  authPatient,
  getPatientMedicalReport
);
reportRouter.get(
  "/patient-report/:reportId/pdf",

  generatePatientReportPDF
);

// Routes pour les médecins
reportRouter.get("/patients", authDoctor, getDoctorPatients);
reportRouter.get("/patient/:patientId", authDoctor, getMedicalReports);
reportRouter.post("/", authDoctor, createMedicalReport);

// Routes avec :reportId en dernier
reportRouter.get("/:reportId", authDoctor, getMedicalReport);
reportRouter.put("/:reportId", authDoctor, updateMedicalReport);
reportRouter.delete("/:reportId", authDoctor, deleteMedicalReport);
reportRouter.get("/:reportId/pdf", authDoctor, generateReportPDF);

export default reportRouter;
