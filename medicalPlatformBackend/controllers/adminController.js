import {
  insertSecretary,
  deleteSecretary,
  getSecretariesWithoutPassword,
  checkSecretaryEmailExists,
} from "../models/secretaryModel.js";

import {
  insertManager,
  deleteManager,
  getManagersWithoutPassword,
  checkManagerEmailExists,
} from "../models/managerModel.js";
import { insertDoctor, deleteDoctor } from "../models/doctorModel.js";
import {
  insertNurse,
  deleteNurse,
  getNursesWithoutPassword,
} from "../models/nurseModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { executeQuery } from "../config/snowflake.js";
import jwt from "jsonwebtoken";
import {
  getDoctorsWithoutPassword,
  getAllDoctors,
} from "../models/doctorModel.js";
import {
  getAllAppointmentsForAdmin,
  deleteAppointmentByAdmin,
  getAllAppointments,
} from "../models/appointmentModel.js";
import { getAllPatients } from "../models/patientModel.js";

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

// Fonction pour vérifier si un champ existe déjà dans la base de données
export const checkIfEmailExists = async (field, value) => {
  const query = `SELECT COUNT(*) AS count FROM MEDICAL_DB.MEDICAL_SCHEMA.Nurses WHERE ${field} = ?`;
  const result = await executeQuery(query, [value]);
  return result[0].COUNT > 0; // Retourne true si l'élément existe déjà
};

export const addNurse = async (req, res) => {
  const {
    EMAIL,
    PASSWORD,
    NAME,
    PHONE,
    ADRESSE,
    STATUS,
    EXPERIENCE,
    ABOUT,
    IS_PASSWORD_TEMPORARY,
  } = req.body;

  const imageFile = req.file;
  let imageUrl = "default-nurse-image.jpg";

  if (!EMAIL || !PASSWORD || !NAME) {
    return res
      .status(400)
      .json({ error: "Missing required fields (EMAIL, PASSWORD, NAME)" });
  }

  try {
    const emailExists = await checkIfEmailExists("EMAIL", EMAIL);
    if (emailExists) {
      return res.status(400).json({ error: `Email ${EMAIL} already exists.` });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(PASSWORD, salt);

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      imageUrl = imageUpload.secure_url;
    }
    const nurseData = {
      EMAIL,
      PASSWORD: hashedPassword,
      NAME,
      PHONE: PHONE || "Not provided",
      ADRESSE: ADRESSE || "Not provided",
      IMAGE: imageUrl,
      STATUS: STATUS ?? true,
      CREATED_AT: new Date().toISOString(),
      EXPERIENCE: EXPERIENCE || 0,
      ABOUT: ABOUT || "No description provided",
      IS_PASSWORD_TEMPORARY: IS_PASSWORD_TEMPORARY ?? true,
    };
    await insertNurse(nurseData);

    res.status(200).json({ message: "Nurse added successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to add nurse", details: err.message });
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
    const appointments = await getAllAppointmentsForAdmin();
    res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve appointments" });
  }
};

//API to cancel an appointment from admin panel
export const AppointmentCancel = async (req, res) => {
  try {
    const { APPOINTMENT_ID } = req.params;
    console.log("Request Params:", req.params); // Logs route parameters

    await deleteAppointmentByAdmin(APPOINTMENT_ID);
    console.log("Request Params1:", req.params); // Logs route parameters

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

export const deleteDoctorAdmin = async (req, res) => {
  try {
    const { DOCTOR_ID } = req.params;

    await deleteDoctor(DOCTOR_ID);

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteDoctorAdmin:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete doctor",
    });
  }
};

//API to get dashbord data for admin panel
export const AdminDashboard = async (req, res) => {
  try {
    const doctors = await getAllDoctors();
    const appointments = await getAllAppointments();
    const patient = await getAllPatients();

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: patient.length,
      latestAppointments: appointments.reverse().slice(0, 5),
      doctorName: appointments.doctorName,
      doctorImage: appointments.doctorImage,
    };
    res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: dashData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// supp un infirmier
export const deleteNurseAdmin = async (req, res) => {
  try {
    const { nurseId } = req.params;

    if (!nurseId) {
      return res.status(400).json({
        success: false,
        message: "NURSE_ID is required to delete a nurse.",
      });
    }

    const result = await deleteNurse(nurseId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Nurse not found or already deleted.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Nurse deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteNurseAdmin:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete nurse.",
    });
  }
};
// liste des infimiers
export const allNurses = async (req, res) => {
  try {
    const nurses = await getNursesWithoutPassword();
    res.status(200).json({
      success: true,
      message: "Nurses retrieved successfully",
      data: nurses,
    });
  } catch (error) {
    console.error("Error retrieving nurses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve nurses",
      error: error.message,
    });
  }
};
// Add a secretary
export const addSecretary = async (req, res) => {
  const {
    EMAIL,
    PASSWORD,
    NAME,
    PHONE,
    ADDRESS,
    STATUS,
    EXPERIENCE,
    ABOUT,
    IS_PASSWORD_TEMPORARY,
    HOSPITAL_ID,
  } = req.body;

  const imageFile = req.file;
  let imageUrl = "default-secretary-image.jpg";

  if (!EMAIL || !PASSWORD || !NAME) {
    return res
      .status(400)
      .json({ error: "Missing required fields (EMAIL, PASSWORD, NAME)" });
  }

  try {
    const emailExists = await checkSecretaryEmailExists(EMAIL);
    if (emailExists) {
      return res.status(400).json({ error: `Email ${EMAIL} already exists.` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(PASSWORD, salt);

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      imageUrl = imageUpload.secure_url;
    }

    const secretaryData = {
      EMAIL,
      PASSWORD: hashedPassword,
      NAME,
      PHONE: PHONE || "Not provided",
      ADDRESS: ADDRESS || "Not provided",
      IMAGE: imageUrl,
      STATUS: STATUS ?? true,
      CREATED_AT: new Date().toISOString(),
      EXPERIENCE: EXPERIENCE || 0,
      ABOUT: ABOUT || "No description provided",
      IS_PASSWORD_TEMPORARY: IS_PASSWORD_TEMPORARY ?? true,
      HOSPITAL_ID: HOSPITAL_ID || 1, // Default hospital ID
    };

    await insertSecretary(secretaryData);

    res.status(200).json({
      success: true,
      message: "Secretary added successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Failed to add secretary",
      details: err.message,
    });
  }
};

// Get all secretaries
export const allSecretaries = async (req, res) => {
  try {
    const secretaries = await getSecretariesWithoutPassword();
    res.status(200).json({
      success: true,
      message: "Secretaries retrieved successfully",
      data: secretaries,
    });
  } catch (error) {
    console.error("Error retrieving secretaries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve secretaries",
      error: error.message,
    });
  }
};

// Delete a secretary
export const deleteSecretaryAdmin = async (req, res) => {
  try {
    const { secretaryId } = req.params;

    if (!secretaryId) {
      return res.status(400).json({
        success: false,
        message: "SECRETARY_ID is required to delete a secretary.",
      });
    }

    const result = await deleteSecretary(secretaryId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Secretary not found or already deleted.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Secretary deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteSecretaryAdmin:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete secretary.",
    });
  }
};

// --- MANAGER FUNCTIONS ---

// Add a manager
export const addManager = async (req, res) => {
  const {
    EMAIL,
    PASSWORD,
    NAME,
    PHONE,
    ADDRESS,
    DEPARTMENT,
    STATUS,
    EXPERIENCE,
    ABOUT,
    IS_PASSWORD_TEMPORARY,
    HOSPITAL_ID,
  } = req.body;

  const imageFile = req.file;
  let imageUrl = "default-manager-image.jpg";

  if (!EMAIL || !PASSWORD || !NAME) {
    return res
      .status(400)
      .json({ error: "Missing required fields (EMAIL, PASSWORD, NAME)" });
  }

  try {
    const emailExists = await checkManagerEmailExists(EMAIL);
    if (emailExists) {
      return res.status(400).json({ error: `Email ${EMAIL} already exists.` });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(PASSWORD, salt);

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      imageUrl = imageUpload.secure_url;
    }

    const managerData = {
      EMAIL,
      PASSWORD: hashedPassword,
      NAME,
      PHONE: PHONE || "Not provided",
      ADDRESS: ADDRESS || "Not provided",
      IMAGE: imageUrl,
      DEPARTMENT: DEPARTMENT || "General Administration",
      STATUS: STATUS ?? true,
      CREATED_AT: new Date().toISOString(),
      EXPERIENCE: EXPERIENCE || 0,
      ABOUT: ABOUT || "No description provided",
      IS_PASSWORD_TEMPORARY: IS_PASSWORD_TEMPORARY ?? true,
      HOSPITAL_ID: HOSPITAL_ID || 1, // Default hospital ID
    };

    await insertManager(managerData);

    res.status(200).json({
      success: true,
      message: "Manager added successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Failed to add manager",
      details: err.message,
    });
  }
};

// Get all managers
export const allManagers = async (req, res) => {
  try {
    const managers = await getManagersWithoutPassword();
    res.status(200).json({
      success: true,
      message: "Managers retrieved successfully",
      data: managers,
    });
  } catch (error) {
    console.error("Error retrieving managers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve managers",
      error: error.message,
    });
  }
};

// Delete a manager
export const deleteManagerAdmin = async (req, res) => {
  try {
    const { managerId } = req.params;

    if (!managerId) {
      return res.status(400).json({
        success: false,
        message: "MANAGER_ID is required to delete a manager.",
      });
    }

    const result = await deleteManager(managerId);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Manager not found or already deleted.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Manager deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteManagerAdmin:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete manager.",
    });
  }
};
