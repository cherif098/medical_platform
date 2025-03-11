import { executeQuery } from "../config/snowflake.js";

// Fonction pour insérer un infirmier
export const insertNurse = async (nurseData) => {
  const {
    EMAIL,
    PASSWORD,
    NAME,
    PHONE,
    ADRESSE,
    IMAGE,
    STATUS,
    CREATED_AT,
    EXPERIENCE,
    ABOUT,
    IS_PASSWORD_TEMPORARY,
    HOSPITAL_ID, // Ajout du HOSPITAL_ID
  } = nurseData;

  const query = `
    INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.NURSES 
    (EMAIL, PASSWORD, NAME, PHONE, ADRESSE, IMAGE, STATUS, CREATED_AT, EXPERIENCE, ABOUT, IS_PASSWORD_TEMPORARY, HOSPITAL_ID)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const values = [
    EMAIL,
    PASSWORD,
    NAME,
    PHONE,
    ADRESSE,
    IMAGE,
    STATUS,
    CREATED_AT,
    EXPERIENCE,
    ABOUT,
    IS_PASSWORD_TEMPORARY,
    HOSPITAL_ID || null, // Ajout du HOSPITAL_ID aux valeurs
  ];

  console.log("Inserting nurse with values:", values); // Log les valeurs pour déboguer

  try {
    const result = await executeQuery(query, values);
    return result;
  } catch (error) {
    console.error("Error inserting nurse:", error);
    throw error;
  }
};

// Récupérer tous les infirmiers d'un hôpital spécifique
export const getNursesByHospital = async (HOSPITAL_ID) => {
  const query = `
    SELECT *
    FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSES
    WHERE HOSPITAL_ID = ?;
  `;

  try {
    const result = await executeQuery(query, [HOSPITAL_ID]);
    return result;
  } catch (error) {
    console.error(
      `Error retrieving nurses for hospital ${HOSPITAL_ID}:`,
      error
    );
    throw error;
  }
};

// Récupérer tous les infirmiers (pour compatibilité avec le code existant)
export const getAllNurses = async () => {
  const query = `
    SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSES;
  `;

  const result = await executeQuery(query);
  return result;
};

// Récupérer un infirmier par email
export const getNurseByEmail = async (EMAIL) => {
  const query = `
    SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSES 
    WHERE EMAIL = ?;
  `;
  try {
    const result = await executeQuery(query, [EMAIL]);
    return result[0];
  } catch (error) {
    console.error("Error fetching nurse by email:", error);
    throw error;
  }
};
export const updateNurseOnlineStatus = async (nurseId, isOnline) => {
  console.log(
    `Début de updateNurseOnlineStatus: nurseId = ${nurseId}, isOnline = ${isOnline}`
  );

  if (!nurseId) {
    console.error("Erreur: nurseId est undefined ou null !");
    return;
  }

  const query = `
    UPDATE MEDICAL_DB.MEDICAL_SCHEMA.NURSES
    SET IS_ONLINE = ?
    WHERE NURSE_ID = ?;
  `;
  const values = [isOnline, nurseId];

  try {
    console.log("Avant exécution de executeQuery");
    const result = await executeQuery(query, values);
    console.log("Résultat de la mise à jour IS_ONLINE:", result);

    // Vérification après l'update
    const checkQuery = `SELECT IS_ONLINE FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSES WHERE NURSE_ID = ?;`;
    const checkResult = await executeQuery(checkQuery, [nurseId]);
    console.log(`Vérification en base après mise à jour:`, checkResult);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut en ligne:", error);
    throw error;
  }
};

// Récupérer un infirmier par ID
export const getNurseById = async (NURSE_ID) => {
  if (!NURSE_ID) {
    throw new Error("NURSE_ID is required.");
  }

  const query = `
    SELECT 
      EMAIL,
      NAME,
      PHONE,
      ADRESSE,
      IMAGE,
      EXPERIENCE,
      ABOUT,
      HOSPITAL_ID
    FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSES 
    WHERE NURSE_ID = ?;
  `;
  try {
    const result = await executeQuery(query, [NURSE_ID]);
    return result[0];
  } catch (error) {
    console.error("Error fetching nurse by ID:", error);
    throw error;
  }
};

// Mettre à jour le profil d'un infirmier
export const updateNurseProfile = async (NURSE_ID, updatedData) => {
  const allowedFields = ["EMAIL", "PHONE", "ADRESSE", "ABOUT", "HOSPITAL_ID"]; // Ajout de HOSPITAL_ID

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
    UPDATE MEDICAL_DB.MEDICAL_SCHEMA.NURSES 
    SET ${updates} 
    WHERE NURSE_ID = ?;
  `;

  try {
    const result = await executeQuery(query, [...values, NURSE_ID]);
    if (result.affectedRows === 0) {
      throw new Error(
        "No nurse found with the provided ID or no changes were made."
      );
    }
    return result;
  } catch (error) {
    console.error("Error updating nurse profile:", error);
    throw error;
  }
};

// Supprimer un infirmier
export const deleteNurse = async (nurseId) => {
  const query = `
    DELETE FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSES 
    WHERE NURSE_ID = ?;
  `;

  try {
    const result = await executeQuery(query, [nurseId]);

    if (!result || result.affectedRows === 0) {
      throw new Error("Nurse not found or already deleted.");
    }

    return result;
  } catch (error) {
    console.error("Error deleting nurse:", error);
    throw error;
  }
};

// Récupérer tous les infirmiers sans mot de passe
export const getNursesWithoutPassword = async (HOSPITAL_ID = null) => {
  let query;
  let params = [];

  if (HOSPITAL_ID) {
    // Si un HOSPITAL_ID est fourni, filtrer par cet hôpital
    query = `
      SELECT 
        NURSE_ID,
        EMAIL,
        NAME,
        PHONE,
        ADRESSE,
        IMAGE,
        STATUS,
        CREATED_AT,
        EXPERIENCE,
        ABOUT,
        HOSPITAL_ID
      FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSES
      WHERE HOSPITAL_ID = ?;
    `;
    params.push(HOSPITAL_ID);
  } else {
    // Sinon, récupérer tous les infirmiers
    query = `
      SELECT 
        NURSE_ID,
        EMAIL,
        NAME,
        PHONE,
        ADRESSE,
        IMAGE,
        STATUS,
        CREATED_AT,
        EXPERIENCE,
        ABOUT,
        HOSPITAL_ID
      FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSES;
    `;
  }

  try {
    const nurses = await executeQuery(query, params);
    return nurses;
  } catch (error) {
    console.error("Error retrieving nurses without password:", error);
    throw error;
  }
};

// Récupérer l'ID de l'hôpital d'un infirmier
export const getHospitalIdByNurseId = async (nurseId) => {
  const query = `
    SELECT HOSPITAL_ID 
    FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSES 
    WHERE NURSE_ID = ?
  `;
  const result = await executeQuery(query, [nurseId]);
  return result.length > 0 ? result[0].HOSPITAL_ID : null;
};

// Récupérer les patients par l'ID d'un hôpital
export const getPatientsByHospitalId = async (hospitalId) => {
  const query = `
    SELECT PATIENT_ID, NAME, DATE_OF_BIRTH, EMAIL, IMAGE, GENDER, PHONE, ADRESSE
    FROM MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS 
    WHERE HOSPITAL_ID = ?
  `;
  return await executeQuery(query, [hospitalId]);
};

// Récupérer la note associée à un rapport
export const getNurseNoteByReportId = async (reportId) => {
  try {
    const query = `
      SELECT NOTE_ID, NURSE_ID, REPORT_ID, NOTE_TEXT, CREATED_AT
      FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSENOTES
      WHERE REPORT_ID = ?`;

    const result = await executeQuery(query, [reportId]);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error fetching nurse note:", error);
    throw error;
  }
};

// Ajouter une nouvelle note
export const addNurseNote = async (nurseId, reportId, noteText) => {
  try {
    const query = `
      INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.NURSENOTES (NURSE_ID, REPORT_ID, NOTE_TEXT) 
      VALUES (?, ?, ?)`;

    await executeQuery(query, [nurseId, reportId, noteText]);
    return { success: true };
  } catch (error) {
    console.error("Error adding nurse note:", error);
    throw error;
  }
};

// update note
export const updateNurseNote = async (nurseId, reportId, noteText) => {
  if (!nurseId || !reportId || !noteText) {
    throw new Error("Missing parameters in updateNurseNote");
  }

  const numericReportId = Number(reportId);

  const query = `
    UPDATE MEDICAL_DB.MEDICAL_SCHEMA.NURSENOTES 
    SET NOTE_TEXT = ?, NURSE_ID = ?, CREATED_AT = CURRENT_TIMESTAMP()
    WHERE REPORT_ID = ?
  `;

  console.log("Executing Query:", query);
  console.log("With values:", [noteText, nurseId, numericReportId]);

  const result = await executeQuery(query, [
    noteText,
    nurseId,
    numericReportId,
  ]);

  console.log("Query Result:", result);

  return result && result.length > 0;
};

// verifier si une note existe
export const checkNurseNoteExists = async (reportId) => {
  const query = `
      SELECT NOTE_ID FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSENOTES 
      WHERE REPORT_ID = ?;
  `;
  const result = await executeQuery(query, [reportId]);
  return result.length > 0 ? result[0] : null;
};

export const deleteNurseNoteFromDB = async (reportId) => {
  const query = `
      DELETE FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSENOTES 
      WHERE REPORT_ID = ?;
  `;
  await executeQuery(query, [reportId]);
};
