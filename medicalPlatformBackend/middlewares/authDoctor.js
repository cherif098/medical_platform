import jwt from "jsonwebtoken";

const authDoctor = async (req, res, next) => {
  try {
    const dToken = req.headers["dtoken"] || req.headers["dToken"];
    //console.log("Middleware authDoctor exécuté pour :", req.originalUrl);
    //console.log("Headers reçus :", req.headers);
    //console.log("Token extrait :", req.headers["dtoken"]);


    if (!dToken) {
      return res.status(401).json({
        success: false,
        message: "Token is missing. Please log in again.",
      });
    }

    const token_decode = jwt.verify(dToken, process.env.JWT_SECRET);
    //console.log("Decoded token:", token_decode);

    // Vérifiez si "id" est bien présent dans le token décodé
    if (!token_decode || !token_decode.doctorId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure. Please log in again.",
      });
    }

    // Placez le PATIENT_ID dans req.user
    req.user = { DOCTOR_ID: token_decode.doctorId ,  type: 'DOCTOR'};
    //console.log("Extracted PATIENT_ID:", req.user.DOCTOR_ID);

    next();
  } catch (error) {
    console.error("JWT Verification error:", error.message);
    res.status(401).json({
      success: false,
      message: error.message || "Token validation failed.",
    });
  }
};

export default authDoctor;