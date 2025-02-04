// controllers/reportController.js
import {
  createReport,
  getReportsByPatient,
  getReportById,
  updateReport,
  deleteReport,
  getDoctorPatientsList,
  getPatientReportById,
  getPatientReports,
  getMReports,
  getMReportById,
  getNurseNotesForReport,
  UpdateVitalSigns,
} from "../models/reportModel.js";
import PDFDocument from "pdfkit";
import jwt from "jsonwebtoken";


export const getDoctorPatients = async (req, res) => {
  try {
    const doctorId = req.user.DOCTOR_ID;
    const patients = await getDoctorPatientsList(doctorId);

    res.json({
      success: true,
      patients: patients,
    });
  } catch (error) {
    console.error("Error in getDoctorPatients:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patients list",
      error: error.message,
    });
  }
};

export const createMedicalReport = async (req, res) => {
  try {
    const doctorId = req.user.DOCTOR_ID;
    const reportData = {
      ...req.body,
      DOCTOR_ID: doctorId,
      STATUS: "DRAFT",
    };

    const result = await createReport(reportData);

    res.status(201).json({
      success: true,
      message: "Medical report created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in createMedicalReport:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create medical report",
      error: error.message,
    });
  }
};

export const getMedicalReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.DOCTOR_ID;

    const reports = await getReportsByPatient(patientId, doctorId);

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Error in getMedicalReports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch medical reports",
      error: error.message,
    });
  }
};

export const getMedicalReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const doctorId = req.user.DOCTOR_ID;

    const report = await getReportById(reportId, doctorId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error in getMedicalReport:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch medical report",
      error: error.message,
    });
  }
};

export const updateMedicalReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const doctorId = req.user.DOCTOR_ID;

    // Filtrer les données reçues pour ne garder que les champs de la table REPORTS
    const updateData = {
      CONSULTATION_DATE: req.body.CONSULTATION_DATE,
      CONSULTATION_DURATION: req.body.CONSULTATION_DURATION,
      CONSULTATION_REASON: req.body.CONSULTATION_REASON,
      MAIN_COMPLAINT: req.body.MAIN_COMPLAINT,
      CURRENT_ILLNESS_HISTORY: req.body.CURRENT_ILLNESS_HISTORY,
      TEMPERATURE: req.body.TEMPERATURE,
      BLOOD_PRESSURE: req.body.BLOOD_PRESSURE,
      HEART_RATE: req.body.HEART_RATE,
      RESPIRATORY_RATE: req.body.RESPIRATORY_RATE,
      OXYGEN_SATURATION: req.body.OXYGEN_SATURATION,
      WEIGHT: req.body.WEIGHT,
      HEIGHT: req.body.HEIGHT,
      BMI: req.body.BMI,
      PERSONAL_HISTORY: req.body.PERSONAL_HISTORY,
      FAMILY_HISTORY: req.body.FAMILY_HISTORY,
      LIFESTYLE_HABITS: req.body.LIFESTYLE_HABITS,
      PHYSICAL_EXAMINATION: req.body.PHYSICAL_EXAMINATION,
      TESTS_PERFORMED: req.body.TESTS_PERFORMED,
      TEST_RESULTS: req.body.TEST_RESULTS,
      PRIMARY_DIAGNOSIS: req.body.PRIMARY_DIAGNOSIS,
      DIFFERENTIAL_DIAGNOSIS: req.body.DIFFERENTIAL_DIAGNOSIS,
      EVOLUTION_NOTES: req.body.EVOLUTION_NOTES,
      PRESCRIPTIONS: req.body.PRESCRIPTIONS,
      OTHER_TREATMENTS: req.body.OTHER_TREATMENTS,
      RECOMMENDATIONS: req.body.RECOMMENDATIONS,
      NEXT_APPOINTMENT: req.body.NEXT_APPOINTMENT,
      DISABILITY_EVALUATION: req.body.DISABILITY_EVALUATION,
      DISABILITY_DURATION: req.body.DISABILITY_DURATION,
      WORK_RETURN_RECOMMENDATIONS: req.body.WORK_RETURN_RECOMMENDATIONS,
      STATUS: req.body.STATUS,
    };

    // Supprimer les champs undefined ou null
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined || updateData[key] === null) {
        delete updateData[key];
      }
    });

    const success = await updateReport(reportId, doctorId, updateData);

    if (success) {
      const updatedReport = await getReportById(reportId, doctorId);
      res.json({
        success: true,
        message: "Medical report updated successfully",
        data: updatedReport,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Report not found or you don't have permission to update it",
      });
    }
  } catch (error) {
    console.error("Error in updateMedicalReport:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update medical report",
      error: error.message,
    });
  }
};
export const deleteMedicalReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const doctorId = req.user.DOCTOR_ID;

    const success = await deleteReport(reportId, doctorId);

    if (success) {
      res.json({
        success: true,
        message: "Medical report deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Report not found or you don't have permission to delete it",
      });
    }
  } catch (error) {
    console.error("Error in deleteMedicalReport:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete medical report",
      error: error.message,
    });
  }
};


export const getPatientMedicalReports = async (req, res) => {
  try {
    const patientId = req.user.PATIENT_ID; 
    console.log(patientId);
    const reports = await getPatientReports(patientId);

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Error in getPatientMedicalReports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient reports",
      error: error.message,
    });
  }
};

export const getPatientMedicalReport = async (req, res) => {
  try {
    const patientId = req.user.PATIENT_ID;
    const reportId = req.params.reportId; // ID du rapport médical spécifique
    const reports = await getPatientReportById(reportId, patientId);


    console.log("Reports from database:", reports); // Pour déboguer

    res.json({
      success: true,
      reports: reports, // Assurez-vous que c'est un tableau
    });
  } catch (error) {
    console.error("Error in getPatientMedicalReports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
};



export const downloadPDF = async (req, res) => {
  try {
      console.log("📌 Requête reçue pour téléchargement PDF");
      console.log("🔍 Headers reçus :", req.headers);
  
      const dToken = req.headers.dtoken || req.headers.dToken;
      const nToken = req.headers.ntoken || req.headers.nToken;
  
      console.log("📝 dToken reçu :", dToken);
      console.log("📝 nToken reçu :", nToken);
  
      let report;
      let doctorId = null;
  
      if (dToken) {
        try {
          const decoded = jwt.verify(dToken, process.env.JWT_SECRET);
          doctorId = decoded.doctorId;
          console.log("✅ Doctor ID extrait du token :", doctorId);
        } catch (err) {
          console.error("🚨 Erreur lors du décodage du token JWT :", err);
          return res.status(401).json({ success: false, message: "Token invalide" });
        }
  
        report = await getReportById(req.params.reportId, doctorId);
      } else if (nToken) {
        report = await getMReportById(req.params.reportId);
      } else {
        report = await getPatientReportById(req.params.reportId);
      }
  
      if (!report) {
        return res.status(404).json({ success: false, message: "Report not found" });
      }
  
      console.log("📄 Rapport trouvé :", report);
  

    //  Générer le nom du fichier avec le nom du patient
    const patientName = report.PATIENT_NAME.replace(/\s+/g, "_"); 
    res.setHeader("Content-Disposition", `attachment; filename=rapport-${patientName}.pdf`);
    

    // Configuration de la réponse HTTP
    res.setHeader("Content-Type", "application/pdf");

    // Création du document PDF
    const doc = new PDFDocument({ size: "A4", margins: { top: 50, bottom: 50, left: 50, right: 50 } });
    doc.pipe(res);

    //  Fonctions utilitaires pour le formatage
    const formatDate = (date) => new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const addSection = (title, content) => {
      doc.fontSize(12).font("Helvetica-Bold").text(title);
      doc.fontSize(10).font("Helvetica").text(content || "Non spécifié");
      doc.moveDown();
    };

    //  En-tête du rapport
    doc.fontSize(18).font("Helvetica-Bold").text("RAPPORT MÉDICAL", { align: "center" });
    doc.moveDown(2);

    //  Informations générales
    doc.fontSize(14).font("Helvetica-Bold").text("INFORMATIONS GÉNÉRALES", { underline: true });
    doc.moveDown();

    addSection("Nom du patient", report.PATIENT_NAME);
    addSection("Date de naissance", formatDate(report.DATE_OF_BIRTH));
    addSection("Sexe", report.GENDER);
    addSection("Téléphone", report.PHONE);
    addSection("Adresse", report.ADRESSE);
    addSection("Email", report.EMAIL);

    //  Section Médecin
    doc.moveDown();
    doc.fontSize(12).font("Helvetica-Bold").text("Information du Médecin");
    doc.fontSize(10).font("Helvetica").text(`Nom: Dr. ${report.DOCTOR_NAME}`);
    doc.text(`Spécialité: ${report.SPECIALTY}`);
    doc.moveDown();

    //  Consultation
    doc.fontSize(14).font("Helvetica-Bold").text("CONSULTATION", { underline: true });
    doc.moveDown();
    addSection("Date de consultation", formatDate(report.CONSULTATION_DATE));
    addSection("Durée de la consultation", `${report.CONSULTATION_DURATION || 0} minutes`);
    addSection("Motif", report.CONSULTATION_REASON);

    //  Évaluation clinique
    doc.fontSize(14).font("Helvetica-Bold").text("ÉVALUATION CLINIQUE", { underline: true });
    doc.moveDown();
    addSection("Plainte principale", report.MAIN_COMPLAINT);
    addSection("Histoire de la maladie actuelle", report.CURRENT_ILLNESS_HISTORY);

    //  Signes vitaux
    doc.fontSize(14).font("Helvetica-Bold").text("SIGNES VITAUX", { underline: true });
    doc.moveDown();
    addSection("Température", `${report.TEMPERATURE || "N/A"} °C`);
    addSection("Pression artérielle", report.BLOOD_PRESSURE);
    addSection("Fréquence cardiaque", `${report.HEART_RATE || "N/A"} bpm`);
    addSection("Fréquence respiratoire", `${report.RESPIRATORY_RATE || "N/A"} /min`);
    addSection("Saturation O2", `${report.OXYGEN_SATURATION || "N/A"} %`);
    addSection("Poids", `${report.WEIGHT || "N/A"} kg`);
    addSection("Taille", `${report.HEIGHT || "N/A"} cm`);
    addSection("IMC", `${report.BMI || "N/A"} kg/m²`);

    //  Antécédents médicaux
    doc.fontSize(14).font("Helvetica-Bold").text("ANTÉCÉDENTS MÉDICAUX", { underline: true });
    doc.moveDown();
    addSection("Antécédents personnels", report.PERSONAL_HISTORY);
    addSection("Antécédents familiaux", report.FAMILY_HISTORY);
    addSection("Habitudes de vie", report.LIFESTYLE_HABITS);

    //  Examens et analyses
    doc.fontSize(14).font("Helvetica-Bold").text("EXAMENS ET ANALYSES", { underline: true });
    doc.moveDown();
    addSection("Tests effectués", report.TESTS_PERFORMED);
    addSection("Résultats", report.TEST_RESULTS);
    addSection("Examen physique", report.PHYSICAL_EXAMINATION);

    //  Diagnostic et traitement
    doc.fontSize(14).font("Helvetica-Bold").text("DIAGNOSTIC ET TRAITEMENT", { underline: true });
    doc.moveDown();
    addSection("Diagnostic principal", report.PRIMARY_DIAGNOSIS);
    addSection("Diagnostics différentiels", report.DIFFERENTIAL_DIAGNOSIS);
    addSection("Évolution du patient", report.EVOLUTION_NOTES);
    addSection("Traitement prescrit", report.PRESCRIPTIONS);
    addSection("Autres traitements", report.OTHER_TREATMENTS);
    addSection("Recommandations", report.RECOMMENDATIONS);
    addSection("Prochain rendez-vous", formatDate(report.NEXT_APPOINTMENT));

    //  Incapacité et limitations
    doc.fontSize(14).font("Helvetica-Bold").text("INCAPACITÉ ET LIMITATIONS", { underline: true });
    doc.moveDown();
    addSection("Évaluation de l'incapacité", report.DISABILITY_EVALUATION);
    addSection("Durée", `${report.DISABILITY_DURATION || "N/A"} jours`);
    addSection("Recommandations de retour au travail", report.WORK_RETURN_RECOMMENDATIONS);

    //  Pied de page
    doc.moveDown(2);
    doc.fontSize(10).font("Helvetica-Bold").text(`Date du rapport: ${formatDate(report.CREATED_AT)}`, { align: "right" });
    if (report.UPDATED_AT) {
      doc.text(`Dernière mise à jour: ${formatDate(report.UPDATED_AT)}`, { align: "right" });
    }

    //  Signature du médecin
    doc.moveDown(2);
    doc.text("Signature du médecin:", { align: "right" })
      .moveDown()
      .text(`Dr. ${report.DOCTOR_NAME}`, { align: "right" })
      .text(report.SPECIALTY, { align: "right" });

    //  Finaliser le document
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la génération du PDF", error: error.message });
  }
};


// for nurse
export const getReports = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    console.log(patientId);
    const reports = await getMReports(patientId);

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Error in getMReports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient reports",
      error: error.message,
    });
  }
};

export const getReportDetails = async (req, res) => {
  const { reportId } = req.params;

  try {
    console.log(`Fetching details for report ID: ${reportId}`);

    const report = await getMReportById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Report retrieved successfully",
      data: report,
    });
  } catch (error) {
    console.error("Error fetching report details:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching report details.",
      error: error.message,
    });
  }
}; 
// get nurse notes (for doctors)
export const fetchNurseNotes = async (req, res) => {
  try {
    const doctorId = req.user.DOCTOR_ID; 
    const { reportId } = req.params;

    console.log(`Doctor ${doctorId} is requesting nurse notes for report ${reportId}`);

    
    const notes = await getNurseNotesForReport(reportId);

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching nurse notes:", error);
    res.status(500).json({ error: "Failed to retrieve nurse notes" });
  }
};

// update vital signs (for nurses)
export const modifyVitalSigns = async (req, res) => {
  try {
    const { reportId } = req.params;
    const vitalSigns = req.body; 

    console.log(`Updating vital signs for report ${reportId}`, vitalSigns);

    const success = await UpdateVitalSigns(reportId, vitalSigns);

    if (success) {
      res.status(200).json({ success: true, message: "Vital signs updated successfully" });
    } else {
      res.status(404).json({ success: false, message: "Report not found" });
    }
  } catch (error) {
    console.error("Error updating vital signs:", error);
    res.status(500).json({ success: false, message: "Failed to update vital signs" });
  }
};




