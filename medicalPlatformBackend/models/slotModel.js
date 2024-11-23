import { executeQuery } from "../config/snowflake.js";

export const findBookedSlots = async (doctorId) => {
  const slotsQuery = `
    SELECT 
      SLOT_DATE,
      SLOT_TIME,
      IS_BOOKED
    FROM DOCTOR_SLOTS
    WHERE 
      DOCTOR_ID = ?
      AND SLOT_DATE >= CURRENT_DATE()
      AND SLOT_DATE <= DATEADD(days, 7, CURRENT_DATE())
    ORDER BY SLOT_DATE, SLOT_TIME
  `;

  try {
    const [bookedSlots] = await executeQuery({
      sqlText: slotsQuery,
      binds: [doctorId],
    });
    return bookedSlots || [];
  } catch (error) {
    console.error("Error in findBookedSlots:", error);
    return [];
  }
};

export const findSlot = async (doctorId, slotDate, slotTime) => {
  const query = `
    SELECT 
      SLOT_ID,
      IS_BOOKED
    FROM DOCTOR_SLOTS
    WHERE 
      DOCTOR_ID = ?
      AND SLOT_DATE = ?
      AND SLOT_TIME = ?
  `;

  try {
    const [slots] = await executeQuery({
      sqlText: query,
      binds: [doctorId, slotDate, slotTime],
    });
    return slots?.[0];
  } catch (error) {
    console.error("Error in findSlot:", error);
    return null;
  }
};

export const updateOrCreateSlot = async (doctorId, slotDate, slotTime) => {
  const slotQuery = `
    MERGE INTO DOCTOR_SLOTS DS
    USING (SELECT ? as doc_id, ? as s_date, ? as s_time) SRC
    ON  DS.DOCTOR_ID = SRC.doc_id
        AND DS.SLOT_DATE = SRC.s_date
        AND DS.SLOT_TIME = SRC.s_time
    WHEN MATCHED AND DS.IS_BOOKED = FALSE THEN
        UPDATE SET IS_BOOKED = TRUE
    WHEN NOT MATCHED THEN
        INSERT (DOCTOR_ID, SLOT_DATE, SLOT_TIME, IS_BOOKED)
        VALUES (SRC.doc_id, SRC.s_date, SRC.s_time, TRUE)
  `;

  await executeQuery({
    sqlText: slotQuery,
    binds: [doctorId, slotDate, slotTime],
  });
};
