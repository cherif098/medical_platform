import jwt from "jsonwebtoken";

// Super admin authentification middelware
const authSuperAdmin = async (req, res, next) => {
  try {
      // Récupérer le token dans l'en-tête Authorization
      const authHeader = req.headers.authorization;
      console.log("Authorization header:", authHeader);

      // Vérifier si le token est présent et correctement formaté
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({
              success: false,
              message: "Token is missing. Please log in again.",
          });
      }

      // Extraire le token après "Bearer "
      const satoken = authHeader.split(" ")[1];
      console.log("Extracted Token:", satoken);

      // Vérification et décodage du token
      const decoded = jwt.verify(satoken, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);

      const { role, email } = decoded;

      // Vérifier que l'email et le rôle correspondent bien au Super Admin
      if (email !== process.env.SUPER_ADMIN_EMAIL || role !== "admin") {
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