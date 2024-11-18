import express from 'express';
import {registerPatient,loginPatientController} from '../controllers/PatientController.js';

const patientRouter = express.Router();

patientRouter.post('/register', registerPatient);
patientRouter.post('/login', loginPatientController);




export default patientRouter;
