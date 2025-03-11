import jwt from "jsonwebtoken";
import { executeQuery } from "../config/snowflake.js";

// Middleware d'authentification admin
const authAdmin = async (req, res, next) => {
  try {
    const { aToken } = req.headers;

    if (!aToken) {
      return res.status(401).json({
        success: false,
        message: "Token is missing. Please log in again.",
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(aToken, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Cas 1: Super Admin (utilisant les variables d'environnement)
    if (
      decoded.role === "superadmin" &&
      decoded.email === process.env.ADMIN_EMAIL
    ) {
      req.user = {
        isSuperAdmin: true,
        email: decoded.email,
        role: decoded.role,
      };
      next();
      return;
    }

    // Cas 2: Admin d'hôpital
    if (decoded.role === "admin" && decoded.hospitalId) {
      // Vérifier si l'hôpital existe dans la base de données
      try {
        const query = `
          SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.HOSPITALS
          WHERE ID = ? AND EMAIL = ?
        `;
        const hospitals = await executeQuery(query, [
          decoded.hospitalId,
          decoded.email,
        ]);

        if (hospitals && hospitals.length > 0) {
          req.user = {
            hospitalId: decoded.hospitalId,
            email: decoded.email,
            role: decoded.role,
          };
          next();
          return;
        }
      } catch (dbError) {
        console.error("Database error in auth middleware:", dbError);
        // Si erreur de base de données, on continue vers l'erreur d'authentification
      }
    }

    // Si on arrive ici, c'est que le token est invalide ou non reconnu
    return res.status(401).json({
      success: false,
      message: "Not Authorized. Invalid token or credentials.",
    });
  } catch (error) {
    console.error("JWT Verification error:", error.message);
    res.status(401).json({
      success: false,
      message: error.message || "Token validation failed.",
    });
  }
};

export default authAdmin;
