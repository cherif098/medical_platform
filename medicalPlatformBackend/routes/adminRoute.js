import express from "express";
import {
  addDoctor,
  addNurse,
  deleteNurseAdmin,
  allNurses,
  allDoctors,
  loginAdmin,
  getAllAppointmentsAdmin,
  AppointmentCancel,
  AdminDashboard,
  deleteDoctorAdmin,
  addSecretary,
  allSecretaries,
  deleteSecretaryAdmin,
  addManager,
  allManagers,
  deleteManagerAdmin,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorControllers.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", upload.single("IMAGE"), addDoctor);
adminRouter.post("/add-nurse", upload.single("IMAGE"), addNurse);
adminRouter.get("/all-nurses", allNurses);
adminRouter.delete("/delete-nurse/:nurseId", deleteNurseAdmin);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-doctors", allDoctors);
adminRouter.post("/change-availability", changeAvailability);
adminRouter.post("/appointments", getAllAppointmentsAdmin);
adminRouter.delete("/cancel-appointment/:APPOINTMENT_ID", AppointmentCancel);
adminRouter.delete("/delete-doctor/:DOCTOR_ID", deleteDoctorAdmin);
adminRouter.get("/dashboard", AdminDashboard);
adminRouter.post("/add-secretary", upload.single("IMAGE"), addSecretary);
adminRouter.get("/all-secretaries", allSecretaries);
adminRouter.delete("/delete-secretary/:secretaryId", deleteSecretaryAdmin);
adminRouter.post("/add-manager", upload.single("IMAGE"), addManager);
adminRouter.get("/all-managers", allManagers);
adminRouter.delete("/delete-manager/:managerId", deleteManagerAdmin);
export default adminRouter;
