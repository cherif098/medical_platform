import express from "express";
import { loginSuperAdmin, addHospital, getHospitals, getHospital, removeHospital, updateHospitalById, updateHospitalStatusController } from "../controllers/superAdminController.js";
import authSuperAdmin from "../middlewares/AuthSuperAdmin.js";

const superAdminRouter = express.Router();

superAdminRouter.post("/login", loginSuperAdmin);
superAdminRouter.post("/add-hospital", authSuperAdmin,addHospital);
superAdminRouter.get("/get-hospitals", authSuperAdmin, getHospitals);
superAdminRouter.get("/get-hospital/:ID", authSuperAdmin, getHospital);
superAdminRouter.delete("/remove-hospital/:ID", authSuperAdmin, removeHospital);
superAdminRouter.put("/update-hospital/:ID", authSuperAdmin, updateHospitalById);
superAdminRouter.put("/update-hospital-status/:ID", authSuperAdmin, updateHospitalStatusController);

export default superAdminRouter;