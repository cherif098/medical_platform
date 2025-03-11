import express from "express";
import {
  doctorList,
  doctorLogin,
  getDoctorAppointments,
  cancelAppointment,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile, doctorLogout
} from "../controllers/doctorControllers.js";
import authDoctor from "../middlewares/authDoctor.js";
import { completeAppointment } from "../controllers/doctorControllers.js";

const doctorRouter = express.Router();

doctorRouter.get("/list", doctorList);
doctorRouter.post("/login", doctorLogin);
doctorRouter.post("/logout", authDoctor, doctorLogout);
doctorRouter.get("/appointments", authDoctor, getDoctorAppointments);
doctorRouter.post("/complete-appointment", authDoctor, completeAppointment);
doctorRouter.delete("/cancel/:appointmentId", authDoctor, cancelAppointment);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.get('/profile',authDoctor,doctorProfile);
doctorRouter.post('/update-profile',authDoctor,updateDoctorProfile)

export default doctorRouter;
