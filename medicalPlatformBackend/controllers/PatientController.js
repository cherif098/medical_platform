import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { insertPatient, loginPatient, findPatientByEmail } from "../models/patientModel.js"; // Importe la fonction insertPatient

// API to register user
export const registerPatient = async (req, res) => {
  try {
    const { NAME, EMAIL, PASSWORD, DATE_OF_BIRTH} = req.body;

    // Vérification des champs requis
    if (!NAME || !EMAIL || !PASSWORD || !DATE_OF_BIRTH ) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // Validation de l'email
    if (!validator.isEmail(EMAIL)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Validation du mot de passe
    if (PASSWORD.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // Vérifier si l'email existe déjà
    const existingPatient = await findPatientByEmail(EMAIL); // Utilisez une fonction appropriée pour interroger la base de données
    if (existingPatient) {
      return res.status(409).json({ message: "Email already in used" });
    }

    // Hashage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(PASSWORD, salt);

    // Création des données du patient
    const patientData = {
      NAME,
      EMAIL,
      PASSWORD: hashedPassword,
      DATE_OF_BIRTH,
    };

    // Insertion du patient dans la base de donne
    await insertPatient(patientData); // Utilisation de la fonction insertPatient

    // Création du token JWT
    const token = jwt.sign(
      { id: patientData.PATIENT_ID },
      process.env.JWT_SECRET
    );

    // Envoi de la réponse avec le message de succès et le token
    res.status(201).json({
      message: "Patient registered successfully",
      success: true,
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API for patient login

export const loginPatientController = async (req, res) => {
    try {
      const { EMAIL, PASSWORD } = req.body;
  
      // Vérification des champs requis
      if (!EMAIL || !PASSWORD) {
        return res.status(400).json({ success: false, message: 'Please provide both email and password' });
      }
  
      // Appel à la fonction loginPatient du modèle
      const patient = await loginPatient(EMAIL, PASSWORD);

      if (!patient) {
        return res.status(404).json({ success: false, message: 'User does not exist' });
      }
  
      // Vérification du mot de passe
      const isMatch = await bcrypt.compare(PASSWORD, patient.PASSWORD);
      if (isMatch) {
        const token = jwt.sign({ id: patient.PATIENT_ID }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ success: true, token });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid password' });
      }
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
