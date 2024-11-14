// models/DoctorModel.js
import { executeQuery } from '../config/snowflake.js';



export const insertDoctor = async (doctorData) => {
    const {  DOCTOR_LICENCE, EMAIL, PASSWORD, NAME, SPECIALTY, IS_PASSWORD_TEMPORARY, STATUS, CREATED_AT, CREATED_BY, IMAGE } = doctorData;



    const query = `
        INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS 
        ( DOCTOR_LICENCE, EMAIL, PASSWORD, NAME, SPECIALTY, IS_PASSWORD_TEMPORARY, STATUS, CREATED_AT, CREATED_BY, IMAGE)
        VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
        DOCTOR_LICENCE,
        EMAIL,
        PASSWORD,
        NAME,
        SPECIALTY,
        IS_PASSWORD_TEMPORARY,
        STATUS,
        CREATED_AT,
        CREATED_BY,
        IMAGE
    ];

    try {
        await executeQuery(query, values);
        console.log('Doctor added successfully');
    } catch (err) {
        console.error('Error inserting doctor:', err);
        throw err;
    }
};
