import { executeQuery } from "../config/snowflake.js";
import bcrypt from "bcryptjs";

// Get hospital by ID
export const getHospitalById = async (hospitalId) => {
  const query = `
    SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.HOSPITALS
    WHERE ID = ?;
  `;
  try {
    const result = await executeQuery(query, [hospitalId]);
    return result[0];
  } catch (error) {
    console.error("Error fetching hospital by ID:", error);
    throw error;
  }
};

// Get hospital by email
export const getHospitalByEmail = async (email) => {
  const query = `
    SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.HOSPITALS
    WHERE EMAIL = ?;
  `;
  try {
    const result = await executeQuery(query, [email]);
    return result[0];
  } catch (error) {
    console.error("Error fetching hospital by email:", error);
    throw error;
  }
};

// Create a new hospital
export const createHospital = async (hospitalData) => {
  const {
    NAME,
    ADDRESS,
    EMAIL,
    PHONE_NUMBER,
    TOTAL_BEDS,
    PASSWORD,
    SUBSCRIPTION_STATUS,
  } = hospitalData;

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(PASSWORD, salt);

  const query = `
    INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.HOSPITALS (
      NAME,
      ADDRESS,
      EMAIL,
      PHONE_NUMBER,
      TOTAL_BEDS,
      PASSWORD,
      SUBSCRIPTION_STATUS,
      CREATED_AT
    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP());
  `;

  const values = [
    NAME,
    ADDRESS,
    EMAIL,
    PHONE_NUMBER,
    TOTAL_BEDS || 0,
    hashedPassword,
    SUBSCRIPTION_STATUS || "INACTIVE",
  ];

  try {
    await executeQuery(query, values);

    // Retrieve the newly created hospital
    const newHospital = await getHospitalByEmail(EMAIL);
    return newHospital;
  } catch (error) {
    console.error("Error creating hospital:", error);
    throw error;
  }
};

// Update hospital information
export const updateHospital = async (hospitalId, updateData) => {
  const allowedFields = [
    "NAME",
    "ADDRESS",
    "EMAIL",
    "PHONE_NUMBER",
    "TOTAL_BEDS",
    "SUBSCRIPTION_STATUS",
  ];

  // Filter out fields that are not allowed to be updated
  const updates = Object.entries(updateData)
    .filter(([key]) => allowedFields.includes(key))
    .map(([key]) => `${key} = ?`)
    .join(", ");

  const values = Object.entries(updateData)
    .filter(([key]) => allowedFields.includes(key))
    .map(([_, value]) => value);

  if (!updates) {
    throw new Error("No valid fields provided for update.");
  }

  const query = `
    UPDATE MEDICAL_DB.MEDICAL_SCHEMA.HOSPITALS
    SET ${updates}
    WHERE ID = ?;
  `;

  try {
    const result = await executeQuery(query, [...values, hospitalId]);

    if (result.affectedRows === 0) {
      throw new Error("Hospital not found or no changes were made.");
    }

    return result;
  } catch (error) {
    console.error("Error updating hospital:", error);
    throw error;
  }
};

// Update hospital password
export const updateHospitalPassword = async (hospitalId, newPassword) => {
  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const query = `
    UPDATE MEDICAL_DB.MEDICAL_SCHEMA.HOSPITALS
    SET PASSWORD = ?
    WHERE ID = ?;
  `;

  try {
    const result = await executeQuery(query, [hashedPassword, hospitalId]);

    if (result.affectedRows === 0) {
      throw new Error("Hospital not found or password not updated.");
    }

    return true;
  } catch (error) {
    console.error("Error updating hospital password:", error);
    throw error;
  }
};

// Delete hospital (not recommended in production, consider soft delete instead)
export const deleteHospital = async (hospitalId) => {
  const query = `
    DELETE FROM MEDICAL_DB.MEDICAL_SCHEMA.HOSPITALS
    WHERE ID = ?;
  `;

  try {
    const result = await executeQuery(query, [hospitalId]);

    if (result.affectedRows === 0) {
      throw new Error("Hospital not found or not deleted.");
    }

    return true;
  } catch (error) {
    console.error("Error deleting hospital:", error);
    throw error;
  }
};

// Get all hospitals
export const getAllHospitals = async () => {
  const query = `
    SELECT ID, NAME, ADDRESS, EMAIL, PHONE_NUMBER, TOTAL_BEDS, SUBSCRIPTION_STATUS, CREATED_AT
    FROM MEDICAL_DB.MEDICAL_SCHEMA.HOSPITALS;
  `;

  try {
    const hospitals = await executeQuery(query);
    return hospitals;
  } catch (error) {
    console.error("Error fetching all hospitals:", error);
    throw error;
  }
};

// Check if hospital exists by email
export const checkHospitalExists = async (email) => {
  const query = `
    SELECT COUNT(*) as count
    FROM MEDICAL_DB.MEDICAL_SCHEMA.HOSPITALS
    WHERE EMAIL = ?;
  `;

  try {
    const result = await executeQuery(query, [email]);
    return result[0].COUNT > 0;
  } catch (error) {
    console.error("Error checking if hospital exists:", error);
    throw error;
  }
};

// Get hospital staff counts
export const getHospitalStaffCounts = async (hospitalId) => {
  try {
    // Get doctor count
    const doctorQuery = `
      SELECT COUNT(*) as doctorCount
      FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
      WHERE HOSPITAL_ID = ?;
    `;
    const doctorResult = await executeQuery(doctorQuery, [hospitalId]);

    // Get nurse count
    const nurseQuery = `
      SELECT COUNT(*) as nurseCount
      FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSES
      WHERE HOSPITAL_ID = ?;
    `;
    const nurseResult = await executeQuery(nurseQuery, [hospitalId]);

    // Get secretary count
    const secretaryQuery = `
      SELECT COUNT(*) as secretaryCount
      FROM MEDICAL_DB.MEDICAL_SCHEMA.SECRETARIES
      WHERE HOSPITAL_ID = ?;
    `;
    const secretaryResult = await executeQuery(secretaryQuery, [hospitalId]);

    // Get manager count
    const managerQuery = `
      SELECT COUNT(*) as managerCount
      FROM MEDICAL_DB.MEDICAL_SCHEMA.MANAGERS
      WHERE HOSPITAL_ID = ?;
    `;
    const managerResult = await executeQuery(managerQuery, [hospitalId]);

    // Get patient count
    const patientQuery = `
      SELECT COUNT(*) as patientCount
      FROM MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS
      WHERE HOSPITAL_ID = ?;
    `;
    const patientResult = await executeQuery(patientQuery, [hospitalId]);

    return {
      doctors: doctorResult[0]?.DOCTORCOUNT || 0,
      nurses: nurseResult[0]?.NURSECOUNT || 0,
      secretaries: secretaryResult[0]?.SECRETARYCOUNT || 0,
      managers: managerResult[0]?.MANAGERCOUNT || 0,
      patients: patientResult[0]?.PATIENTCOUNT || 0,
    };
  } catch (error) {
    console.error("Error getting hospital staff counts:", error);
    throw error;
  }
};

// Update hospital subscription
export const updateHospitalSubscription = async (
  hospitalId,
  subscriptionId,
  status
) => {
  const query = `
    UPDATE MEDICAL_DB.MEDICAL_SCHEMA.HOSPITALS
    SET SUBSCRIPTION_ID = ?, SUBSCRIPTION_STATUS = ?
    WHERE ID = ?;
  `;

  try {
    const result = await executeQuery(query, [
      subscriptionId,
      status,
      hospitalId,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Hospital not found or subscription not updated.");
    }

    return true;
  } catch (error) {
    console.error("Error updating hospital subscription:", error);
    throw error;
  }
};
