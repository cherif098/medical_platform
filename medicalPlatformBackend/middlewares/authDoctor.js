import jwt from "jsonwebtoken";

const authDoctor = async (req, res, next) => {
  try {
    const dToken = req.headers["dtoken"] || req.headers["dToken"];
    console.log("Token reçu :", dToken);

    if (!dToken) {
      return res.status(401).json({
        success: false,
        message: "Token is missing. Please log in again.",
      });
    }

    try {
      const token_decode = jwt.verify(dToken, process.env.JWT_SECRET);
      req.user = { DOCTOR_ID: token_decode.doctorId, type: "DOCTOR" };
      console.log("Utilisateur extrait :", req.user);
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.warn("Token expiré, mais on autorise la déconnexion.");
        const token_decode = jwt.decode(dToken); // Décodage sans vérifier l'expiration
        if (token_decode && token_decode.doctorId) {
          req.user = { DOCTOR_ID: token_decode.doctorId, type: "DOCTOR" };
          next(); // Autoriser la requête
        } else {
          return res.status(401).json({
            success: false,
            message: "Invalid token structure. Please log in again.",
          });
        }
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("JWT Verification error:", error.message);
    res.status(401).json({
      success: false,
      message: error.message || "Token validation failed.",
    });
  }
};

export default authDoctor;
