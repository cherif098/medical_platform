import { executeQuery } from "../config/snowflake.js";

// Function to insert a manager
export const insertManager = async (managerData) => {
  const {
    EMAIL,
    PASSWORD,
    NAME,
    PHONE,
    ADDRESS,
    IMAGE,
    DEPARTMENT,
    STATUS,
    CREATED_AT,
    EXPERIENCE,
    ABOUT,
    IS_PASSWORD_TEMPORARY,
    HOSPITAL_ID,
  } = managerData;

  const query = `
    INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.MANAGERS 
    (EMAIL, PASSWORD, NAME, PHONE, ADDRESS, IMAGE, DEPARTMENT, STATUS, CREATED_AT, EXPERIENCE, ABOUT, IS_PASSWORD_TEMPORARY, HOSPITAL_ID)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const values = [
    EMAIL,
    PASSWORD,
    NAME,
    PHONE,
    ADDRESS,
    IMAGE,
    DEPARTMENT,
    STATUS,
    CREATED_AT,
    EXPERIENCE,
    ABOUT,
    IS_PASSWORD_TEMPORARY,
    HOSPITAL_ID || null, // Default to 1 if not provided
  ];

  console.log("Inserting manager with values:", values);

  try {
    const result = await executeQuery(query, values);
    return result;
  } catch (error) {
    console.error("Error inserting manager:", error);
    throw error;
  }
};

// Get all managers
export const getAllManagers = async () => {
  const query = `
    SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.MANAGERS;
  `;

  try {
    const result = await executeQuery(query);
    return result;
  } catch (error) {
    console.error("Error fetching all managers:", error);
    throw error;
  }
};

// Get manager by email
export const getManagerByEmail = async (EMAIL) => {
  const query = `
    SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.MANAGERS 
    WHERE EMAIL = ?;
  `;
  try {
    const result = await executeQuery(query, [EMAIL]);
    return result[0];
  } catch (error) {
    console.error("Error fetching manager by email:", error);
    throw error;
  }
};

// Get manager by ID
export const getManagerById = async (MANAGER_ID) => {
  if (!MANAGER_ID) {
    throw new Error("MANAGER_ID is required.");
  }

  const query = `
    SELECT 
      EMAIL,
      NAME,
      PHONE,
      ADDRESS,
      IMAGE,
      DEPARTMENT,
      EXPERIENCE,
      ABOUT,
      HOSPITAL_ID
    FROM MEDICAL_DB.MEDICAL_SCHEMA.MANAGERS 
    WHERE MANAGER_ID = ?;
  `;
  try {
    const result = await executeQuery(query, [MANAGER_ID]);
    return result[0];
  } catch (error) {
    console.error("Error fetching manager by ID:", error);
    throw error;
  }
};

// Update manager profile
export const updateManagerProfile = async (MANAGER_ID, updatedData) => {
  const allowedFields = ["EMAIL", "PHONE", "ADDRESS", "DEPARTMENT", "ABOUT"];

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
    UPDATE MEDICAL_DB.MEDICAL_SCHEMA.MANAGERS 
    SET ${updates} 
    WHERE MANAGER_ID = ?;
  `;

  try {
    const result = await executeQuery(query, [...values, MANAGER_ID]);
    if (result.affectedRows === 0) {
      throw new Error(
        "No manager found with the provided ID or no changes were made."
      );
    }
    return result;
  } catch (error) {
    console.error("Error updating manager profile:", error);
    throw error;
  }
};

// Delete a manager
export const deleteManager = async (managerId) => {
  const query = `
    DELETE FROM MEDICAL_DB.MEDICAL_SCHEMA.MANAGERS 
    WHERE MANAGER_ID = ?;
  `;

  try {
    const result = await executeQuery(query, [managerId]);

    if (!result || result.affectedRows === 0) {
      throw new Error("Manager not found or already deleted.");
    }

    return result;
  } catch (error) {
    console.error("Error deleting manager:", error);
    throw error;
  }
};

// Get all managers without password
export const getManagersWithoutPassword = async () => {
  const query = `
    SELECT 
      MANAGER_ID,
      EMAIL,
      NAME,
      PHONE,
      ADDRESS,
      IMAGE,
      DEPARTMENT,
      STATUS,
      CREATED_AT,
      EXPERIENCE,
      ABOUT,
      HOSPITAL_ID
    FROM MEDICAL_DB.MEDICAL_SCHEMA.MANAGERS;
  `;

  try {
    const managers = await executeQuery(query);
    return managers;
  } catch (error) {
    console.error("Error retrieving managers without password:", error);
    throw error;
  }
};

// Check if email exists
export const checkManagerEmailExists = async (email) => {
  const query = `
    SELECT COUNT(*) AS count 
    FROM MEDICAL_DB.MEDICAL_SCHEMA.MANAGERS 
    WHERE EMAIL = ?;
  `;

  try {
    const result = await executeQuery(query, [email]);
    return result[0].COUNT > 0;
  } catch (error) {
    console.error("Error checking if manager email exists:", error);
    throw error;
  }
};
