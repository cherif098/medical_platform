import express from 'express';
import {
    registerPatient,
    loginPatientController,
    getProfile, 
    updatePatient} 
    from '../controllers/PatientController.js';
import authPatient from '../middlewares/authPatient.js';
import upload from '../middlewares/multer.js';

const patientRouter = express.Router();

patientRouter.post('/register',upload.single('IMAGE'), registerPatient);
patientRouter.post('/login', loginPatientController);

patientRouter.get('/get-profile',authPatient, getProfile);

patientRouter.put('/update-profile',upload.single('IMAGE'), authPatient, updatePatient);




export default patientRouter;
