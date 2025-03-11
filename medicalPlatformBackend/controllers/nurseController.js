import {
  getAllNurses,
  getNurseByEmail,
  getNurseById,
  updateNurseProfile,
  getHospitalIdByNurseId,
  getPatientsByHospitalId,
  getNurseNoteByReportId, addNurseNote, updateNurseNote,
  deleteNurseNoteFromDB, checkNurseNoteExists,
  updateNurseOnlineStatus,
} from "../models/nurseModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { transcribeAudio } from "../services/speechToText.js";
import fs from "fs";
// Login pour infirmier
export const nurseLogin = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { EMAIL, PASSWORD } = req.body;
    if (!EMAIL || !PASSWORD) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    const nurse = await getNurseByEmail(EMAIL);
    
    if (!nurse) {
      console.log("Infirmier non trouvé !");
      return res.status(404).json({
        success: false,
        message: "Nurse not found",
      });
    }

    console.log("Vérification du mot de passe...");
    const isPasswordValid = await bcrypt.compare(PASSWORD, nurse.PASSWORD);
    
    if (!isPasswordValid) {
      console.log("Mot de passe invalide !");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log(`Connexion réussie pour l'infirmier ${nurse.NURSE_ID}, mise à jour IS_ONLINE...`);
    await updateNurseOnlineStatus(nurse.NURSE_ID, true);
    console.log("Statut IS_ONLINE mis à jour!");
      io.emit("userStatusUpdate", { 
        userId: nurse.NURSE_ID, 
        userType: "NURSE", 
        isOnline: true 
      });

    const token = jwt.sign(
      { nurseId: nurse.NURSE_ID, email: EMAIL },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Erreur dans nurseLogin:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



// Déconnexion 
export const nurseLogout = async (req, res) => {
  try {
    const { nurseId } = req.user; 
    if (!nurseId) {
      return res.status(400).json({ success: false, message: "Nurse ID is missing." });
    }

    console.log(`Déconnexion de l'infirmier ${nurseId}, mise à jour IS_ONLINE en FALSE...`);
    await updateNurseOnlineStatus(nurseId, false);

    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Erreur lors du logout infirmier:", error);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};



// profil de l'infirmier
export const nurseProfile = async (req, res) => {
  const nurseId = req.user?.nurseId;

  if (!nurseId) {
    return res.status(400).json({
      success: false,
      message: "NURSE_ID is missing in the request.",
    });
  }

  try {
    const nurse = await getNurseById(nurseId);
    if (!nurse) {
      return res.status(404).json({
        success: false,
        message: "Nurse not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: nurse,
    });
  } catch (error) {
    console.error("Error fetching nurse profile:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch nurse profile.",
    });
  }
};

// Mettre à jour le profil de l'infirmier
export const updateNurseProfileController = async (req, res) => {
  const { nurseId } = req.user;
  const updatedData = req.body;

  console.log("Données reçues par l'API :", updatedData);

  try {
    const result = await updateNurseProfile(nurseId, updatedData);
    res.status(200).json({
      success: true,
      message: "Nurse profile updated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error updating nurse profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Unable to update nurse profile.",
    });
  }
};


// Récupérer les patients dans l'hôpital 
export const getPatientsByHospital = async (req, res) => {
  try {
    const { nurseId } = req.user;
    const hospitalId = await getHospitalIdByNurseId(nurseId);

    if (!hospitalId) {
      return res.status(404).json({
        success: false,
        message: "Infirmier ou hôpital non trouvé.",
      });
    }
    const patients = await getPatientsByHospitalId(hospitalId);

    res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des patients :", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des patients.",
    });
  }
};


// Récupérer la note associée à un rapport
export const getNurseNote = async (req, res) => {
  try {
    const { reportId } = req.params;
    console.log(`Fetching note for report ID: ${reportId}`);

    const note = await getNurseNoteByReportId(reportId);

    if (!note) {
      return res.status(200).json({ message: "No note found", note: null });
    }

    res.status(200).json(note);
  } catch (error) {
    console.error("Error fetching nurse note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Ajouter une nouvelle note
export const createNurseNote = async (req, res) => {
  try {
    const { reportId, noteText } = req.body;
    const { nurseId } = req.user;

    console.log(`Adding note for report ID: ${reportId} by nurse ID: ${nurseId}`);

    const existingNote = await getNurseNoteByReportId(reportId);
    if (existingNote) {
      return res.status(400).json({ error: "A note already exists for this report." });
    }

    await addNurseNote(nurseId, reportId, noteText);
    res.status(201).json({ message: "Note added successfully" });
  } catch (error) {
    console.error("Error adding nurse note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// modifier une note
export const modifyNurseNote = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { noteText } = req.body;
    const { nurseId } = req.user;

    console.log("Received data:", { reportId, noteText, nurseId });

    if (!noteText || !nurseId || !reportId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updated = await updateNurseNote(nurseId, reportId, noteText);

    if (updated) {
      return res.status(200).json({ message: "Note updated successfully!" });
    } else {
      return res.status(404).json({ error: "Note not found or not updated" });
    }
  } catch (error) {
    console.error("Error updating nurse note:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};



// transcription
export const transcribeNurseNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const transcript = await transcribeAudio(filePath);
    fs.unlinkSync(filePath);

    res.json({ transcript });
  } catch (error) {
    console.error("Error processing speech:", error);
    res.status(500).json({ error: "Error processing speech" });
  }
};

export const deleteNurseNote = async (req, res) => {
  try {
      const { nurseId } = req.user;
      const { reportId } = req.params;
      const existingNote = await checkNurseNoteExists(reportId);
      if (!existingNote) {
          return res.status(404).json({ message: "No nurse note found for this report." });
      }
      await deleteNurseNoteFromDB(reportId);

      res.status(200).json({ message: "Nurse note deleted successfully." });
  } catch (error) {
      console.error("Error deleting nurse note:", error);
      res.status(500).json({ message: "Failed to delete nurse note." });
  }
};






