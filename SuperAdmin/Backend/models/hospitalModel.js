import { executeQuery } from "../config/snowflake.js";
import bcrypt from 'bcryptjs';


export const createHospital = async (data) => {
    const {NAME, ADDRESS, EMAIL, PASSWORD, PHONE_NUMBER, TOTAL_BEDS, SUBSCRIPTION_STATUS, SUBSCRIPTION_ID} = data;

    // Générer un sel et hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(PASSWORD, salt);

    const query = `
        INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.HOSPITALS 
        (NAME, ADDRESS, EMAIL,PASSWORD, PHONE_NUMBER, TOTAL_BEDS, SUBSCRIPTION_STATUS, SUBSCRIPTION_ID) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
        NAME,
        ADDRESS,
        EMAIL,
        hashedPassword,
        PHONE_NUMBER,
        TOTAL_BEDS || 0,
        SUBSCRIPTION_STATUS,
        SUBSCRIPTION_ID || 0
    ];

    try {
        await executeQuery(query, values);
    } catch (error) {
        console.error("Error adding hospital:", error);
        throw error;
    }
}

export const checkHospitalExists = async (NAME, EMAIL) => {
  // S'assurer que NAME et EMAIL ne sont jamais undefined
  const safeName = NAME || '';
  const safeEmail = EMAIL || '';
  
  const query = `
    SELECT COUNT(*) AS count
    FROM MEDICAL_DB.MEDICAL_SCHEMA.HOSPITALS
    WHERE NAME = ? OR EMAIL = ?
  `;
  
  const values = [safeName, safeEmail];
  const result = await executeQuery(query, values);
  
  return result[0].COUNT > 0;
};

export const getAllHospitals = async () => {
    const query = `SELECT * FROM HOSPITALS`;
    return executeQuery(query);
};

export const getHospitalById = async (id) => {
    const query = `SELECT * FROM HOSPITALS WHERE ID = ?`;
    return executeQuery(query, [id]);
};

export const deleteHospital = async (id) => {
    const query = `DELETE FROM HOSPITALS WHERE ID = ?`;
    return executeQuery(query, [id]);
};

export const updateHospital = async (id, hospitalData) => {
    const { NAME, ADDRESS, PHONE_NUMBER, EMAIL, TOTAL_BEDS, SUBSCRIPTION_STATUS } = hospitalData;
  
    // Vérifier que l'ID est bien défini
    if (!id) {
      throw new Error("Hospital ID is required for update.");
    }
  
    // Vérifier que les champs obligatoires ne sont pas vides
    if (!NAME || !EMAIL) {
      throw new Error("Hospital name and email are required.");
    }
  
    const query = `
      UPDATE MEDICAL_DB.MEDICAL_SCHEMA.HOSPITALS
      SET 
        NAME = ?,
        ADDRESS = ?,
        PHONE_NUMBER = ?,
        EMAIL = ?,
        TOTAL_BEDS = ?,
        SUBSCRIPTION_STATUS = ?
      WHERE ID = ?
    `;
  
    const params = [NAME, ADDRESS || null, PHONE_NUMBER || null, EMAIL, TOTAL_BEDS || 0, SUBSCRIPTION_STATUS || null, id];
  
    try {
      const result = await executeQuery(query, params);
      return result;
    } catch (error) {
      console.error("Error updating hospital:", error);
      throw new Error("Failed to update hospital.");
    }
  };