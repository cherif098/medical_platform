import express from "express";
import {
  addDoctor,
  allDoctors,
  loginAdmin,
  getAllAppointmentsAdmin,
  AppointmentCancel,
  AdminDashboard,
  deleteDoctorAdmin,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorControllers.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", upload.single("IMAGE"), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-doctors", allDoctors);
adminRouter.post("/change-availability", changeAvailability);
adminRouter.post("/appointments", getAllAppointmentsAdmin);
adminRouter.delete("/cancel-appointment/:APPOINTMENT_ID", AppointmentCancel);
adminRouter.delete("/delete-doctor/:DOCTOR_ID", deleteDoctorAdmin);
adminRouter.get("/dashboard", AdminDashboard);

export default adminRouter;
