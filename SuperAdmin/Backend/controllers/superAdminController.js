import jwt from "jsonwebtoken";
import {
  createHospital,
  checkHospitalExists,
  getAllHospitals,
  getHospitalById,
  deleteHospital,
  updateHospital,
} from "../models/HospitalModel.js";

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
    const id = req.params.ID;
    const hospitalData = req.body;

    const result = await updateHospital(id, hospitalData);

    res.status(200).json({
      success: true,
      message: "Hospital updated successfully",
      result,
    });
  } catch (error) {
    console.error("Error updating hospital:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update hospital",
      error: error.message,
    });
  }
};