import express from "express";
import {
  doctorList,
  doctorLogin,
  getDoctorAppointments,
  cancelAppointment,
  doctorDashboard,
} from "../controllers/doctorControllers.js";
import authDoctor from "../middlewares/authDoctor.js";
import { completeAppointment } from "../controllers/doctorControllers.js";

const doctorRouter = express.Router();

doctorRouter.get("/list", doctorList);
doctorRouter.post("/login", doctorLogin);
doctorRouter.get("/appointments", authDoctor, getDoctorAppointments);
doctorRouter.post("/complete-appointment", authDoctor, completeAppointment);
doctorRouter.delete("/cancel/:appointmentId", authDoctor, cancelAppointment);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);

export default doctorRouter;
