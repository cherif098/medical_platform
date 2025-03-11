import express from "express";
import multer from "multer";
import {
  nurseLogin,
  nurseProfile,
  updateNurseProfileController,
  getPatientsByHospital,
  getNurseNote, createNurseNote, modifyNurseNote, transcribeNurseNote,
  deleteNurseNote,  nurseLogout 
} from "../controllers/nurseController.js";
import authNurse from "../middlewares/authNurse.js";
const upload = multer({ dest: "uploads/" });

const nurseRouter = express.Router();
nurseRouter.post("/login", nurseLogin);
nurseRouter.post("/logout", authNurse, nurseLogout);
nurseRouter.get("/profile", authNurse, nurseProfile);
nurseRouter.post("/update-profile", authNurse, updateNurseProfileController);
nurseRouter.get("/patients", authNurse, getPatientsByHospital);
nurseRouter.get("/nurse-note/:reportId", authNurse, getNurseNote);
nurseRouter.post("/nurse-note", authNurse, createNurseNote);
nurseRouter.put("/update-note/:reportId", authNurse, modifyNurseNote);
nurseRouter.post("/speech/transcribe", upload.single("file"), transcribeNurseNote);
nurseRouter.delete('/delete-note/:reportId', authNurse, deleteNurseNote);






export default nurseRouter;
