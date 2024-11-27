import { getDoctorStatus, updateDoctorStatus } from "../models/doctorModel.js";
import { 
  getDoctorsWithoutPassword, 
  getDoctorByEmail, 
  getDoctorAppointmentsById } from "../models/doctorModel.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";



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
    if (!EMAIL || !PASSWORD ) {
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
  }catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }

}

//APi to get doctor appointments from doctor panel
export const getDoctorAppointments = async (req, res) => {
  try {
    // Récupérer l'ID du médecin à partir de req.body (décodé par le middleware)
    const DOCTOR_ID = req.user;
    console.log(DOCTOR_ID);

    // Récupérer les rendez-vous en utilisant l'ID du médecin
    const appointments = await getDoctorAppointmentsById(DOCTOR_ID);
    console.log(appointments);

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No appointments found for the doctor.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching appointments",
    });
  }
};