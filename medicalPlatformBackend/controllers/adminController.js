import { insertDoctor, deleteDoctor } from "../models/doctorModel.js";
import {
  insertNurse,
  deleteNurse,
  getNursesWithoutPassword,
} from "../models/nurseModel.js";
import {
  insertSecretary,
  deleteSecretary,
  getSecretariesWithoutPassword,
} from "../models/secretaryModel.js";
import {
  insertManager,
  deleteManager,
  getManagersWithoutPassword,
} from "../models/managerModel.js";
import { getHospitalByEmail } from "../models/hospitalModel.js";
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
import {
  getAllPatients,
  getPatientsByHospital,
} from "../models/patientModel.js";

// Fonction pour vérifier si un champ existe déjà dans la base de données
export const checkIfExists = async (field, value) => {
  const query = `SELECT COUNT(*) AS count FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS WHERE ${field} = ?`;
  const result = await executeQuery(query, [value]);
  return result[0].COUNT > 0; // Retourne true si l'élément existe déjà
};

// Fonction pour authentifier un administrateur (hôpital)
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

    // Méthode 1: Vérifie les credentials via les variables d'environnement (pour la compatibilité)
    if (
      EMAIL === process.env.ADMIN_EMAIL &&
      PASSWORD === process.env.ADMIN_PASSWORD
    ) {
      // Création du token JWT pour le super admin
      const token = jwt.sign(
        { email: EMAIL, role: "superadmin" },
        process.env.JWT_SECRET,
        {
          expiresIn: "8h",
        }
      );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        isSuperAdmin: true,
      });
    }

    // Méthode 2: Vérifie les credentials via la table HOSPITALS
    try {
      const hospital = await getHospitalByEmail(EMAIL);

      if (hospital) {
        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(
          PASSWORD,
          hospital.PASSWORD
        );

        if (isPasswordValid) {
          // Création du token JWT pour l'admin d'hôpital
          const token = jwt.sign(
            {
              hospitalId: hospital.ID,
              email: EMAIL,
              role: "admin",
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "8h",
            }
          );

          return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            hospitalName: hospital.NAME,
            hospitalId: hospital.ID,
          });
        }
      }
    } catch (dbError) {
      console.error("Database error during login:", dbError);
      // Si l'erreur est liée à la base de données, on continue vers l'échec d'authentification
    }

    // Si aucune des méthodes n'a réussi
    res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
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

// Ajout d'un médecin (avec HOSPITAL_ID)
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

    // Récupérer l'ID de l'hôpital à partir du token
    const hospitalId = req.user?.hospitalId;

    // Pour le super admin, on peut laisser l'ajout sans hospitalId
    // Mais pour un admin d'hôpital, on exige un hospitalId
    if (req.user?.role === "admin" && !hospitalId) {
      return res.status(400).json({
        success: false,
        error: "Hospital ID is required for hospital admin",
      });
    }

    // Récupération du fichier image (si fourni)
    const imageFile = req.file;
    if (!imageFile) {
      return res.status(400).json({
        success: false,
        error: "Image file is required",
      });
    }

    if (
      !DOCTOR_LICENCE ||
      !EMAIL ||
      !PASSWORD ||
      !NAME ||
      !SPECIALTY ||
      !FEES
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const licenceExists = await checkIfExists("DOCTOR_LICENCE", DOCTOR_LICENCE);
    const emailExists = await checkIfExists("EMAIL", EMAIL);

    if (licenceExists) {
      return res.status(409).json({
        success: false,
        error: `Doctor Licence ${DOCTOR_LICENCE} already exists.`,
      });
    }
    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: `Email ${EMAIL} already exists.`,
      });
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
    const CREATED_AT = new Date().toISOString();
    const CREATED_BY = "admin";

    // Préparation des données pour l'insertion
    const doctorData = {
      DOCTOR_LICENCE,
      EMAIL,
      PASSWORD: hashedPassword,
      NAME,
      SPECIALTY,
      IS_PASSWORD_TEMPORARY: IS_PASSWORD_TEMPORARY || true,
      STATUS: STATUS || true,
      FEES,
      ADRESS_1: ADRESS_1 || "",
      ADRESS_2: ADRESS_2 || "",
      DEGREE: DEGREE || "",
      EXPERIENCE: EXPERIENCE || 0,
      ABOUT: ABOUT || "",
      CREATED_AT,
      CREATED_BY,
      IMAGE: imageUrl,
      HOSPITAL_ID: hospitalId,
    };

    // Insertion des données dans la base
    await insertDoctor(doctorData);

    // Réponse en cas de succès
    res.status(200).json({
      success: true,
      message: "Doctor added successfully",
      hospitalId: hospitalId,
    });
  } catch (err) {
    console.error("Error adding doctor:", err);

    // Réponse en cas d'échec
    res.status(500).json({
      success: false,
      error: "Failed to add doctor",
      details: err.message,
    });
  }
};

// Fonction pour vérifier si un email d'infirmier existe déjà
export const checkIfEmailExists = async (field, value) => {
  const query = `SELECT COUNT(*) AS count FROM MEDICAL_DB.MEDICAL_SCHEMA.Nurses WHERE ${field} = ?`;
  const result = await executeQuery(query, [value]);
  return result[0].COUNT > 0; // Retourne true si l'élément existe déjà
};

// Ajout d'un infirmier (avec HOSPITAL_ID)
export const addNurse = async (req, res) => {
  try {
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

    // Récupérer l'ID de l'hôpital à partir du token
    const hospitalId = req.user?.hospitalId;

    // Pour le super admin, on peut laisser l'ajout sans hospitalId
    // Mais pour un admin d'hôpital, on exige un hospitalId
    if (req.user?.role === "admin" && !hospitalId) {
      return res.status(400).json({
        success: false,
        error: "Hospital ID is required for hospital admin",
      });
    }

    const imageFile = req.file;
    let imageUrl = "default-nurse-image.jpg";

    if (!EMAIL || !PASSWORD || !NAME) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (EMAIL, PASSWORD, NAME)",
      });
    }

    const emailExists = await checkIfEmailExists("EMAIL", EMAIL);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: `Email ${EMAIL} already exists.`,
      });
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
      HOSPITAL_ID: hospitalId,
    };

    await insertNurse(nurseData);

    res.status(200).json({
      success: true,
      message: "Nurse added successfully",
      hospitalId: hospitalId,
    });
  } catch (err) {
    console.error("Error adding nurse:", err);
    res.status(500).json({
      success: false,
      error: "Failed to add nurse",
      details: err.message,
    });
  }
};

// Ajout d'un secrétaire (avec HOSPITAL_ID)
export const addSecretary = async (req, res) => {
  try {
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
    } = req.body;

    // Récupérer l'ID de l'hôpital à partir du token
    const hospitalId = req.user?.hospitalId;

    // Pour le super admin, on peut laisser l'ajout sans hospitalId
    // Mais pour un admin d'hôpital, on exige un hospitalId
    if (req.user?.role === "admin" && !hospitalId) {
      return res.status(400).json({
        success: false,
        error: "Hospital ID is required for hospital admin",
      });
    }

    const imageFile = req.file;
    let imageUrl = "default-secretary-image.jpg";

    if (!EMAIL || !PASSWORD || !NAME) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (EMAIL, PASSWORD, NAME)",
      });
    }

    // Vérifier si l'email existe déjà
    const checkEmailQuery = `
      SELECT COUNT(*) AS count 
      FROM MEDICAL_DB.MEDICAL_SCHEMA.SECRETARIES 
      WHERE EMAIL = ?
    `;
    const emailCheck = await executeQuery(checkEmailQuery, [EMAIL]);
    const emailExists = emailCheck[0].COUNT > 0;

    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: `Email ${EMAIL} already exists.`,
      });
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
      HOSPITAL_ID: hospitalId,
    };

    await insertSecretary(secretaryData);

    res.status(200).json({
      success: true,
      message: "Secretary added successfully",
      hospitalId: hospitalId,
    });
  } catch (err) {
    console.error("Error adding secretary:", err);
    res.status(500).json({
      success: false,
      error: "Failed to add secretary",
      details: err.message,
    });
  }
};

// Ajout d'un manager (avec HOSPITAL_ID)
export const addManager = async (req, res) => {
  try {
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
    } = req.body;

    // Récupérer l'ID de l'hôpital à partir du token
    const hospitalId = req.user?.hospitalId;

    // Pour le super admin, on peut laisser l'ajout sans hospitalId
    // Mais pour un admin d'hôpital, on exige un hospitalId
    if (req.user?.role === "admin" && !hospitalId) {
      return res.status(400).json({
        success: false,
        error: "Hospital ID is required for hospital admin",
      });
    }

    const imageFile = req.file;
    let imageUrl = "default-manager-image.jpg";

    if (!EMAIL || !PASSWORD || !NAME) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (EMAIL, PASSWORD, NAME)",
      });
    }

    // Vérifier si l'email existe déjà
    const checkEmailQuery = `
      SELECT COUNT(*) AS count 
      FROM MEDICAL_DB.MEDICAL_SCHEMA.MANAGERS 
      WHERE EMAIL = ?
    `;
    const emailCheck = await executeQuery(checkEmailQuery, [EMAIL]);
    const emailExists = emailCheck[0].COUNT > 0;

    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: `Email ${EMAIL} already exists.`,
      });
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
      HOSPITAL_ID: hospitalId,
    };

    await insertManager(managerData);

    res.status(200).json({
      success: true,
      message: "Manager added successfully",
      hospitalId: hospitalId,
    });
  } catch (err) {
    console.error("Error adding manager:", err);
    res.status(500).json({
      success: false,
      error: "Failed to add manager",
      details: err.message,
    });
  }
};

// Récupération des médecins de l'hôpital
export const allDoctors = async (req, res) => {
  try {
    // Récupérer l'ID de l'hôpital à partir du token
    const hospitalId = req.user?.hospitalId;

    console.log("Hospital ID from token:", hospitalId);

    // Requête SQL commune
    const baseQuery = `
      SELECT 
        DOCTOR_ID, DOCTOR_LICENCE, EMAIL, NAME, SPECIALTY, IS_PASSWORD_TEMPORARY, 
        STATUS, FEES, ADRESS_1, ADRESS_2, DEGREE, EXPERIENCE, ABOUT, 
        CREATED_AT, CREATED_BY, IMAGE, HOSPITAL_ID
      FROM 
        MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
    `;

    let doctors;

    // Déterminer quelle requête exécuter en fonction de la présence du hospitalId
    if (hospitalId) {
      const query = `${baseQuery} WHERE HOSPITAL_ID = ?`;
      doctors = await executeQuery(query, [hospitalId]);

      console.log(
        `Found ${doctors.length} doctors for hospital ID ${hospitalId}`
      );
    } else {
      // Si c'est le super admin ou si hospitalId n'est pas disponible
      doctors = await executeQuery(baseQuery);
      console.log(`Found ${doctors.length} doctors (all hospitals)`);
    }

    res.status(200).json({
      success: true,
      message: hospitalId
        ? "Doctors retrieved successfully"
        : "All doctors retrieved successfully",
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
// Récupération des rendez-vous de l'hôpital
export const getAllAppointmentsAdmin = async (req, res) => {
  try {
    const hospitalId = req.user?.hospitalId;

    if (hospitalId) {
      // Si c'est un admin d'hôpital, filtrer les rendez-vous
      const query = `
        SELECT 
          a.APPOINTMENT_ID, a.CREATED_AT, a.SLOT_DATE, a.SLOT_TIME, a.USER_ID, a.DOCTOR_ID, a.STATUS,
          d.NAME AS DOCTOR_NAME, d.EMAIL AS DOCTOR_EMAIL, d.EXPERIENCE AS DOCTOR_EXPERIENCE, 
          d.IMAGE AS DOCTOR_IMAGE, d.SPECIALTY AS DOCTOR_SPECIALTY, d.FEES AS DOCTOR_FEES,
          p.NAME AS PATIENT_NAME, p.EMAIL AS PATIENT_EMAIL, p.PHONE AS PATIENT_PHONE, 
          p.DATE_OF_BIRTH AS PATIENT_DATE_OF_BIRTH, p.ADRESSE AS PATIENT_ADRESSE, p.IMAGE AS PATIENT_IMAGE
        FROM 
          MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS a
        JOIN 
          MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS d ON a.DOCTOR_ID = d.DOCTOR_ID
        JOIN 
          MEDICAL_DB.MEDICAL_SCHEMA.PATIENTS p ON a.USER_ID = p.PATIENT_ID
        WHERE
          d.HOSPITAL_ID = ?
        ORDER BY 
          a.SLOT_DATE DESC, a.SLOT_TIME DESC
      `;

      const appointments = await executeQuery(query, [hospitalId]);

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
          ADRESSE: appointment.PATIENT_ADRESSE,
          IMAGE: appointment.PATIENT_IMAGE,
        },
      }));

      res.status(200).json({
        success: true,
        message: "Appointments retrieved successfully",
        data: result,
      });
    } else {
      // Si c'est le super admin, récupérer tous les rendez-vous
      const appointments = await getAllAppointmentsForAdmin();
      res.status(200).json({
        success: true,
        message: "All appointments retrieved successfully",
        data: appointments,
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve appointments" });
  }
};

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
    const hospitalId = req.user?.hospitalId;

    if (hospitalId) {
      // Vérifier que le médecin appartient bien à cet hôpital
      const checkQuery = `
        SELECT COUNT(*) AS count 
        FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS 
        WHERE DOCTOR_ID = ? AND HOSPITAL_ID = ?
      `;
      const checkResult = await executeQuery(checkQuery, [
        DOCTOR_ID,
        hospitalId,
      ]);

      if (checkResult[0].COUNT === 0) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this doctor",
        });
      }
    }

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

// Dashboard de l'hôpital
export const AdminDashboard = async (req, res) => {
  try {
    const hospitalId = req.user?.hospitalId;

    if (hospitalId) {
      // Si c'est un admin d'hôpital, afficher uniquement ses données
      // Récupérer les médecins de cet hôpital
      const doctorsQuery = `
        SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
        WHERE HOSPITAL_ID = ?
      `;
      const doctors = await executeQuery(doctorsQuery, [hospitalId]);

      // Récupérer les patients de cet hôpital
      const patients = await getPatientsByHospital(hospitalId);

      // Récupérer les rendez-vous des médecins de cet hôpital
      const appointmentsQuery = `
        SELECT a.*, d.NAME as doctorName, d.IMAGE as doctorImage
        FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS a
        JOIN MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS d ON a.DOCTOR_ID = d.DOCTOR_ID
        WHERE d.HOSPITAL_ID = ?
      `;
      const appointments = await executeQuery(appointmentsQuery, [hospitalId]);

      const dashData = {
        doctors: doctors.length,
        appointments: appointments.length,
        patients: patients.length,
        latestAppointments: appointments.slice(0, 5),
        hospitalId: hospitalId,
      };

      res.status(200).json({
        success: true,
        message: "Dashboard data retrieved successfully",
        data: dashData,
      });
    } else {
      // Si c'est le super admin, récupérer les statistiques globales
      const doctors = await getAllDoctors();
      const appointments = await getAllAppointments();
      const patient = await getAllPatients();

      const dashData = {
        doctors: doctors.length,
        appointments: appointments.length,
        patients: patient.length,
        latestAppointments: appointments.slice(0, 5),
        isSuperAdmin: true,
      };

      res.status(200).json({
        success: true,
        message: "Dashboard data retrieved successfully",
        data: dashData,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Suppression d'un infirmier
export const deleteNurseAdmin = async (req, res) => {
  try {
    const { nurseId } = req.params;
    const hospitalId = req.user?.hospitalId;

    if (!nurseId) {
      return res.status(400).json({
        success: false,
        message: "NURSE_ID is required to delete a nurse.",
      });
    }

    if (hospitalId) {
      // Vérifier que l'infirmier appartient bien à cet hôpital
      const checkQuery = `
        SELECT COUNT(*) AS count 
        FROM MEDICAL_DB.MEDICAL_SCHEMA.NURSES 
        WHERE NURSE_ID = ? AND HOSPITAL_ID = ?
      `;
      const checkResult = await executeQuery(checkQuery, [nurseId, hospitalId]);

      if (checkResult[0].COUNT === 0) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this nurse",
        });
      }
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

// Liste des infirmiers de l'hôpital
export const allNurses = async (req, res) => {
  try {
    const hospitalId = req.user?.hospitalId;

    if (hospitalId) {
      // Si c'est un admin d'hôpital, récupérer seulement ses infirmiers
      const query = `
        SELECT 
          NURSE_ID, EMAIL, NAME, PHONE, ADRESSE, IMAGE, STATUS, CREATED_AT, EXPERIENCE, ABOUT, HOSPITAL_ID
        FROM 
          MEDICAL_DB.MEDICAL_SCHEMA.NURSES
        WHERE
          HOSPITAL_ID = ?;
      `;

      const nurses = await executeQuery(query, [hospitalId]);

      res.status(200).json({
        success: true,
        message: "Nurses retrieved successfully",
        data: nurses,
      });
    } else {
      // Si c'est le super admin, récupérer tous les infirmiers
      const nurses = await getNursesWithoutPassword();
      res.status(200).json({
        success: true,
        message: "All nurses retrieved successfully",
        data: nurses,
      });
    }
  } catch (error) {
    console.error("Error retrieving nurses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve nurses",
      error: error.message,
    });
  }
};

// Liste des secrétaires de l'hôpital
export const allSecretaries = async (req, res) => {
  try {
    const hospitalId = req.user?.hospitalId;

    if (hospitalId) {
      // Si c'est un admin d'hôpital, récupérer seulement ses secrétaires
      const query = `
        SELECT 
          SECRETARY_ID, EMAIL, NAME, PHONE, ADDRESS, IMAGE, STATUS, CREATED_AT, EXPERIENCE, ABOUT, HOSPITAL_ID
        FROM 
          MEDICAL_DB.MEDICAL_SCHEMA.SECRETARIES
        WHERE
          HOSPITAL_ID = ?;
      `;

      const secretaries = await executeQuery(query, [hospitalId]);

      res.status(200).json({
        success: true,
        message: "Secretaries retrieved successfully",
        data: secretaries,
      });
    } else {
      // Si c'est le super admin, récupérer tous les secrétaires
      const secretaries = await getSecretariesWithoutPassword();
      res.status(200).json({
        success: true,
        message: "All secretaries retrieved successfully",
        data: secretaries,
      });
    }
  } catch (error) {
    console.error("Error retrieving secretaries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve secretaries",
      error: error.message,
    });
  }
};

// Suppression d'un secrétaire
export const deleteSecretaryAdmin = async (req, res) => {
  try {
    const { secretaryId } = req.params;
    const hospitalId = req.user?.hospitalId;

    if (!secretaryId) {
      return res.status(400).json({
        success: false,
        message: "SECRETARY_ID is required to delete a secretary.",
      });
    }

    if (hospitalId) {
      // Vérifier que le secrétaire appartient bien à cet hôpital
      const checkQuery = `
        SELECT COUNT(*) AS count 
        FROM MEDICAL_DB.MEDICAL_SCHEMA.SECRETARIES 
        WHERE SECRETARY_ID = ? AND HOSPITAL_ID = ?
      `;
      const checkResult = await executeQuery(checkQuery, [
        secretaryId,
        hospitalId,
      ]);

      if (checkResult[0].COUNT === 0) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this secretary",
        });
      }
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

// Liste des managers de l'hôpital
export const allManagers = async (req, res) => {
  try {
    const hospitalId = req.user?.hospitalId;

    if (hospitalId) {
      // Si c'est un admin d'hôpital, récupérer seulement ses managers
      const query = `
        SELECT 
          MANAGER_ID, EMAIL, NAME, PHONE, ADDRESS, DEPARTMENT, IMAGE, STATUS, CREATED_AT, EXPERIENCE, ABOUT, HOSPITAL_ID
        FROM 
          MEDICAL_DB.MEDICAL_SCHEMA.MANAGERS
        WHERE
          HOSPITAL_ID = ?;
      `;

      const managers = await executeQuery(query, [hospitalId]);

      res.status(200).json({
        success: true,
        message: "Managers retrieved successfully",
        data: managers,
      });
    } else {
      // Si c'est le super admin, récupérer tous les managers
      const managers = await getManagersWithoutPassword();
      res.status(200).json({
        success: true,
        message: "All managers retrieved successfully",
        data: managers,
      });
    }
  } catch (error) {
    console.error("Error retrieving managers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve managers",
      error: error.message,
    });
  }
};

// Suppression d'un manager
export const deleteManagerAdmin = async (req, res) => {
  try {
    const { managerId } = req.params;
    const hospitalId = req.user?.hospitalId;

    if (!managerId) {
      return res.status(400).json({
        success: false,
        message: "MANAGER_ID is required to delete a manager.",
      });
    }

    if (hospitalId) {
      // Vérifier que le manager appartient bien à cet hôpital
      const checkQuery = `
        SELECT COUNT(*) AS count 
        FROM MEDICAL_DB.MEDICAL_SCHEMA.MANAGERS 
        WHERE MANAGER_ID = ? AND HOSPITAL_ID = ?
      `;
      const checkResult = await executeQuery(checkQuery, [
        managerId,
        hospitalId,
      ]);

      if (checkResult[0].COUNT === 0) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this manager",
        });
      }
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
