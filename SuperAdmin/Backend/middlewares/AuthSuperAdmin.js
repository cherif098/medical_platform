import jwt from "jsonwebtoken";

// Super admin authentification middleware
const authSuperAdmin = async (req, res, next) => {
  try {
    // Récupérer le token dans l'en-tête
    const saToken = req.headers.satoken;
    console.log("Token reçu:", saToken);

    // Vérifier si le token est présent
    if (!saToken) {
      return res.status(401).json({
        success: false,
        message: "Token is missing. Please log in again.",
      });
    }

    // Vérification et décodage du token
    const decoded = jwt.verify(saToken, process.env.JWT_SECRET);
    console.log("Token décodé:", decoded);

    const { role, email } = decoded;

    // Vérifier que l'email et le rôle correspondent bien au Super Admin
    if (email !== process.env.SUPER_ADMIN_EMAIL || role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Not Authorized. Invalid role or email.",
      });
    }

    // Continuer l'exécution de la requête
    next();
  } catch (error) {
    console.error("JWT Verification error:", error.message);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export default authSuperAdmin;