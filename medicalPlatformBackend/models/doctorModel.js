// models/DoctorModel.js
import { executeQuery } from "../config/snowflake.js";

export const insertDoctor = async (doctorData) => {
  const {
    DOCTOR_LICENCE,
    EMAIL,
    PASSWORD,
    NAME,
    SPECIALTY,
    IS_PASSWORD_TEMPORARY,
    STATUS,
    FEES,
    ADRESS_1,
    ADRESS_2,
    DEGREE,
    EXPERIENCE,
    ABOUT,
    CREATED_AT,
    CREATED_BY,
    IMAGE,
  } = doctorData;

  const query = `
        INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS 
        (DOCTOR_LICENCE, EMAIL, PASSWORD, NAME, SPECIALTY, IS_PASSWORD_TEMPORARY, STATUS, FEES, ADRESS_1, ADRESS_2, DEGREE, EXPERIENCE, ABOUT, CREATED_AT, CREATED_BY, IMAGE)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

  const values = [
    DOCTOR_LICENCE,
    EMAIL,
    PASSWORD,
    NAME,
    SPECIALTY,
    IS_PASSWORD_TEMPORARY ?? true, // Par défaut TRUE si non fourni
    STATUS ?? true, // Par défaut TRUE si non fourni
    FEES ?? null, // Null si non fourni
    ADRESS_1 ?? null,
    ADRESS_2 ?? null,
    DEGREE ?? null,
    EXPERIENCE ?? 0, // Par défaut 0 si non fourni
    ABOUT ?? null, // Null si non fourni
    CREATED_AT ?? new Date(), // Utilise l'heure actuelle si non fourni
    CREATED_BY ?? null,
    IMAGE ?? null,
  ];

  try {
    await executeQuery(query, values);
    console.log("Doctor added successfully");
  } catch (err) {
    console.error("Error inserting doctor:", err);
    throw err;
  }
};

export const getDoctorsWithoutPassword = async () => {
  const query = `
        SELECT 
        DOCTOR_ID,DOCTOR_LICENCE, EMAIL, NAME, SPECIALTY, IS_PASSWORD_TEMPORARY, 
        STATUS, FEES, ADRESS_1, ADRESS_2, DEGREE, EXPERIENCE, ABOUT, 
        CREATED_AT, CREATED_BY, IMAGE
        FROM 
          MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS;
    `;

  try {
    const doctors = await executeQuery(query);
    return doctors;
  } catch (err) {
    console.error("Error retrieving doctors:", err);
    throw err;
  }
};
export const getDoctorStatus = async (DOCTOR_LICENCE) => {
  const query = `
    SELECT STATUS
    FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
    WHERE DOCTOR_LICENCE = ?;
  `;

  try {
    const result = await executeQuery(query, [DOCTOR_LICENCE]);
    return result;
  } catch (error) {
    console.error("Error retrieving doctor status:", error);
    throw error;
  }
};

// Mettre à jour le statut du médecin
export const updateDoctorStatus = async (DOCTOR_LICENCE, newStatus) => {
  const query = `
    UPDATE MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
    SET STATUS = ?
    WHERE DOCTOR_LICENCE = ?;
  `;

  try {
    await executeQuery(query, [newStatus, DOCTOR_LICENCE]);
  } catch (error) {
    console.error("Error updating doctor status:", error);
    throw error;
  }
};
export const findAvailableDoctor = async (DOCTOR_ID) => {
  const query = `
    SELECT 
      DOCTOR_ID,
      NAME,
      SPECIALTY,
      STATUS,
      FEES
    FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
    WHERE DOCTOR_ID = ? AND STATUS = TRUE;
  `;

  try {
    const result = await executeQuery(query, [DOCTOR_ID]);
    return result[0] || null; // Retourne le premier médecin trouvé ou null si non trouvé
  } catch (error) {
    console.error("Error in findAvailableDoctor:", error);
    throw error;
  }
};
