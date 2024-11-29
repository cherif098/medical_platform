import { executeQuery } from "../config/snowflake.js";

export const createAppointment = async (
  doctorId,
  userId,
  slotDate,
  slotTime,
  fees
) => {
  const appointmentQuery = `
    INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS (
      DOCTOR_ID, USER_ID, SLOT_DATE, SLOT_TIME, FEES, STATUS
    ) VALUES (?, ?, ?, ?, ?, 'SCHEDULED')
  `;

  await executeQuery(appointmentQuery, [
    doctorId,
    userId,
    slotDate,
    slotTime,
    fees,
  ]);
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

  const appointments = await executeQuery(checkQuery, [
    appointmentId,
    patientId,
  ]);

  if (appointments.length === 0) {
    throw new Error("Appointment not found or does not belong to this patient");
  }

  // Delete the appointment
  const deleteQuery = `
    DELETE FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS
    WHERE APPOINTMENT_ID = ?
    AND USER_ID = ?
  `;

  await executeQuery(deleteQuery, [appointmentId, patientId]);
};

// fun to delete an appointment:
export const deleteAppointmentDoctor = async (appointmentId, doctorId) => {
  const checkQuery = `
    SELECT *
    FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS
    WHERE APPOINTMENT_ID = ?
    AND DOCTOR_ID = ?
  `;

  const appointments = await executeQuery(checkQuery, [
    appointmentId,
    doctorId,
  ]);

  if (appointments.length === 0) {
    throw new Error("Appointment not found or does not belong to this patient");
  }

  // Delete the appointment
  const deleteQuery = `
    DELETE FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS
    WHERE APPOINTMENT_ID = ?
    AND DOCTOR_ID  = ?
  `;

  await executeQuery(deleteQuery, [appointmentId, doctorId]);
};

export const getAllAppointmentsForAdmin = async () => {
  const query = `
    SELECT 
      a.APPOINTMENT_ID, a.CREATED_AT, a.SLOT_DATE, a.SLOT_TIME, a.USER_ID, a.DOCTOR_ID, a.STATUS,
      d.NAME AS DOCTOR_NAME, d.EMAIL AS DOCTOR_EMAIL, d.EXPERIENCE AS DOCTOR_EXPERIENCE, d.IMAGE AS DOCTOR_IMAGE, d.SPECIALTY AS DOCTOR_SPECIALTY, d.FEES AS DOCTOR_FEES,
      p.NAME AS PATIENT_NAME, p.EMAIL AS PATIENT_EMAIL, p.PHONE AS PATIENT_PHONE, p.DATE_OF_BIRTH AS PATIENT_DATE_OF_BIRTH, p.ADRESSE AS PATIENT_ADRESSE, p.IMAGE AS PATIENT_IMAGE
    FROM 
      MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS a
    JOIN 
      MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS d ON a.DOCTOR_ID = d.DOCTOR_ID
    JOIN 
      MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS p ON a.USER_ID = p.PATIENT_ID
    ORDER BY 
      a.SLOT_DATE DESC, a.SLOT_TIME DESC
  `;

  try {
    const appointments = await executeQuery(query);

    // Organiser les données en un objet par table
    const result = appointments.map((appointment) => ({
      APPOINTMENT: {
        APPOINTMENT_ID: appointment.APPOINTMENT_ID,
        CREATED_AT: appointment.CREATED_AT,
        SLOT_DATE: appointment.SLOT_DATE,
        SLOT_TIME: appointment.SLOT_TIME,
        STATUS: appointment.STATUS,
      },
      DOCTOR: {
        NAME: appointment.DOCTOR_NAME,
        EMAIL: appointment.DOCTOR_EMAIL,
        EXPERIENCE: appointment.DOCTOR_EXPERIENCE,
        IMAGE: appointment.DOCTOR_IMAGE,
        SPECIALTY: appointment.DOCTOR_SPECIALTY,
        FEES: appointment.DOCTOR_FEES,
      },
      PATIENT: {
        NAME: appointment.PATIENT_NAME,
        EMAIL: appointment.PATIENT_EMAIL,
        PHONE: appointment.PATIENT_PHONE,
        DATE_OF_BIRTH: appointment.PATIENT_DATE_OF_BIRTH,
        ADRESSE: appointment.PATIENT_ADRESS,
        IMAGE: appointment.PATIENT_IMAGE,
      },
    }));

    return result;
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    throw error;
  }
};

// fun to delete an appointment:
export const deleteAppointmentByAdmin = async (APPOINTMENT_ID) => {
  try {
    // Ensure the appointment exists before attempting to delete
    const checkQuery = `
      SELECT *
      FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS
      WHERE APPOINTMENT_ID = ?
    `;

    const appointments = await executeQuery(checkQuery, [APPOINTMENT_ID]);

    if (appointments.length === 0) {
      throw new Error("Appointment not found.");
    }

    // Delete the appointment
    const deleteQuery = `
      DELETE FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS
      WHERE APPOINTMENT_ID = ?
    `;

    await executeQuery(deleteQuery, [APPOINTMENT_ID]);

    return { success: true, message: "Appointment deleted successfully." };
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw new Error(error.message || "Error deleting appointment.");
  }
};

export const getAllAppointments = async () => {
  const query = `
  SELECT 
    a.APPOINTMENT_ID,
    a.SLOT_DATE,
    a.SLOT_TIME,
    a.STATUS,
    a.USER_ID,
    d.NAME as doctorName,
    d.IMAGE as doctorImage
  FROM 
    MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS a
  JOIN 
    MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS d ON a.DOCTOR_ID = d.DOCTOR_ID
`;

  try {
    const result = await executeQuery(query);
    return result;
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    throw error;
  }
};
