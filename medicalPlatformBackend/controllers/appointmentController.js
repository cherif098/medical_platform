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

export const bookAppointment = async (req, res) => {
  const { userId, DOCTOR_ID, slotDate, slotTime } = req.body;

  try {
    // Commencer une transaction
    await executeQuery({ sqlText: "BEGIN TRANSACTION" });

    // Vérifier si le docteur est disponible
    const doctor = await findAvailableDoctor(DOCTOR_ID);
    if (!doctor) {
      await executeQuery({ sqlText: "ROLLBACK" });
      return res.status(400).json({
        success: false,
        message: "Doctor not available",
      });
    }

    // Vérifier si le créneau n'est pas déjà réservé
    const existingSlot = await slotModel.findSlot(
      DOCTOR_ID,
      slotDate,
      slotTime
    );
    if (existingSlot && existingSlot.IS_BOOKED) {
      await executeQuery({ sqlText: "ROLLBACK" });
      return res.status(400).json({
        success: false,
        message: "This slot is already booked",
      });
    }

    // Créer ou mettre à jour le créneau
    await slotModel.updateOrCreateSlot(DOCTOR_ID, slotDate, slotTime);

    // Créer le rendez-vous
    await appointmentModel.createAppointment(
      DOCTOR_ID,
      userId,
      slotDate,
      slotTime,
      doctor.FEES
    );

    // Valider la transaction
    await executeQuery({ sqlText: "COMMIT" });

    res.json({
      success: true,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await executeQuery({ sqlText: "ROLLBACK" });
    console.error("Error in bookAppointment:", error);
    res.status(500).json({
      success: false,
      message: "Error booking appointment",
    });
  }
};
