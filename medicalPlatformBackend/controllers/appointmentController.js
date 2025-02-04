import { executeQuery } from "../config/snowflake.js";
import * as doctorModel from "../models/doctorModel.js";
import * as appointmentModel from "../models/appointmentModel.js";

export const getAvailableSlots = async (req, res) => {
  const { DOCTOR_ID } = req.params;

  try {
    console.log("Fetching doctor info for ID:", DOCTOR_ID);
    const doctor = await doctorModel.findAvailableDoctor(DOCTOR_ID);

    if (!doctor) {
      console.error("Doctor not found or not available for ID:", DOCTOR_ID);
      return res.status(404).json({
        success: false,
        message: "Doctor not found or not available",
      });
    }

    console.log("Doctor found:", doctor);

    const bookedSlots = await slotModel.findBookedSlots(DOCTOR_ID);
    console.log("Booked slots:", bookedSlots);

    // Créez une Map pour les créneaux réservés
    const bookedSlotsMap = new Map(
      bookedSlots.map((slot) => [
        `${slot.SLOT_DATE}_${slot.SLOT_TIME}`,
        slot.IS_BOOKED,
      ])
    );

    // Génération des créneaux
    const availableSlots = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const daySlots = [];
      let startHour = i === 0 ? Math.max(10, currentDate.getHours() + 1) : 10;
      let startMinute = i === 0 ? (currentDate.getMinutes() > 30 ? 30 : 0) : 0;

      currentDate.setHours(startHour, startMinute, 0, 0);
      const endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);

      while (currentDate < endTime) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const timeStr = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });

        const slotKey = `${dateStr}_${timeStr}`;

        if (!bookedSlotsMap.get(slotKey)) {
          daySlots.push({
            dateTime: new Date(currentDate),
            time: timeStr,
            date: dateStr,
          });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      availableSlots.push(daySlots);
    }

    console.log("Available slots:", availableSlots);

    res.json({
      success: true,
      slots: availableSlots,
      doctorFees: doctor.FEES,
    });
  } catch (error) {
    console.error("Error in getAvailableSlots:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Error fetching available slots",
    });
  }
};

// fun to book an appointment :
export const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.user.PATIENT_ID;

    console.log("Received booking data:", {
      docId,
      slotDate,
      slotTime,
      userId,
    });

    // Format the date
    let formattedDate;
    try {
      if (slotDate.includes("-")) {
        // If date is in DD-MM-YYYY format
        const [day, month, year] = slotDate.split("-");
        formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}`;
      } else if (slotDate.includes("/")) {
        // If date is in DD/MM/YYYY format
        const [day, month, year] = slotDate.split("/");
        formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
          2,
          "0"
        )}`;
      } else {
        // If date is already in YYYY-MM-DD format
        formattedDate = slotDate;
      }
    } catch (error) {
      console.error("Date parsing error:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use DD-MM-YYYY format.",
      });
    }

    // Format the time
    // const formattedTime = slotTime.length === 5
    //   ? `${slotTime}:00`
    //   : slotTime;

    // Format the time
    let formattedTime;
try {
  if (slotTime.match(/^\d{2}:\d{2}$/)) {
    // Format 24h, ex: "14:30"
    formattedTime = `${slotTime}:00`;
  } else if (slotTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)) {
    // Format 12h avec AM/PM, ex: "2:30 PM"
    const timeMatch = slotTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    let [_, hours, minutes, period] = timeMatch;
    hours = parseInt(hours);

    if (period.toUpperCase() === "PM" && hours !== 12) {
      hours += 12;
    } else if (period.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }

    formattedTime = `${hours.toString().padStart(2, "0")}:${minutes}:00`;
  } else {
    throw new Error("Invalid time format");
  }

  // Validation finale du format
  if (!formattedTime.match(/^\d{2}:\d{2}:\d{2}$/)) {
    throw new Error("Invalid time format");
  }
} catch (error) {
  console.error("Time parsing error:", error);
  return res.status(400).json({
    success: false,
    message: "Invalid time format. Please use HH:MM AM/PM or HH:MM.",
  });
}

    // Verify doctor availability
    const doctor = await doctorModel.findAvailableDoctor(docId);
    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor not available",
      });
    }

    // Check if slot is already booked
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS 
      WHERE DOCTOR_ID = ? 
      AND SLOT_DATE = TO_DATE(?, 'YYYY-MM-DD')
      AND SLOT_TIME = TO_TIME(?)
      AND STATUS != 'CANCELLED'
    `;

    const existingAppointments = await executeQuery(checkQuery, [
      parseInt(docId),
      formattedDate,
      formattedTime,
    ]);

    if (existingAppointments[0].COUNT > 0) {
      return res.status(400).json({
        success: false,
        message: "This slot is already booked. Please select another time.",
      });
    }

    // Insert the appointment
    const insertQuery = `
      INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS 
      (DOCTOR_ID, USER_ID, SLOT_DATE, SLOT_TIME, FEES, STATUS) 
      VALUES (
        ?, 
        ?, 
        TO_DATE(?, 'YYYY-MM-DD'),
        TO_TIME(?),
        ?,
        'SCHEDULED'
      )
    `;

    await executeQuery(insertQuery, [
      parseInt(docId),
      userId,
      formattedDate,
      formattedTime,
      parseFloat(doctor.FEES),
    ]);

    res.json({
      success: true,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error booking appointment",
    });
  }
};

export const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.PATIENT_ID;

    const query = `
      SELECT 
        a.APPOINTMENT_ID,
        TO_VARCHAR(a.SLOT_DATE, 'YYYY-MM-DD') as SLOT_DATE,
        TO_VARCHAR(a.SLOT_TIME, 'HH24:MI:SS') as SLOT_TIME,
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
      ORDER BY a.SLOT_DATE, a.SLOT_TIME
    `;

    const appointments = await executeQuery(query, [patientId]);

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: error.message,
    });
  }
};

//  cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const patientId = req.user.PATIENT_ID;

    await appointmentModel.deleteAppointment(appointmentId, patientId);

    return res.json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error cancelling appointment",
    });
  }
};
