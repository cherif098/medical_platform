import { executeQuery } from '../config/snowflake.js';
import bcrypt from 'bcryptjs';

export const loginPatient = async (EMAIL, PASSWORD) => {
    try {
        const query = `SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS WHERE EMAIL = ?;`;
        const result = await executeQuery(query, [EMAIL]);

        if (result.length === 0) {
            console.log('Patient with this email does not exist');
        }

        const patient = result[0];
       

        const isValidPassword = await bcrypt.compare(PASSWORD, patient.PASSWORD);
        if (!isValidPassword) {
            console.log('Incorrect password');
        }

        return patient;  
    } catch (error) {
        console.error('Error during patient login:', error);
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

  const query = `
    INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS (NAME, EMAIL,PASSWORD, PHONE, ADRESSE, GENDER, DATE_OF_BIRTH, IMAGE)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;
  const values = [
    NAME,
    EMAIL,
    PASSWORD,
    PHONE,
    ADRESSE ,  
    GENDER,
    DATE_OF_BIRTH,
    IMAGE ?? null, 
  ];
  try {
    await executeQuery(query, values);
  } catch (err) {
    console.error('Error inserting patient into the database:', err);
    throw new Error('Error inserting patient into the database');
  }
};


export const findPatientByEmail = async (EMAIL) => {
    const query = `SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS WHERE EMAIL = ?;`;
    try {
        const result = await executeQuery(query, [EMAIL]);
        return result[0];
    } catch (error) {
        console.error('Error finding patient by email:', error);
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
      // Exécutez la requête avec la fonction de connexion existante
      const patientData = await executeQuery(query, values);
      
      // Vérifiez si un patient a été trouvé
      if (patientData.length === 0) {
        throw new Error('Aucun patient trouvé avec cet ID');
      }
  
      // Supprimez le mot de passe si nécessaire
      const patient = patientData[0];
      delete patient.PASSWORD;
  
      return patient;
    } catch (err) {
      console.error('Error retrieving patient:', err);
      throw new Error('Error retrieving patient from the database');
    }
  };

  export const updatePatientData = async (PATIENT_ID, EMAIL, NAME, DATE_OF_BIRTH, PHONE, ADRESSE, GENDER) => {
    const updateQuery = `
      UPDATE MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS
      SET EMAIL = ?, NAME = ?, DATE_OF_BIRTH = ?, PHONE = ?, ADRESSE = ?, GENDER = ?
      WHERE PATIENT_ID = ?;
    `;
    const values = [EMAIL, NAME, DATE_OF_BIRTH, PHONE, ADRESSE, GENDER, PATIENT_ID];
  
    try {
      await executeQuery(updateQuery, values);
      console.log('Patient data updated successfully');
    } catch (error) {
      throw new Error('Error updating patient data: ' + error.message);
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
      throw new Error('Error updating patient image: ' + error.message);
    }
  };