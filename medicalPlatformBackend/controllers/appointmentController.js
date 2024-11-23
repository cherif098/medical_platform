import { executeQuery } from "../config/snowflake.js";
import * as doctorModel from "../models/doctorModel.js";
import * as slotModel from "../models/slotModel.js";
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

// 
export const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.user.PATIENT_ID;

    // Vérifie le docteur
    const doctor = await doctorModel.findAvailableDoctor(docId);
    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor not available"
      });
    }

    // Parse et formate la date
    const [day, month, year] = slotDate.split('-');
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    // Formate l'heure
    const timeFormat = new Date(`2000-01-01 ${slotTime}`);
    const formattedTime = timeFormat.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Vérifie si le créneau est déjà réservé
    const checkQuery = `
      SELECT COUNT(*) as count 
      FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS 
      WHERE DOCTOR_ID = ? 
      AND SLOT_DATE = ? 
      AND SLOT_TIME = ?
      AND STATUS != 'CANCELLED'
    `;

    const existingAppointments = await executeQuery(
      checkQuery, 
      [parseInt(docId), formattedDate, formattedTime]
    );

    if (existingAppointments[0].COUNT > 0) {
      return res.status(400).json({
        success: false,
        message: "This slot is already booked. Please select another time."
      });
    }

    // Si le créneau est libre, procède à la réservation
    const insertQuery = "INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS (DOCTOR_ID, USER_ID, SLOT_DATE, SLOT_TIME, FEES) VALUES (?, ?, ?, ?, ?)";

    await executeQuery(
      insertQuery, 
      [
        parseInt(docId), 
        userId, 
        formattedDate,
        formattedTime,
        parseFloat(doctor.FEES)
      ]
    );

    res.json({
      success: true,
      message: "Appointment booked successfully"
    });

  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error booking appointment"
    });
  }
};


export const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const patientId = req.user.PATIENT_ID;

    // Vérifier si le rendez-vous existe et appartient au patient
    const [appointment] = await executeQuery(
      'SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS WHERE APPOINTMENT_ID = ? AND USER_ID = ?',
      [appointmentId, patientId]
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }

    // Vérifier que le rendez-vous n'a pas déjà été annulé
    if (appointment.STATUS === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Le rendez-vous a déjà été annulé'
      });
    }

    // Mettre à jour le statut du rendez-vous sur "Annulé"
    await executeQuery(
      'UPDATE MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS SET STATUS = "Cancelled" WHERE APPOINTMENT_ID = ?',
      [appointmentId]
    );

    return res.json({
      success: true,
      message: 'Rendez-vous annulé avec succès'
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'annulation du rendez-vous',
      error: error.message
    });
  }
};