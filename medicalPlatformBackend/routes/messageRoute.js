import express from "express";
import { 
  sendMessage,
  getConversation,
  getRecentChats,
  searchUsers,
  getSharedMedia, 
  getUnreadChatCount,
  getUserStatus, updateUserStatus
} from "../controllers/messageController.js";
import authDoctor from "../middlewares/authDoctor.js";
import authNurse from "../middlewares/authNurse.js";
import upload from "../middlewares/multer.js";


const router = express.Router();


const combinedAuth = async (req, res, next) => {
  try {
    if (req.headers.dtoken) {
      await new Promise((resolve, reject) => {
        authDoctor(req, res, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    } 
    
    if (req.headers.ntoken) {
      await new Promise((resolve, reject) => {
        authNurse(req, res, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    if (!req.user || (!req.user.DOCTOR_ID && !req.user.nurseId)) {
      return res.status(401).json({ error: "Non autorisé - Problème d'authentification" });
    }

    next();
  } catch (error) {
    res.status(401).json({ error: "Non autorisé - Erreur d'authentification" });
  }
};



router.post("/", combinedAuth, upload.single("file"), sendMessage);
router.get("/:otherUserId/:otherUserType", combinedAuth, getConversation);
router.get("/recent", combinedAuth, getRecentChats);
router.get("/search", combinedAuth, searchUsers);
router.get("/media/:otherUserId/:otherUserType", combinedAuth, getSharedMedia);
router.get("/unread-count", combinedAuth, getUnreadChatCount);
router.get("/status/:contact_id/:contact_type",combinedAuth, getUserStatus);
router.post("/status/update", combinedAuth, updateUserStatus);







export default router;