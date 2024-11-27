import express from 'express';
import { doctorList, doctorLogin, getDoctorAppointments } from '../controllers/doctorControllers.js';
import authDoctor from '../middlewares/authDoctor.js';

const doctorRouter = express.Router()

doctorRouter.get('/list',doctorList)
doctorRouter.post('/login', doctorLogin)
doctorRouter.get('/appointments', authDoctor, getDoctorAppointments)

export default doctorRouter;