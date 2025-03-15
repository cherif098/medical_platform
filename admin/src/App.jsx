import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AdminContext } from "./context/AdminContext";
import { DoctorContext } from "./context/DoctorContext";
import { NurseContext } from "./context/NurseContext";
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
import AddNurse from "./pages/Admin/AddNurse";
import NursesList from "./pages/Admin/NursesList";
import AddManager from "./pages/Admin/AddManager";
import AddSecretary from "./pages/Admin/AddSecretary";
import ManagersList from "./pages/Admin/ManagersList";
import SecretariesList from "./pages/Admin/SecretariesList";

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
import AIImageScanner from "./pages/Doctors/AIImageScanner";
import ChatPage from "./pages/ChatPage";
import MedicalAIScanner from "./pages/Doctors/MedicalAIScanner";

// page infimier
import NurseProfile from "./pages/Nurses/NurseProfile";
import MedicalReportsList from "./pages/Nurses/MedicalReportsList";
import ViewMedicalReport from "./pages/Nurses/ViewMedicalReport";

const App = () => {
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const { nToken } = useContext(NurseContext);

  // Déterminer si la page actuelle est ChatPage pour appliquer un style différent
  const isChatPage = () => {
    const path = window.location.pathname;
    return path === "/doctor/messages" || path === "/nurse/messages";
  };

  // Hauteur estimée de votre Navbar - ajustez selon la hauteur réelle
  const navbarHeight = 64; // px

  return aToken || dToken || nToken ? (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col">
      <ToastContainer />

      {/* Navbar fixe en haut */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[64px]">
        <Navbar />
      </div>

      {/* Conteneur flex pour le reste du contenu */}
      <div className="flex flex-1 pt-[64px]">
        {/* Sidebar fixe - collée directement à la navbar */}
        <div className="fixed left-0 top-[4px] h-[calc(100vh-4px)] w-64 overflow-y-auto z-40">
          <Sidebar />
        </div>

        {/* Zone de contenu principal avec style adapté pour ChatPage */}
        <div
          className={`transition-all duration-200 ${
            isChatPage()
              ? "ml-64 flex-1 overflow-hidden h-[calc(100vh-64px)]"
              : "ml-64 flex-1"
          }`}
        >
          <main
            className={
              isChatPage()
                ? "h-full w-full overflow-hidden" // Pour ChatPage
                : "h-[calc(100vh-64px)] overflow-y-auto" // Pour les autres pages
            }
          >
            <Routes>
              {/* Admin Routes */}
              <Route path="/" element={<></>} />
              <Route path="/admin-dashboard" element={<Dashboard />} />
              <Route path="/all-apointments" element={<AllAppointments />} />
              <Route path="/add-doctors" element={<AddDoctor />} />
              <Route path="/doctors-list" element={<DoctorsList />} />
              <Route path="/add-nurse" element={<AddNurse />} />
              <Route path="/nurses-list" element={<NursesList />} />
              <Route path="/add-secretary" element={<AddSecretary />} />
              <Route path="/secretaries-list" element={<SecretariesList />} />
              <Route path="/add-manager" element={<AddManager />} />
              <Route path="/managers-list" element={<ManagersList />} />

              {/* Doctor Routes */}
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route
                path="/doctor-appointments"
                element={<DoctorAppointments />}
              />
              <Route path="/doctor-profile" element={<DoctorProfile />} />
              <Route path="/doctor/messages" element={<ChatPage />} />

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
              <Route
                path="/subscription-plans"
                element={<SubscriptionPlan />}
              />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="//ai-image-scanner" element={<AIImageScanner />} />
              <Route
                path="/medical-ai-scanner"
                element={<MedicalAIScanner />}
              />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />

              {/* Nurse Routes */}
              <Route path="/nurse-profile" element={<NurseProfile />} />
              <Route
                path="/medicalreports-list"
                element={<MedicalReportsList />}
              />
              <Route
                path="/view-report/:reportId"
                element={<ViewMedicalReport />}
              />
              <Route path="/nurse/messages" element={<ChatPage />} />
            </Routes>
          </main>
        </div>
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
