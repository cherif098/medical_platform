import express from "express";
import {
  createMedicalReport,
  getMedicalReports,
  getMedicalReport,
  updateMedicalReport,
  deleteMedicalReport,
  getDoctorPatients,
  getPatientMedicalReport,
  downloadPDF,
  getPatientMedicalReports,
  getReports,
  getReportDetails,
  fetchNurseNotes,
  modifyVitalSigns,
} from "../controllers/reportController.js";
import authDoctor from "../middlewares/authDoctor.js";
import authPatient from "../middlewares/authPatient.js";
import authNurse from "../middlewares/authNurse.js";

const reportRouter = express.Router();

// Routes pour les patients (à placer AVANT les routes avec :reportId)
reportRouter.get("/patient-reports", authPatient, getPatientMedicalReports);
reportRouter.get("/patient-report/:reportId",authPatient,getPatientMedicalReport);
reportRouter.get("/patient-report/:reportId/pdf",downloadPDF);

// Routes pour les médecins
reportRouter.get("/patients", authDoctor, getDoctorPatients);
reportRouter.get("/patient/:patientId",authDoctor, getMedicalReports);
reportRouter.post("/", authDoctor, createMedicalReport);

// Routes avec :reportId en dernier
reportRouter.get("/:reportId", authDoctor, getMedicalReport);
reportRouter.put("/:reportId", authDoctor, updateMedicalReport);
reportRouter.delete("/:reportId", authDoctor, deleteMedicalReport);
reportRouter.get("/:reportId/pdf", authDoctor, downloadPDF);
reportRouter.get("/:reportId/nurse-notes", authDoctor ,fetchNurseNotes);

// nurses
reportRouter.get("/nurse/patients/:patientId/reports", authNurse, getReports);
reportRouter.get("/nurse/:reportId", authNurse, getReportDetails);
reportRouter.get("/nurse/:reportId/pdf", authNurse, downloadPDF);
reportRouter.put("/nurse/:reportId/vital-signs", authNurse, modifyVitalSigns);




export default reportRouter;
