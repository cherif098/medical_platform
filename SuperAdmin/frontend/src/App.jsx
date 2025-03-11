import { ToastContainer } from "react-toastify"; 
import { superAdminContext } from "./context/superAdminContext";
import { useContext, useEffect } from "react";
import Navbar from "./components/Navbar";
import SideBar from "./components/SideBar";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AddHospital from "./pages/AddHospital";
import HospitalList from "./pages/HospitalList";
import Partnership from "./pages/Partnership";
import LoginSuperAdmin from "./pages/Login";
import EditHospital from "./pages/EditHospital";

const App = () => {
  const { saToken } = useContext(superAdminContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = !!saToken;

  // Rediriger vers la page de login au démarrage de l'application
  useEffect(() => {
    // Si l'utilisateur arrive sur la racine ou autre page (mais pas /login)
    // et qu'il n'est pas authentifié, on le redirige vers /login
    if (!isAuthenticated && location.pathname !== "/login") {
      navigate("/login");
    }
  }, [isAuthenticated, navigate, location.pathname]);

  // Composant de route protégée qui redirige vers la page de connexion si non authentifié
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD]">
      <ToastContainer />
      
      {isAuthenticated ? (
        // Interface complète pour utilisateur authentifié
        <>
          {/* Navbar fixe en haut */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-[#F8F9FD]">
            <Navbar />
          </div>

          <div className="flex pt-[42px]">
            {/* Sidebar fixe */}
            <div className="fixed left-0 h-[calc(100vh-64px)] w-64 overflow-y-auto">
              <SideBar />
            </div>
            {/* Zone de contenu principal défilante */}
            <div className="flex-1 ml-64">
              <main className="h-[calc(100vh-64px)] overflow-y-auto">
                <Routes>
                  {/* Routes du SuperAdmin protégées */}
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/add-hospital" element={<ProtectedRoute><AddHospital /></ProtectedRoute>} />
                  <Route path="/hospital-list" element={<ProtectedRoute><HospitalList /></ProtectedRoute>} />
                  <Route path="/edit-hospital/:ID" element={<ProtectedRoute><EditHospital /></ProtectedRoute>} />
                  <Route path="/partnership" element={<ProtectedRoute><Partnership /></ProtectedRoute>} />
                  <Route path="/login" element={<Navigate to="/" />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </div>
        </>
      ) : (
        // Page de login pour utilisateur non authentifié
        <Routes>
          <Route path="/login" element={<LoginSuperAdmin />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </div>
  );
};

export default App;