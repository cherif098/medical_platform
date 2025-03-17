import jwt from "jsonwebtoken";

const authNurse = async (req, res, next) => {
  try {
    const nToken = req.headers["ntoken"] || req.headers["nToken"];
    console.log("Token reçu :", nToken);

    if (!nToken) {
      return res.status(401).json({
        success: false,
        message: "Token is missing. Please log in again.",
      });
    }

    try {
      const token_decode = jwt.verify(nToken, process.env.JWT_SECRET);
      req.user = { nurseId: token_decode.nurseId, type: "NURSE" };
      console.log("Utilisateur extrait :", req.user);
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        console.warn("Token expiré, mais on autorise la déconnexion.");
        const token_decode = jwt.decode(nToken); // Décoder sans vérifier l'expiration
        if (token_decode && token_decode.nurseId) {
          req.user = { nurseId: token_decode.nurseId, type: "NURSE" };
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

export default authNurse;
