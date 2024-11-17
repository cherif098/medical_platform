import { insertDoctor } from "../models/doctorModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { executeQuery } from "../config/snowflake.js";
import jwt from "jsonwebtoken";
import { getDoctorsWithoutPassword } from "../models/doctorModel.js";

// Fonction pour vérifier si un champ existe déjà dans la base de données
const checkIfExists = async (field, value) => {
  const query = `SELECT COUNT(*) AS count FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS WHERE ${field} = ?`;
  const result = await executeQuery(query, [value]);
  return result[0].COUNT > 0; // Retourne true si l'élément existe déjà
};

// Fonction pour ajouter un docteur dans la base de données
const addDoctor = async (req, res) => {
  try {
    // Récupération des données depuis le corps de la requête
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

    // Vérification des champs obligatoires
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

    // Vérification de l'existence du numéro de licence et de l'email
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
const loginAdmin = async (req, res) => {
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

const allDoctors = async (req, res) => {
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

export { addDoctor, loginAdmin, allDoctors };
