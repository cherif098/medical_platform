import { insertDoctor } from "../models/doctorModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { executeQuery } from "../config/snowflake.js";
import jwt from "jsonwebtoken";
import { getDoctorsWithoutPassword } from "../models/doctorModel.js";
import { getAllAppointments,deleteAppointmentByAdmin } from "../models/appointmentModel.js";

// Fonction pour vérifier si un champ existe déjà dans la base de données
export const checkIfExists = async (field, value) => {
  const query = `SELECT COUNT(*) AS count FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS WHERE ${field} = ?`;
  const result = await executeQuery(query, [value]);
  return result[0].COUNT > 0; // Retourne true si l'élément existe déjà
};

export const addDoctor = async (req, res) => {
  try {
    const {
      DOCTOR_LICENCE,
      EMAIL,
      PASSWORD,
      NAME,
      SPECIALTY,
      IS_PASSWORD_TEMPORARY,
      STATUS,
      FEES,
      ADRESS_1,
      ADRESS_2,
      DEGREE,
      EXPERIENCE,
      ABOUT,
    } = req.body;

    // Récupération du fichier image (si fourni)
    const imageFile = req.file;
    const IMAGE = imageFile ? imageFile.path : null; // Chemin local de l'image

    if (
      !DOCTOR_LICENCE ||
      !EMAIL ||
      !PASSWORD ||
      !NAME ||
      !SPECIALTY ||
      !STATUS ||
      !FEES ||
      !ADRESS_1 ||
      !ADRESS_2 ||
      !DEGREE ||
      !EXPERIENCE ||
      !ABOUT ||
      !imageFile
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const licenceExists = await checkIfExists("DOCTOR_LICENCE", DOCTOR_LICENCE);
    const emailExists = await checkIfExists("EMAIL", EMAIL);

    if (licenceExists) {
      throw new Error(`Doctor Licence ${DOCTOR_LICENCE} already exists.`);
    }
    if (emailExists) {
      throw new Error(`Email ${EMAIL} already exists.`);
    }

    // Hashage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(PASSWORD, salt);

    // Téléchargement de l'image sur Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    // Définition des champs prédéfinis
    const CREATED_AT = new Date().toISOString(); // Date actuelle
    const CREATED_BY = "admin"; // Par défaut, créé par "admin"

    // Préparation des données pour l'insertion
    const doctorData = {
      DOCTOR_LICENCE,
      EMAIL,
      PASSWORD: hashedPassword,
      NAME,
      SPECIALTY,
      IS_PASSWORD_TEMPORARY,
      STATUS,
      FEES,
      ADRESS_1,
      ADRESS_2,
      DEGREE,
      EXPERIENCE,
      ABOUT,
      CREATED_AT,
      CREATED_BY,
      IMAGE: imageUrl,
    };

    // Insertion des données dans la base
    await insertDoctor(doctorData);

    // Réponse en cas de succès
    res.status(200).json({ message: "Doctor added successfully" });
  } catch (err) {
    console.error(err);

    // Réponse en cas d'échec
    res
      .status(500)
      .json({ error: "Failed to add doctor", details: err.message });
  }
};

// Fonction pour gérer l'authentification de l'admin
export const loginAdmin = async (req, res) => {
  try {
    const { EMAIL, PASSWORD } = req.body;

    // Validation des champs requis
    if (!EMAIL || !PASSWORD) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Vérification des credentials
    if (
      EMAIL === process.env.ADMIN_EMAIL &&
      PASSWORD === process.env.ADMIN_PASSWORD
    ) {
      // Création du token JWT
      const token = jwt.sign(
        { email: EMAIL, role: "admin" },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

export const allDoctors = async (req, res) => {
  try {
    const doctors = await getDoctorsWithoutPassword();
    res.status(200).json({
      success: true,
      message: "Doctors retrieved successfully",
      data: doctors,
    });
  } catch (error) {
    console.error("Error retrieving doctors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve doctors",
      error: error.message,
    });
  }
};

//API to get all appointments list
export const getAllAppointmentsAdmin = async (req, res) => {
  try {
    const appointments = await getAllAppointments();
    res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      data: appointments,
    });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to retrieve appointments" });

  }
}

//API to cancel an appointment from admin panel
export const AppointmentCancel = async (req, res) => {
  try {
    const { APPOINTMENT_ID } = req.params;
    console.log('Request Params:', req.params); // Logs route parameters


    await deleteAppointmentByAdmin (APPOINTMENT_ID);

    return res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error cancelling appointment'
    });
  }
};

