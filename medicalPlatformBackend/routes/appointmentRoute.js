import {
  getAvailableSlots,
  bookAppointment,
  cancelAppointment,
  getPatientAppointments,
} from "../controllers/AppointmentController.js";
import express from "express";
import authPatient from "../middlewares/authPatient.js";

const router = express.Router();

// Public routes
router.get("/slots/:doctor_id", getAvailableSlots);

// Protected routes
router.use(authPatient); // Apply authentication middleware to all routes

// Appointment management routes
router.get("/patient-appointments", getPatientAppointments);
router.post("/book", bookAppointment);
router.delete("/cancel/:appointmentId", cancelAppointment); //  DELETE method for  RESTful practice

export default router;
