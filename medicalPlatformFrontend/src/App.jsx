import React from 'react'
import Home from './pages/Home'
import { Route, Router, Routes } from 'react-router-dom'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/Myappointments'
import About from './pages/About'
import Login from './pages/Login'
import Doctors from './pages/Doctors'
import Appointment from './pages/Appointment'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MedicalReports from './pages/MedicalReports'
import ReportDetails from './pages/ReportDetails'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer/>
      <Navbar/>
      <Routes>
        <Route  path="/" element={<Home />} />
        <Route  path="/doctors" element={< Doctors/>} />
        <Route  path="/doctors/:speciality" element={< Doctors/>} />
        <Route  path="/login" element={<Login />} />
        <Route  path="/about" element={< About/>} />
        <Route  path="/contact" element={< Contact/>} />
        <Route  path="/my-profile" element={< MyProfile/>} />
        <Route  path="/my-appointments" element={< MyAppointments/>} />
        <Route  path="/appointments/:docId" element={< Appointment/>} />
        <Route  path="/my-medicalReport" element={<MedicalReports />} />
        <Route  path="/report-details/:reportId" element={<ReportDetails />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
