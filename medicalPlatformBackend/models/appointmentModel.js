import { executeQuery } from "../config/snowflake.js";

export const createAppointment = async (doctorId, userId, slotDate, slotTime, fees) => {
  const appointmentQuery = `
    INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS (
      DOCTOR_ID, USER_ID, SLOT_DATE, SLOT_TIME, FEES, STATUS
    ) VALUES (?, ?, ?, ?, ?, 'SCHEDULED')
  `;
  
  await executeQuery(appointmentQuery, [doctorId, userId, slotDate, slotTime, fees]);
};

// getting appointments by user id 
export const getPatientAppointmentsByUserId = async (patientId) => {
  const query = `
    SELECT 
      a.APPOINTMENT_ID,
      a.SLOT_DATE,
      a.SLOT_TIME,
      a.FEES,
      a.STATUS,
      d.DOCTOR_ID,
      d.NAME as DOCTOR_NAME,
      d.SPECIALTY,
      d.ADRESS_1,
      d.ADRESS_2,
      d.IMAGE as DOCTOR_IMAGE
    FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS a
    JOIN MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS d ON a.DOCTOR_ID = d.DOCTOR_ID
    WHERE a.USER_ID = ?
    ORDER BY a.SLOT_DATE DESC, a.SLOT_TIME DESC
  `;

  return executeQuery(query, [patientId]);
};


// fun to delete an appointment:
export const deleteAppointment = async (appointmentId, patientId) => {
  // First check if appointment exists and belongs to patient
  const checkQuery = `
    SELECT *
    FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS
    WHERE APPOINTMENT_ID = ?
    AND USER_ID = ?
  `;

  const appointments = await executeQuery(checkQuery, [appointmentId, patientId]);

  if (appointments.length === 0) {
    throw new Error('Appointment not found or does not belong to this patient');
  }

  // Delete the appointment
  const deleteQuery = `
    DELETE FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS
    WHERE APPOINTMENT_ID = ?
    AND USER_ID = ?
  `;

  await executeQuery(deleteQuery, [appointmentId, patientId]);
};