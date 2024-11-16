import { insertDoctor } from "../models/doctorModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { executeQuery } from "../config/snowflake.js";
import jwt from "jsonwebtoken";

// Fonction pour vérifier si un champ existe déjà dans la base de données
const checkIfExists = async (field, value) => {
  const query = `SELECT COUNT(*) AS count FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS WHERE ${field} = ?`;
  const result = await executeQuery(query, [value]);
  return result[0].COUNT > 0;
};

const addDoctor = async (req, res) => {
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
      CREATED_AT,
      CREATED_BY,
    } = req.body;

    // Logger les données reçues pour le débogage
    console.log("Received data:", {
      ...req.body,
      PASSWORD: "***", // Masquer le mot de passe dans les logs
    });
    console.log("Received file:", req.file);

    // Vérification détaillée des champs manquants
    const missingFields = [];
    if (!DOCTOR_LICENCE) missingFields.push("DOCTOR_LICENCE");
    if (!EMAIL) missingFields.push("EMAIL");
    if (!PASSWORD) missingFields.push("PASSWORD");
    if (!NAME) missingFields.push("NAME");
    if (!SPECIALTY) missingFields.push("SPECIALTY");
    if (!STATUS) missingFields.push("STATUS");
    if (!CREATED_AT) missingFields.push("CREATED_AT");
    if (!CREATED_BY) missingFields.push("CREATED_BY");
    if (!EXPERIENCE) missingFields.push("EXPERIENCE");
    if (!ABOUT) missingFields.push("ABOUT");
    if (!DEGREE) missingFields.push("DEGREE");
    if (!ADRESS_1) missingFields.push("ADRESS_1");
    if (!ADRESS_2) missingFields.push("ADRESS_2");
    if (!req.file) missingFields.push("image");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        missingFields,
        receivedFields: Object.keys(req.body),
      });
    }

    // Vérification de l'existence de la licence ou de l'email
    const [licenceExists, emailExists] = await Promise.all([
      checkIfExists("DOCTOR_LICENCE", DOCTOR_LICENCE),
      checkIfExists("EMAIL", EMAIL),
    ]);

    if (licenceExists) {
      return res.status(400).json({
        success: false,
        message: `Doctor Licence ${DOCTOR_LICENCE} already exists.`,
      });
    }

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: `Email ${EMAIL} already exists.`,
      });
    }

    // Validation du format de l'email
    if (!validator.isEmail(EMAIL)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Validation du mot de passe
    if (
      !validator.isStrongPassword(PASSWORD, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
      })
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must have at least: 8 characters, 1 lowercase, 1 uppercase",
      });
    }

    // Convertir et valider EXPERIENCE
    const experienceNum = parseInt(EXPERIENCE);
    if (isNaN(experienceNum) || experienceNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Experience must be a positive integer.",
        received: EXPERIENCE,
      });
    }

    // Validation des FEES si présents
    if (FEES && (isNaN(parseFloat(FEES)) || parseFloat(FEES) < 0)) {
      return res.status(400).json({
        success: false,
        message: "Fees must be a positive number",
      });
    }

    // Validation de DEGREE
    if (!DEGREE || DEGREE.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Degree is required",
      });
    }

    // Validation des adresses
    if (!ADRESS_1 || ADRESS_1.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Address 1 is required",
      });
    }

    // Hashage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(PASSWORD, salt);

    // Upload de l'image vers Cloudinary
    let imageUrl;
    try {
      const imageUpload = await cloudinary.uploader.upload(req.file.path, {
        folder: "doctors",
        resource_type: "image",
      });
      imageUrl = imageUpload.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload image",
      });
    }

    // Préparation des données pour l'insertion
    const doctorData = {
      DOCTOR_LICENCE,
      EMAIL,
      PASSWORD: hashedPassword,
      NAME,
      SPECIALTY,
      IS_PASSWORD_TEMPORARY: IS_PASSWORD_TEMPORARY === "true",
      STATUS: STATUS === "true",
      FEES: FEES ? parseFloat(FEES) : null,
      ADRESS_1,
      ADRESS_2,
      DEGREE,
      EXPERIENCE: experienceNum,
      ABOUT,
      CREATED_AT,
      CREATED_BY,
      IMAGE: imageUrl,
    };

    // Insertion du docteur dans la base de données
    await insertDoctor(doctorData);

    res.status(201).json({
      success: true,
      message: "Doctor added successfully",
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to add doctor",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
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
      const token = jwt.sign({ email: EMAIL }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

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

export { addDoctor, loginAdmin };
