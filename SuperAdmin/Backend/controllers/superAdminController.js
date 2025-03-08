import jwt from "jsonwebtoken";
import {
  createHospital,
  checkHospitalExists,
  getAllHospitals,
  getHospitalById,
  deleteHospital,
  updateHospital,
  updateHospitalStatus,
} from "../models/hospitalModel.js";

export const loginSuperAdmin = (req, res) => {
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
      EMAIL === process.env.SUPER_ADMIN_EMAIL &&
      PASSWORD === process.env.SUPER_ADMIN_PASSWORD
    ) {
      // Création du token JWT
      const saToken = jwt.sign(
        { email: EMAIL, role: "super_admin" },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      console.log("Token généré:", saToken);

      res.status(200).json({
        success: true,
        message: "Login successful",
        saToken,
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

export const addHospital = async (req, res) => {
  try {
    const { NAME, EMAIL } = req.body;

    // Vérifier si un hôpital avec ce nom ou cet email existe déjà
    const hospitalExists = await checkHospitalExists(NAME, EMAIL);

    if (hospitalExists) {
      return res.status(400).json({
        success: false,
        message: "An hospital with this name or email already exists."
      });
    }

    // Créer le nouvel hôpital
    const hospital = await createHospital(req.body);
    
    res.status(201).json({ 
      success: true, 
      message: "Hospital added successfully", 
      hospital 
    });
  } catch (error) {
    console.error("Error adding hospital:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to add hospital", 
      error: error.message 
    });
  }
};

export const getHospitals = async (req, res) => {
  try {
    const hospitals = await getAllHospitals();
    res.status(200).json({ 
      success: true, 
      message: "Hospitals retrieved successfully",
      hospitals 
    });
  } catch (error) {
    console.error("Error retrieving hospitals:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch hospitals", 
      error: error.message 
    });
  }
};

export const getHospital = async (req, res) => {
  try {
    const id = req.params.ID;
    const hospital = await getHospitalById(id);
    
    if (!hospital) {
      return res.status(404).json({ 
        success: false, 
        message: "Hospital not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Hospital retrieved successfully",
      hospital 
    });
  } catch (error) {
    console.error("Error retrieving hospital:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch hospital", 
      error: error.message 
    });
  }
};

export const removeHospital = async (req, res) => {
  try {
    const id = req.params.ID;
    await deleteHospital(id);
    
    res.status(200).json({ 
      success: true, 
      message: "Hospital deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting hospital:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete hospital", 
      error: error.message 
    });
  }
};

export const updateHospitalById = async (req, res) => {
  try {
    const { ID } = req.params;
    
    const updateData = req.body;
    
    if (updateData.SUBSCRIPTION_STATUS && 
        !["Active", "Pending", "Expired", "Canceled"].includes(updateData.SUBSCRIPTION_STATUS)) {
      return res.status(400).json({
        success: false,
        message: "Statut d'abonnement invalide"
      });
    }
    
    const hospital = await getHospitalById(ID);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hôpital non trouvé"
      });
    }
    
    const updatedHospital = await updateHospital(ID, updateData);
    
    res.status(200).json({
      success: true,
      message: "Hôpital mis à jour avec succès",
      hospital: updatedHospital
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'hôpital:", error);
    res.status(500).json({
      success: false,
      message: "Échec de la mise à jour de l'hôpital",
      error: error.message
    });
  }
};

export const updateHospitalStatusController = async (req, res) => {
  try {
    const { ID } = req.params;
    const { status } = req.body;
    
    console.log("Requête de mise à jour de statut reçue:");
    console.log("ID:", ID);
    console.log("Corps de la requête:", req.body);
    
    // Vérifier que l'ID et le statut sont fournis
    if (!ID) {
      return res.status(400).json({
        success: false,
        message: "ID de l'hôpital est requis"
      });
    }
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Le statut d'abonnement est requis"
      });
    }
    
    try {
      // Appeler la fonction du modèle
      const updatedHospital = await updateHospitalStatus(ID, status);
      
      res.status(200).json({
        success: true,
        message: "Statut de l'hôpital mis à jour avec succès",
        hospital: updatedHospital
      });
    } catch (modelError) {
      console.error("Erreur du modèle:", modelError.message);
      // Déterminer le code de statut approprié en fonction du message d'erreur
      const statusCode = modelError.message.includes("non trouvé") ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        message: modelError.message
      });
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    res.status(500).json({
      success: false,
      message: "Échec de la mise à jour du statut",
      error: error.message
    });
  }
};