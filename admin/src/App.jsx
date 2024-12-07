import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AdminContext } from "./context/AdminContext";
import { DoctorContext } from "./context/DoctorContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages Admin
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";

// Pages Doctor
import DoctorDashboard from "./pages/Doctors/DoctorDashboard";
import DoctorAppointments from "./pages/Doctors/DoctorAppointments";
import DoctorProfile from "./pages/Doctors/DoctorProfile";
import MedicalReports from "./pages/Doctors/MedicalReports";
import CreateReport from "./pages/Doctors/Reports/CreateReport";
import EditReport from "./pages/Doctors/Reports/EditReport";
import ViewReport from "./pages/Doctors/Reports/ViewReport";
import SubscriptionPlan from "./pages/Doctors/SubscriptionPlan";
import AIAssistant from "./pages/Doctors/AIAssistant";
import PaymentSuccess from "./pages/Doctors/PaymentSuccess";
import PaymentCancel from "./pages/Doctors/PaymentCancel";

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);

  return aToken || dToken ? (
    <div className="bg-[#F8F9FD]">
      <ToastContainer />
      <Navbar />
      <div className="flex items-start">
        <Sidebar />
        <Routes>
          {/* Admin Routes */}
          <Route path="/" element={<></>} />
          <Route path="/admin-dashboard" element={<Dashboard />} />
          <Route path="/all-apointments" element={<AllAppointments />} />
          <Route path="/add-doctors" element={<AddDoctor />} />
          <Route path="/doctors-list" element={<DoctorsList />} />

          {/* Doctor Routes */}
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor-appointments" element={<DoctorAppointments />} />
          <Route path="/doctor-profile" element={<DoctorProfile />} />

          {/* Medical Reports Routes */}
          <Route path="/medical-reports" element={<MedicalReports />} />
          <Route
            path="/medical-reports/create/:patientId"
            element={<CreateReport />}
          />
          <Route
            path="/medical-reports/edit/:reportId"
            element={<EditReport />}
          />
          <Route
            path="/medical-reports/view/:reportId"
            element={<ViewReport />}
          />

          {/* Subscription and AI Routes */}
          <Route path="/subscription-plans" element={<SubscriptionPlan />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
        </Routes>
      </div>
    </div>
  ) : (
    <>
      <Login />
      <ToastContainer />
    </>
  );
};

export default App;
