import {
  getAvailableSlots,
  bookAppointment,
} from "../controllers/AppointmentController.js";
import express from "express";
const router = express.Router();

router.get("/slots/:doctor_id", getAvailableSlots);
router.post("/book", bookAppointment);

export default router;
