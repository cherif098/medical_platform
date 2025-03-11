import { executeQuery } from "../config/snowflake.js";

// Function to insert a secretary
export const insertSecretary = async (secretaryData) => {
  const {
    EMAIL,
    PASSWORD,
    NAME,
    PHONE,
    ADDRESS,
    IMAGE,
    STATUS,
    CREATED_AT,
    EXPERIENCE,
    ABOUT,
    IS_PASSWORD_TEMPORARY,
    HOSPITAL_ID,
  } = secretaryData;

  const query = `
    INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.SECRETARIES 
    (EMAIL, PASSWORD, NAME, PHONE, ADDRESS, IMAGE, STATUS, CREATED_AT, EXPERIENCE, ABOUT, IS_PASSWORD_TEMPORARY, HOSPITAL_ID)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const values = [
    EMAIL,
    PASSWORD,
    NAME,
    PHONE,
    ADDRESS,
    IMAGE,
    STATUS,
    CREATED_AT,
    EXPERIENCE,
    ABOUT,
    IS_PASSWORD_TEMPORARY,
    HOSPITAL_ID || null, // Default to 1 if not provided
  ];

  console.log("Inserting secretary with values:", values);

  try {
    const result = await executeQuery(query, values);
    return result;
  } catch (error) {
    console.error("Error inserting secretary:", error);
    throw error;
  }
};

// Get all secretaries
export const getAllSecretaries = async () => {
  const query = `
    SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.SECRETARIES;
  `;

  try {
    const result = await executeQuery(query);
    return result;
  } catch (error) {
    console.error("Error fetching all secretaries:", error);
    throw error;
  }
};

// Get secretary by email
export const getSecretaryByEmail = async (EMAIL) => {
  const query = `
    SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.SECRETARIES 
    WHERE EMAIL = ?;
  `;
  try {
    const result = await executeQuery(query, [EMAIL]);
    return result[0];
  } catch (error) {
    console.error("Error fetching secretary by email:", error);
    throw error;
  }
};

// Get secretary by ID
export const getSecretaryById = async (SECRETARY_ID) => {
  if (!SECRETARY_ID) {
    throw new Error("SECRETARY_ID is required.");
  }

  const query = `
    SELECT 
      EMAIL,
      NAME,
      PHONE,
      ADDRESS,
      IMAGE,
      EXPERIENCE,
      ABOUT,
      HOSPITAL_ID
    FROM MEDICAL_DB.MEDICAL_SCHEMA.SECRETARIES 
    WHERE SECRETARY_ID = ?;
  `;
  try {
    const result = await executeQuery(query, [SECRETARY_ID]);
    return result[0];
  } catch (error) {
    console.error("Error fetching secretary by ID:", error);
    throw error;
  }
};

// Update secretary profile
export const updateSecretaryProfile = async (SECRETARY_ID, updatedData) => {
  const allowedFields = ["EMAIL", "PHONE", "ADDRESS", "ABOUT"];

  const updates = Object.entries(updatedData)
    .filter(([key]) => allowedFields.includes(key))
    .map(([key]) => `${key} = ?`)
    .join(", ");

  const values = Object.entries(updatedData)
    .filter(([key]) => allowedFields.includes(key))
    .map(([_, value]) => value);

  if (!updates) {
    throw new Error("No valid fields provided for update.");
  }

  const query = `
    UPDATE MEDICAL_DB.MEDICAL_SCHEMA.SECRETARIES 
    SET ${updates} 
    WHERE SECRETARY_ID = ?;
  `;

  try {
    const result = await executeQuery(query, [...values, SECRETARY_ID]);
    if (result.affectedRows === 0) {
      throw new Error(
        "No secretary found with the provided ID or no changes were made."
      );
    }
    return result;
  } catch (error) {
    console.error("Error updating secretary profile:", error);
    throw error;
  }
};

// Delete a secretary
export const deleteSecretary = async (secretaryId) => {
  const query = `
    DELETE FROM MEDICAL_DB.MEDICAL_SCHEMA.SECRETARIES 
    WHERE SECRETARY_ID = ?;
  `;

  try {
    const result = await executeQuery(query, [secretaryId]);

    if (!result || result.affectedRows === 0) {
      throw new Error("Secretary not found or already deleted.");
    }

    return result;
  } catch (error) {
    console.error("Error deleting secretary:", error);
    throw error;
  }
};

// Get all secretaries without password
export const getSecretariesWithoutPassword = async () => {
  const query = `
    SELECT 
      SECRETARY_ID,
      EMAIL,
      NAME,
      PHONE,
      ADDRESS,
      IMAGE,
      STATUS,
      CREATED_AT,
      EXPERIENCE,
      ABOUT,
      HOSPITAL_ID
    FROM MEDICAL_DB.MEDICAL_SCHEMA.SECRETARIES;
  `;

  try {
    const secretaries = await executeQuery(query);
    return secretaries;
  } catch (error) {
    console.error("Error retrieving secretaries without password:", error);
    throw error;
  }
};

// Check if email exists
export const checkSecretaryEmailExists = async (email) => {
  const query = `
    SELECT COUNT(*) AS count 
    FROM MEDICAL_DB.MEDICAL_SCHEMA.SECRETARIES 
    WHERE EMAIL = ?;
  `;

  try {
    const result = await executeQuery(query, [email]);
    return result[0].COUNT > 0;
  } catch (error) {
    console.error("Error checking if secretary email exists:", error);
    throw error;
  }
};
