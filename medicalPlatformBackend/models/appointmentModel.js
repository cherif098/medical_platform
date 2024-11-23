import { executeQuery } from "../config/snowflake.js";

export const createAppointment = async (
  doctorId,
  userId,
  slotDate,
  slotTime,
  fees
) => {
  const appointmentQuery = `
        INSERT INTO APPOINTMENTS (
            DOCTOR_ID, USER_ID, SLOT_DATE, SLOT_TIME, FEES
        ) VALUES (?, ?, ?, ?, ?)
    `;
  await executeQuery({
    sqlText: appointmentQuery,
    binds: [doctorId, userId, slotDate, slotTime, fees],
  });
};
