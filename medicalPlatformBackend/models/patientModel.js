import { executeQuery } from "../config/snowflake.js";
import bcrypt from "bcryptjs";

export const loginPatient = async (EMAIL, PASSWORD) => {
  try {
    const query = `SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS WHERE EMAIL = ?;`;
    const result = await executeQuery(query, [EMAIL]);

    if (result.length === 0) {
      console.log("Patient with this email does not exist");
    }

    const patient = result[0];

    const isValidPassword = await bcrypt.compare(PASSWORD, patient.PASSWORD);
    if (!isValidPassword) {
      console.log("Incorrect password");
    }

    return patient;
  } catch (error) {
    console.error("Error during patient login:", error);
    throw error;
  }
};

export const insertPatient = async (patientData) => {
  const {
    NAME,
    EMAIL,
    PASSWORD,
    PHONE,
    ADRESSE,
    GENDER,
    DATE_OF_BIRTH,
    IMAGE,
  } = patientData;

  // Remove HOSPITAL_ID from the query parameters
  const insertQuery = `
    INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS
    (NAME, EMAIL, PASSWORD, PHONE, ADRESSE, GENDER, DATE_OF_BIRTH, IMAGE)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;
  const values = [
    NAME,
    EMAIL,
    PASSWORD,
    PHONE,
    ADRESSE,
    GENDER,
    DATE_OF_BIRTH,
    IMAGE ?? null,
  ];

  try {
    // Execute the insertion query
    await executeQuery(insertQuery, values);

    // Query to retrieve the last inserted PATIENT_ID
    const selectQuery = `
      SELECT MAX(PATIENT_ID) AS PATIENT_ID
      FROM MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS
      WHERE EMAIL = ?;
    `;
    const result = await executeQuery(selectQuery, [EMAIL]);

    if (result.length === 0) {
      throw new Error("Failed to retrieve PATIENT_ID");
    }

    return result[0].PATIENT_ID; // Return the generated ID
  } catch (err) {
    console.error("Error inserting patient into the database:", err);
    throw new Error("Error inserting patient into the database");
  }
};

export const findPatientByEmail = async (EMAIL) => {
  const query = `SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS WHERE EMAIL = ?;`;
  try {
    const result = await executeQuery(query, [EMAIL]);
    return result[0];
  } catch (error) {
    console.error("Error finding patient by email:", error);
    throw error;
  }
};

export const getPatientById = async (PATIENT_ID) => {
  const query = `
      SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS
      WHERE PATIENT_ID = ?;
    `;

  const values = [PATIENT_ID];

  try {
    // Execute the query with the existing connection function
    const patientData = await executeQuery(query, values);

    // Check if a patient was found
    if (patientData.length === 0) {
      throw new Error("No patient found with this ID");
    }

    // Remove the password if necessary
    const patient = patientData[0];
    delete patient.PASSWORD;

    return patient;
  } catch (err) {
    console.error("Error retrieving patient:", err);
    throw new Error("Error retrieving patient from the database");
  }
};

export const updatePatientData = async (
  PATIENT_ID,
  EMAIL,
  NAME,
  DATE_OF_BIRTH,
  PHONE,
  ADRESSE,
  GENDER
) => {
  const updateQuery = `
    UPDATE MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS
    SET EMAIL = ?, NAME = ?, DATE_OF_BIRTH = ?, PHONE = ?, ADRESSE = ?, GENDER = ?
    WHERE PATIENT_ID = ?;
  `;
  const values = [
    EMAIL,
    NAME,
    DATE_OF_BIRTH,
    PHONE,
    ADRESSE,
    GENDER,
    PATIENT_ID,
  ];

  try {
    await executeQuery(updateQuery, values);
    console.log("Patient data updated successfully");
  } catch (error) {
    throw new Error("Error updating patient data: " + error.message);
  }
};

export const updatePatientImage = async (PATIENT_ID, IMAGE) => {
  const updateImageQuery = `
      UPDATE MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS
      SET IMAGE = ?
      WHERE PATIENT_ID = ?;
    `;
  const values = [IMAGE, PATIENT_ID];

  try {
    await executeQuery(updateImageQuery, values);
  } catch (error) {
    throw new Error("Error updating patient image: " + error.message);
  }
};

export const getAllPatients = async () => {
  const query = `SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS;`;
  try {
    const result = await executeQuery(query);
    return result;
  } catch (error) {
    console.error("Error retrieving all patients:", error);
    throw error;
  }
};

// For future implementation - get patients by hospital
export const getPatientsByHospital = async (HOSPITAL_ID) => {
  const query = `
    SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS
    WHERE HOSPITAL_ID = ?;
  `;
  try {
    const result = await executeQuery(query, [HOSPITAL_ID]);
    return result;
  } catch (error) {
    console.error(
      `Error retrieving patients for hospital ${HOSPITAL_ID}:`,
      error
    );
    throw error;
  }
};
