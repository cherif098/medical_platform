// models/PatientModel.js
import { executeQuery } from '../config/snowflake.js';
import bcrypt from 'bcryptjs';

export const loginPatient = async (EMAIL, PASSWORD) => {
    try {
        const query = `SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS WHERE EMAIL = ?;`;
        const result = await executeQuery(query, [EMAIL]);

        if (result.length === 0) {
            throw new Error('Patient with this email does not exist');
        }

        const patient = result[0];

        const isValidPassword = await bcrypt.compare(PASSWORD, patient.PASSWORD);
        if (!isValidPassword) {
            throw new Error('Incorrect password');
        }

        return patient;  
    } catch (error) {
        console.error('Error during patient login:', error);
        throw error;
    }
};

export const insertPatient = async (patient) => {
    const { DOCTOR_ID, EMAIL, NAME, PASSWORD, DATE_OF_BIRTH, CREATED_AT = new Date().toISOString() } = patient;

    // Vérification si l'email existe déjà
    const checkEmailQuery = `SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS WHERE EMAIL = ?;`;
    const emailResult = await executeQuery(checkEmailQuery, [EMAIL]);

    if (emailResult.length > 0) {
        throw new Error('Email is already registered');
    }

    const query = `
        INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS
        (DOCTOR_ID, EMAIL, NAME, PASSWORD, DATE_OF_BIRTH, CREATED_AT)
        VALUES (?, ?, ?, ?, ?, ?);
    `;

    const values = [DOCTOR_ID, EMAIL, NAME, PASSWORD, DATE_OF_BIRTH, CREATED_AT];

    try {
        await executeQuery(query, values);
        console.log('Patient added successfully');
    } catch (err) {
        console.error('Error inserting patient:', err);
        throw new Error('Error inserting patient into the database');
    }
};
