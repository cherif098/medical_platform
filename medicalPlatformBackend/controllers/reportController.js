// controllers/reportController.js
import {
  createReport,
  getReportsByPatient,
  getReportById,
  updateReport,
  deleteReport,
} from "../models/reportModel.js";
import PDFDocument from "pdfkit";

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
    const updateData = req.body;

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

export const generateReportPDF = async (req, res) => {
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

    // Configuration de la réponse
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=rapport-medical-${reportId}.pdf`
    );

    // Création du document PDF
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });
    doc.pipe(res);

    // Fonctions utilitaires pour le formatage
    const formatDate = (date) =>
      new Date(date).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    const addSection = (title, content) => {
      doc.fontSize(12).font("Helvetica-Bold").text(title);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(content || "Non spécifié");
      doc.moveDown();
    };

    // En-tête du document
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("RAPPORT MÉDICAL", { align: "center" });
    doc.moveDown();

    // Informations d'identification
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("INFORMATIONS GÉNÉRALES", { underline: true });
    doc.moveDown();

    // Section Patient
    doc.fontSize(12).font("Helvetica-Bold").text("Information du Patient");
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Nom: ${report.PATIENT_NAME}`)
      .text(`Date de naissance: ${formatDate(report.DATE_OF_BIRTH)}`)
      .text(`Sexe: ${report.GENDER}`)
      .text(`Téléphone: ${report.PHONE}`)
      .text(`Adresse: ${report.ADRESSE}`);
    doc.moveDown();

    // Section Médecin
    doc.fontSize(12).font("Helvetica-Bold").text("Information du Médecin");
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Nom: ${report.DOCTOR_NAME}`)
      .text(`Spécialité: ${report.SPECIALTY}`);
    doc.moveDown();

    // Information de la consultation
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("CONSULTATION", { underline: true });
    doc.moveDown();

    addSection("Date de consultation:", formatDate(report.CONSULTATION_DATE));
    addSection(
      "Durée de la consultation:",
      `${report.CONSULTATION_DURATION || 0} minutes`
    );
    addSection("Motif de consultation:", report.CONSULTATION_REASON);

    // Évaluation clinique
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("ÉVALUATION CLINIQUE", { underline: true });
    doc.moveDown();

    addSection("Plainte principale:", report.MAIN_COMPLAINT);
    addSection(
      "Histoire de la maladie actuelle:",
      report.CURRENT_ILLNESS_HISTORY
    );

    // Signes vitaux
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("SIGNES VITAUX", { underline: true });
    doc.moveDown();

    const vitals = [
      `Température: ${report.TEMPERATURE || "N/A"} °C`,
      `Pression artérielle: ${report.BLOOD_PRESSURE || "N/A"}`,
      `Fréquence cardiaque: ${report.HEART_RATE || "N/A"} bpm`,
      `Fréquence respiratoire: ${report.RESPIRATORY_RATE || "N/A"} /min`,
      `Saturation en oxygène: ${report.OXYGEN_SATURATION || "N/A"} %`,
      `Poids: ${report.WEIGHT || "N/A"} kg`,
      `Taille: ${report.HEIGHT || "N/A"} cm`,
      `IMC: ${report.BMI || "N/A"} kg/m²`,
    ].join("\n");
    doc.fontSize(10).font("Helvetica").text(vitals);
    doc.moveDown();

    // Antécédents
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("ANTÉCÉDENTS", { underline: true });
    doc.moveDown();

    addSection("Antécédents personnels:", report.PERSONAL_HISTORY);
    addSection("Antécédents familiaux:", report.FAMILY_HISTORY);
    addSection("Habitudes de vie:", report.LIFESTYLE_HABITS);

    // Examen physique
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("EXAMEN PHYSIQUE", { underline: true });
    doc.moveDown();
    addSection("Observations:", report.PHYSICAL_EXAMINATION);

    // Examens complémentaires
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("EXAMENS COMPLÉMENTAIRES", { underline: true });
    doc.moveDown();

    addSection("Tests effectués:", report.TESTS_PERFORMED);
    addSection("Résultats:", report.TEST_RESULTS);

    // Diagnostic et traitement
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("DIAGNOSTIC ET TRAITEMENT", { underline: true });
    doc.moveDown();

    addSection("Diagnostic principal:", report.PRIMARY_DIAGNOSIS);
    addSection("Diagnostics différentiels:", report.DIFFERENTIAL_DIAGNOSIS);
    addSection("Notes sur l'évolution:", report.EVOLUTION_NOTES);

    // Plan de traitement
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("PLAN DE TRAITEMENT", { underline: true });
    doc.moveDown();

    addSection("Prescriptions:", report.PRESCRIPTIONS);
    addSection("Autres traitements:", report.OTHER_TREATMENTS);
    addSection("Recommandations:", report.RECOMMENDATIONS);
    addSection(
      "Prochain rendez-vous:",
      report.NEXT_APPOINTMENT
        ? formatDate(report.NEXT_APPOINTMENT)
        : "Non planifié"
    );

    // Incapacité et limitations
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("INCAPACITÉ ET LIMITATIONS", { underline: true });
    doc.moveDown();

    addSection("Évaluation de l'incapacité:", report.DISABILITY_EVALUATION);
    addSection(
      "Durée de l'incapacité:",
      report.DISABILITY_DURATION
        ? `${report.DISABILITY_DURATION} jours`
        : "Non spécifié"
    );
    addSection(
      "Recommandations de retour au travail:",
      report.WORK_RETURN_RECOMMENDATIONS
    );

    // Pied de page
    doc.moveDown(2);
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Date du rapport: " + formatDate(report.CREATED_AT), {
        align: "right",
      });
    if (report.UPDATED_AT) {
      doc.text("Dernière mise à jour: " + formatDate(report.UPDATED_AT), {
        align: "right",
      });
    }

    // Signature
    doc.moveDown(2);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Signature du médecin:", { align: "right" })
      .moveDown()
      .text(`Dr. ${report.DOCTOR_NAME}`, { align: "right" })
      .text(report.SPECIALTY, { align: "right" });

    // Finaliser le document
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
      error: error.message,
    });
  }
};
