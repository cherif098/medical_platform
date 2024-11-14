// models/PatientModel.js
import { executeQuery } from '../config/snowflake.js';

export const insertPatient = async (patient) => {
    const {
        PATIENT_ID,
        DOCTOR_ID,
        EMAIL,
        NAME,
        DATE_OF_BIRTH,
        CREATED_AT = new Date().toISOString()
    } = patient;

    const query = `
        INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS 
        (PATIENT_ID, DOCTOR_ID, EMAIL, NAME, DATE_OF_BIRTH, CREATED_AT)
        VALUES (?, ?, ?, ?, ?, ?);
    `;

    const values = [
        PATIENT_ID || 'UUID_STRING()', // Optionnel : UUID généré pour le Patient
        DOCTOR_ID,
        EMAIL,
        NAME,
        DATE_OF_BIRTH,
        CREATED_AT
    ];

    try {
        await executeQuery(query, values);
        console.log('Patient added successfully');
    } catch (err) {
        console.error('Error inserting patient:', err);
    }
};
