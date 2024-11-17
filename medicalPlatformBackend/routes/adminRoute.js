import express from "express";
import {
  addDoctor,
  allDoctors,
  loginAdmin,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorControllers.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", upload.single("IMAGE"), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-doctors", allDoctors);
adminRouter.post("/change-availability", changeAvailability);

export default adminRouter;
