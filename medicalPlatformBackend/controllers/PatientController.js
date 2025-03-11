import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  insertPatient,
  loginPatient,
  findPatientByEmail,
  getPatientById,
  updatePatientData,
  updatePatientImage,
} from "../models/patientModel.js";
import { v2 as cloudinary } from "cloudinary";
import { executeQuery } from "../config/snowflake.js";

// API to register user
export const registerPatient = async (req, res) => {
  try {
    const { NAME, EMAIL, PASSWORD, PHONE, ADRESSE, GENDER, DATE_OF_BIRTH } =
      req.body;
    const imageFile = req.file;
    const IMAGE = imageFile ? imageFile.path : null;

    // Check required fields
    if (
      !NAME ||
      !EMAIL ||
      !PASSWORD ||
      !PHONE ||
      !ADRESSE ||
      !GENDER ||
      !DATE_OF_BIRTH ||
      !imageFile
    ) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // Check if email already exists
    const existingPatient = await findPatientByEmail(EMAIL);
    if (existingPatient) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(PASSWORD, salt);

    // Upload image to Cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    // Create patient data
    const patientData = {
      NAME,
      EMAIL,
      PASSWORD: hashedPassword,
      PHONE,
      ADRESSE,
      GENDER,
      DATE_OF_BIRTH,
      IMAGE: imageUrl,
      // HOSPITAL_ID removed to avoid undefined value error
    };

    // Insert patient
    await insertPatient(patientData);

    // Response: success without token generation (redirects to login in front-end)
    res.status(201).json({
      message: "Patient registered successfully",
      success: true,
      redirectToLogin: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API for patient login
export const loginPatientController = async (req, res) => {
  try {
    const { EMAIL, PASSWORD } = req.body;

    // Check required fields
    if (!EMAIL || !PASSWORD) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password",
      });
    }

    // Call loginPatient function from model
    const patient = await loginPatient(EMAIL, PASSWORD);

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(PASSWORD, patient.PASSWORD);
    if (isMatch) {
      const token = jwt.sign(
        { id: patient.PATIENT_ID },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      return res.status(200).json({ success: true, token });
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get patient data
export const getProfile = async (req, res) => {
  try {
    const { PATIENT_ID } = req.user;
    const patientData = await getPatientById(PATIENT_ID);
    console.log("Patient ID received in getProfile:", PATIENT_ID);
    console.log(patientData);

    res.json({ success: true, data: patientData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to update patient data
export const updatePatient = async (req, res) => {
  try {
    const { EMAIL, NAME, DATE_OF_BIRTH, PHONE, ADRESSE, GENDER } = req.body;
    const IMAGE = req.file;
    const PATIENT_ID = req.user.PATIENT_ID;

    console.log("Received patient data:", req.body);
    console.log("Patient ID from middleware:", PATIENT_ID);

    if (!PATIENT_ID) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is missing. Please log in again.",
      });
    }

    // Validate required fields
    if (!EMAIL || !NAME || !DATE_OF_BIRTH || !PHONE || !ADRESSE || !GENDER) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // Validate email
    if (!validator.isEmail(EMAIL)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format." });
    }

    // Update patient data
    await updatePatientData(
      PATIENT_ID,
      EMAIL,
      NAME,
      DATE_OF_BIRTH,
      PHONE,
      ADRESSE,
      GENDER
    );

    // If an image was sent, upload it and update the patient's image
    if (IMAGE) {
      const imageUpload = await cloudinary.uploader.upload(IMAGE.path, {
        resource_type: "image",
      });
      const imageUrl = imageUpload.secure_url;

      await updatePatientImage(PATIENT_ID, imageUrl);
    }

    res.json({ success: true, message: "Patient updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Function to retrieve a patient's appointments
export const listAppointment = async (req, res) => {
  try {
    const patientId = req.user.PATIENT_ID;

    // SQL query to retrieve appointments with doctor information
    const query = `
      SELECT 
        A.APPOINTMENT_ID,
        A.DOCTOR_ID,
        A.SLOT_DATE,
        A.SLOT_TIME,
        A.FEES,
        A.STATUS,
        D.NAME as DOCTOR_NAME,
        D.SPECIALTY,
        D.IMAGE as DOCTOR_IMAGE,
        D.ADRESS_1,
        D.ADRESS_2,
        D.DEGREE
      FROM MEDICAL_DB.MEDICAL_SCHEMA.APPOINTMENTS A
      JOIN MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS D ON A.DOCTOR_ID = D.DOCTOR_ID
      WHERE A.USER_ID = ?
      ORDER BY A.SLOT_DATE DESC, A.SLOT_TIME DESC
    `;

    // Execute the query
    const appointments = await executeQuery(query, [patientId]);

    // If no appointments found
    if (!appointments || appointments.length === 0) {
      return res.json({
        success: true,
        message: "No appointments found",
        appointments: [],
      });
    }

    // Format dates and times for display
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
