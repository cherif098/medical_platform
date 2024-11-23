import {
  getAvailableSlots,
  bookAppointment,
  cancelAppointment
} from "../controllers/appointmentController.js"
import express from "express";

const router = express.Router();

router.get("/slots/:doctor_id", getAvailableSlots);
router.post("/book", bookAppointment);
router.post("/cancel", cancelAppointment);
export default router;
