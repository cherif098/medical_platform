import { getDoctorStatus, updateDoctorStatus } from "../models/doctorModel.js";
import {
  getDoctorsWithoutPassword,
  getDoctorByEmail,
  getDoctorAppointmentsQuery,
} from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { executeQuery } from "../config/snowflake.js";

export const changeAvailability = async (req, res) => {
  const { DOCTOR_LICENCE } = req.body;

  try {
    // Récupérer l'état actuel du médecin
    const doctorData = await getDoctorStatus(DOCTOR_LICENCE);

    if (doctorData.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found!" });
    }

    // Inverser le statut actuel
    const newStatus = !doctorData[0].STATUS;

    // Mettre à jour le statut dans la base de données
    await updateDoctorStatus(DOCTOR_LICENCE, newStatus);

    // Retourner une réponse de succès
    res.json({ success: true, message: "Availability changed!" });
  } catch (error) {
    console.error("Error changing availability:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const doctorList = async (req, res) => {
  try {
    const doctors = await getDoctorsWithoutPassword();
    res.json({ success: true, doctors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const findAvailableDoctor = async (doctorId) => {
  const doctorQuery = `
      SELECT DOCTOR_ID, STATUS, FEES 
      FROM DOCTORS 
      WHERE DOCTOR_ID = ? AND STATUS = TRUE
  `;
  const [doctor] = await snowflake.execute({
    sqlText: doctorQuery,
    binds: [doctorId],
  });
  return doctor;
};

export const doctorLogin = async (req, res) => {
  try {
    const { EMAIL, PASSWORD } = req.body;
    if (!EMAIL || !PASSWORD) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    const doctor = await getDoctorByEmail(EMAIL);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    const isPasswordValid = await bcrypt.compare(PASSWORD, doctor.PASSWORD); // Comparaison du mot de passe hashé
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Création du token JWT
    const token = jwt.sign(
      { doctorId: doctor.DOCTOR_ID, email: EMAIL },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//APi to get doctor appointments from doctor panel
export const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.user.DOCTOR_ID;

    // Requête SQL pour récupérer les rendez-vous avec les informations du patient
    const query = `
      SELECT 
        A.APPOINTMENT_ID,
        A.USER_ID,
        A.SLOT_DATE,
        A.SLOT_TIME,
        A.FEES,
        A.STATUS,
        P.NAME as PATIENT_NAME,
        P.EMAIL as PATIENT_EMAIL,
        P.PHONE as PATIENT_PHONE,
        P.GENDER as PATIENT_GENDER
      FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS A
      JOIN MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS P ON A.USER_ID = P.PATIENT_ID
      WHERE A.DOCTOR_ID = ?
      ORDER BY A.SLOT_DATE DESC, A.SLOT_TIME DESC
    `;

    // Exécution de la requête
    const appointments = await executeQuery(query, [doctorId]);

    // Si aucun rendez-vous n'est trouvé
    if (!appointments || appointments.length === 0) {
      return res.json({
        success: true,
        message: "No appointments found",
        appointments: [],
      });
    }

    // Formater les dates et heures pour l'affichage
    const formattedAppointments = appointments.map((appointment) => ({
      ...appointment,
      SLOT_DATE: new Date(appointment.SLOT_DATE).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      SLOT_TIME: appointment.SLOT_TIME.slice(0, 5), // Format HH:mm
    }));

    res.json({
      success: true,
      message: "Appointments retrieved successfully",
      appointments: formattedAppointments,
    });
  } catch (error) {
    console.error("Error retrieving appointments:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving appointments",
      error: error.message,
    });
  }
};
