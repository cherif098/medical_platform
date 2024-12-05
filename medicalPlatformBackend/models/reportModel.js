// models/reportModel.js
import { executeQuery } from "../config/snowflake.js";

export const createReport = async (reportData) => {
  const {
    PATIENT_ID,
    DOCTOR_ID,
    CONSULTATION_DATE,
    CONSULTATION_DURATION,
    CONSULTATION_REASON,
    MAIN_COMPLAINT,
    CURRENT_ILLNESS_HISTORY,
    TEMPERATURE,
    BLOOD_PRESSURE,
    HEART_RATE,
    RESPIRATORY_RATE,
    OXYGEN_SATURATION,
    WEIGHT,
    HEIGHT,
    BMI,
    PERSONAL_HISTORY,
    FAMILY_HISTORY,
    LIFESTYLE_HABITS,
    PHYSICAL_EXAMINATION,
    TESTS_PERFORMED,
    TEST_RESULTS,
    PRIMARY_DIAGNOSIS,
    DIFFERENTIAL_DIAGNOSIS,
    EVOLUTION_NOTES,
    PRESCRIPTIONS,
    OTHER_TREATMENTS,
    RECOMMENDATIONS,
    NEXT_APPOINTMENT,
    DISABILITY_EVALUATION,
    DISABILITY_DURATION,
    WORK_RETURN_RECOMMENDATIONS,
    STATUS,
  } = reportData;

  // Première requête : Insertion
  const insertQuery = `
        INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.REPORTS (
            PATIENT_ID, DOCTOR_ID, CONSULTATION_DATE, CONSULTATION_DURATION,
            CONSULTATION_REASON, MAIN_COMPLAINT, CURRENT_ILLNESS_HISTORY,
            TEMPERATURE, BLOOD_PRESSURE, HEART_RATE, RESPIRATORY_RATE,
            OXYGEN_SATURATION, WEIGHT, HEIGHT, BMI, PERSONAL_HISTORY,
            FAMILY_HISTORY, LIFESTYLE_HABITS, PHYSICAL_EXAMINATION,
            TESTS_PERFORMED, TEST_RESULTS, PRIMARY_DIAGNOSIS,
            DIFFERENTIAL_DIAGNOSIS, EVOLUTION_NOTES, PRESCRIPTIONS,
            OTHER_TREATMENTS, RECOMMENDATIONS, NEXT_APPOINTMENT,
            DISABILITY_EVALUATION, DISABILITY_DURATION,
            WORK_RETURN_RECOMMENDATIONS, STATUS
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )`;

  const values = [
    PATIENT_ID,
    DOCTOR_ID,
    CONSULTATION_DATE,
    CONSULTATION_DURATION,
    CONSULTATION_REASON,
    MAIN_COMPLAINT,
    CURRENT_ILLNESS_HISTORY,
    TEMPERATURE,
    BLOOD_PRESSURE,
    HEART_RATE,
    RESPIRATORY_RATE,
    OXYGEN_SATURATION,
    WEIGHT,
    HEIGHT,
    BMI,
    PERSONAL_HISTORY,
    FAMILY_HISTORY,
    LIFESTYLE_HABITS,
    PHYSICAL_EXAMINATION,
    TESTS_PERFORMED,
    TEST_RESULTS,
    PRIMARY_DIAGNOSIS,
    DIFFERENTIAL_DIAGNOSIS,
    EVOLUTION_NOTES,
    PRESCRIPTIONS,
    OTHER_TREATMENTS,
    RECOMMENDATIONS,
    NEXT_APPOINTMENT,
    DISABILITY_EVALUATION,
    DISABILITY_DURATION,
    WORK_RETURN_RECOMMENDATIONS,
    STATUS || "DRAFT",
  ];

  try {
    await executeQuery(insertQuery, values);

    // Deuxième requête : Récupérer le dernier rapport inséré
    const getLastReportQuery = `
            SELECT *
            FROM MEDICAL_DB.MEDICAL_SCHEMA.REPORTS
            WHERE PATIENT_ID = ? 
            AND DOCTOR_ID = ?
            ORDER BY CREATED_AT DESC
            LIMIT 1
        `;

    const result = await executeQuery(getLastReportQuery, [
      PATIENT_ID,
      DOCTOR_ID,
    ]);
    return result[0];
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
};

export const getReportsByPatient = async (patientId, doctorId) => {
  const query = `
        SELECT R.*, 
               P.NAME as PATIENT_NAME, 
               D.NAME as DOCTOR_NAME
        FROM MEDICAL_DB.MEDICAL_SCHEMA.REPORTS R
        JOIN MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS P ON R.PATIENT_ID = P.PATIENT_ID
        JOIN MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS D ON R.DOCTOR_ID = D.DOCTOR_ID
        WHERE R.PATIENT_ID = ? 
        AND R.DOCTOR_ID = ?
        AND R.IS_DELETED = FALSE
        ORDER BY R.CREATED_AT DESC`;

  try {
    const reports = await executeQuery(query, [patientId, doctorId]);
    return reports;
  } catch (error) {
    console.error("Error fetching patient reports:", error);
    throw error;
  }
};

export const getReportById = async (reportId, doctorId) => {
  const query = `
        SELECT R.*, 
               P.NAME as PATIENT_NAME,
               P.DATE_OF_BIRTH,
               P.GENDER,
               P.PHONE,
               P.ADRESSE,
               D.NAME as DOCTOR_NAME,
               D.SPECIALTY
        FROM MEDICAL_DB.MEDICAL_SCHEMA.REPORTS R
        JOIN MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS P ON R.PATIENT_ID = P.PATIENT_ID
        JOIN MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS D ON R.DOCTOR_ID = D.DOCTOR_ID
        WHERE R.REPORT_ID = ? 
        AND R.DOCTOR_ID = ?
        AND R.IS_DELETED = FALSE`;

  try {
    const result = await executeQuery(query, [reportId, doctorId]);
    return result[0];
  } catch (error) {
    console.error("Error fetching report:", error);
    throw error;
  }
};

export const updateReport = async (reportId, doctorId, updateData) => {
  // Liste des champs autorisés pour la mise à jour
  const allowedFields = [
    "CONSULTATION_DATE",
    "CONSULTATION_DURATION",
    "CONSULTATION_REASON",
    "MAIN_COMPLAINT",
    "CURRENT_ILLNESS_HISTORY",
    "TEMPERATURE",
    "BLOOD_PRESSURE",
    "HEART_RATE",
    "RESPIRATORY_RATE",
    "OXYGEN_SATURATION",
    "WEIGHT",
    "HEIGHT",
    "BMI",
    "PERSONAL_HISTORY",
    "FAMILY_HISTORY",
    "LIFESTYLE_HABITS",
    "PHYSICAL_EXAMINATION",
    "TESTS_PERFORMED",
    "TEST_RESULTS",
    "PRIMARY_DIAGNOSIS",
    "DIFFERENTIAL_DIAGNOSIS",
    "EVOLUTION_NOTES",
    "PRESCRIPTIONS",
    "OTHER_TREATMENTS",
    "RECOMMENDATIONS",
    "NEXT_APPOINTMENT",
    "DISABILITY_EVALUATION",
    "DISABILITY_DURATION",
    "WORK_RETURN_RECOMMENDATIONS",
    "STATUS",
  ];

  // Filtrer les données de mise à jour pour n'inclure que les champs autorisés
  const filteredUpdateData = {};
  for (const key of allowedFields) {
    if (key in updateData) {
      filteredUpdateData[key] = updateData[key];
    }
  }

  // Construire la requête de mise à jour dynamiquement
  const updates = Object.entries(filteredUpdateData)
    .map(([key]) => `${key} = ?`)
    .join(", ");

  const query = `
      UPDATE MEDICAL_DB.MEDICAL_SCHEMA.REPORTS
      SET ${updates}, UPDATED_AT = CURRENT_TIMESTAMP()
      WHERE REPORT_ID = ? 
      AND DOCTOR_ID = ?
      AND IS_DELETED = FALSE`;

  const values = [...Object.values(filteredUpdateData), reportId, doctorId];

  try {
    await executeQuery(query, values);
    return true;
  } catch (error) {
    console.error("Error updating report:", error);
    throw error;
  }
};
export const deleteReport = async (reportId, doctorId) => {
  const query = `
        UPDATE MEDICAL_DB.MEDICAL_SCHEMA.REPORTS
        SET IS_DELETED = TRUE
        WHERE REPORT_ID = ? 
        AND DOCTOR_ID = ?`;

  try {
    await executeQuery(query, [reportId, doctorId]);
    return true;
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
};
// models/reportModel.js

export const getDoctorPatientsList = async (doctorId) => {
  const query = `
      SELECT DISTINCT 
        P.PATIENT_ID,
        P.NAME,
        P.DATE_OF_BIRTH,
        P.GENDER,
        P.PHONE,
        P.EMAIL,
        P.ADRESSE
      FROM MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS P
      WHERE P.PATIENT_ID IN (
        SELECT DISTINCT PATIENT_ID 
        FROM MEDICAL_DB.MEDICAL_SCHEMA.REPORTS 
        WHERE DOCTOR_ID = ? AND IS_DELETED = FALSE
      )
      ORDER BY P.NAME ASC`;

  try {
    const patients = await executeQuery(query, [doctorId]);
    return patients;
  } catch (error) {
    console.error("Error fetching doctor's patients:", error);
    throw error;
  }
};
export const getPatientReports = async (patientId) => {
  const query = `
    SELECT R.*, 
           D.NAME as DOCTOR_NAME,
           D.SPECIALTY
    FROM MEDICAL_DB.MEDICAL_SCHEMA.REPORTS R
    JOIN MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS D ON R.DOCTOR_ID = D.DOCTOR_ID
    WHERE R.PATIENT_ID = ?
    AND R.IS_DELETED = FALSE
    AND R.STATUS = 'COMPLETED'
    ORDER BY R.CREATED_AT DESC`;

  try {
    const reports = await executeQuery(query, [patientId]);
    return reports;
  } catch (error) {
    console.error("Error fetching patient reports:", error);
    throw error;
  }
};

export const getPatientReportById = async (reportId, patientId) => {
  const query = `
    SELECT R.*, 
           D.NAME as DOCTOR_NAME,
           D.SPECIALTY
    FROM MEDICAL_DB.MEDICAL_SCHEMA.REPORTS R
    JOIN MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS D ON R.DOCTOR_ID = D.DOCTOR_ID
    WHERE R.REPORT_ID = ?
    AND R.PATIENT_ID = ?
    AND R.IS_DELETED = FALSE
    AND R.STATUS = 'COMPLETED'`;

  try {
    const result = await executeQuery(query, [reportId, patientId]);
    return result[0];
  } catch (error) {
    console.error("Error fetching patient report:", error);
    throw error;
  }
};
