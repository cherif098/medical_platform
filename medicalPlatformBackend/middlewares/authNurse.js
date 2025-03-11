// middlewares/authNurse.js
import jwt from "jsonwebtoken";

const authNurse = async (req, res, next) => {
  try {
    const nToken = req.headers["ntoken"] || req.headers["nToken"];

    if (!nToken) {
      return res.status(401).json({
        success: false,
        message: "Token is missing. Please log in again.",
      });
    }

    const token_decode = jwt.verify(nToken, process.env.JWT_SECRET);
   // console.log("Decoded token:", token_decode);

    if (!token_decode || !token_decode.nurseId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure. Please log in again.",
      });
    }

    req.user = { nurseId: token_decode.nurseId ,  type: 'NURSE'};
    //console.log("Extracted NURSE_ID:", req.user.nurseId);

    next();
  } catch (error) {
    console.error("JWT Verification error:", error.message);
    res.status(401).json({
      success: false,
      message: error.message || "Token validation failed.",
    });
  }
};

export default authNurse;
