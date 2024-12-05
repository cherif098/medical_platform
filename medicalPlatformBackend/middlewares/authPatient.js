import jwt from "jsonwebtoken";
const authPatient = async (req, res, next) => {
  try {
    const { token } = req.headers;
    console.log("Token received in middleware 1:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing. Please log in again.",
      });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", token_decode);

    // Vérifiez si "id" est bien présent dans le token décodé
    if (!token_decode || !token_decode.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure. Please log in again.",
      });
    }

    // Placez le PATIENT_ID dans req.user
    req.user = { PATIENT_ID: token_decode.id };
    console.log("Extracted PATIENT_ID:", req.user.PATIENT_ID);

    next();
  } catch (error) {
    console.error("JWT Verification error:", error.message);
    res.status(401).json({
      success: false,
      message: error.message || "Token validation failed.",
    });
  }
};

export default authPatient;
