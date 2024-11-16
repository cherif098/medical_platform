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
