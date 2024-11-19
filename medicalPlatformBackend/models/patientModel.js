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

export const insertPatient = async (patient) => {
    const { EMAIL, NAME, PASSWORD, DATE_OF_BIRTH } = patient;

    const query = `
        INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS
        (EMAIL, NAME, PASSWORD, DATE_OF_BIRTH)
        VALUES (?, ?, ?, ?);
    `;

    const values = [EMAIL, NAME, PASSWORD, DATE_OF_BIRTH];
    try {
        await executeQuery(query, values);
        console.log('Patient added successfully');
    } catch (err) {
        console.error('Error inserting patient:', err);
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
