import jwt from "jsonwebtoken";

//admin authentification middelware
const authAdmin = async (req, res, next) => {
  try {
    const { aToken } = req.headers;
    console.log("Token received in middleware:", aToken);

    if (!aToken) {
      return res.json({
        succes: false,
        message: "Token is missing. Please log in again.",
      });
    }

    const { role, email } = jwt.verify(aToken, process.env.JWT_SECRET);
    console.log("Decoded token:", { role, email });

    if (email !== process.env.ADMIN_EMAIL || role !== "admin") {
      return res.json({
        succes: false,
        message: "Not Authorized. Invalid role or email.",
      });
    }
    next();
  } catch (error) {
    console.error("JWT Verification error:", error.message);
    res.json({
      succes: false,
      message: error.message || "Token validation failed.",
    });
  }
};

export default authAdmin;
