import React, { useState, useContext, useEffect } from "react";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { NurseContext } from "../context/NurseContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { socket } from "../socket"; 
import {
  ShieldCheck,
  Stethoscope,
  Heart,
  Briefcase,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Mail,
  Lock,
  LogIn,
} from "lucide-react";


const Login = () => {
  const roles = [
    {
      id: "Admin",
      label: "Administrateur",
      icon: ShieldCheck,
      color: "bg-blue-600",
      path: "/admin-dashboard",
    },
    {
      id: "Doctor",
      label: "Médecin",
      icon: Stethoscope,
      color: "bg-green-600",
      path: "/doctor-dashboard",
    },
    {
      id: "Nurse",
      label: "Infirmier",
      icon: Heart,
      color: "bg-pink-600",
      path: "/nurse-dashboard",
    },
    {
      id: "Manager",
      label: "Manager",
      icon: Briefcase,
      color: "bg-purple-600",
      path: "/manager-dashboard",
    },
    {
      id: "Secretary",
      label: "Secrétaire",
      icon: ClipboardList,
      color: "bg-amber-600",
      path: "/secretary-dashboard",
    },
  ];

  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [EMAIL, setEmail] = useState("");
  const [PASSWORD, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const navigate = useNavigate();
  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);
  const { setNToken } = useContext(NurseContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);
  
    try {
      const currentRole = roles[activeRoleIndex].id;
      let endpoint, tokenType, setTokenFunc, userType, userIdKey;
  
      switch (currentRole) {
        case "Admin":
          endpoint = "/api/admin/login";
          tokenType = "aToken";
          setTokenFunc = setAToken;
          break;
        case "Doctor":
          endpoint = "/api/doctor/login";
          tokenType = "dToken";
          setTokenFunc = setDToken;
          userType = "DOCTOR";
          userIdKey = "doctorId";
          break;
        case "Nurse":
          endpoint = "/api/nurse/login";
          tokenType = "nToken";
          setTokenFunc = setNToken;
          userType = "NURSE";
          userIdKey = "nurseId";
          break;
        case "Manager":
          endpoint = "/api/manager/login";
          tokenType = "mToken";
          // setTokenFunc = setMToken; // À implémenter plus tard
          break;
        case "Secretary":
          endpoint = "/api/secretary/login";
          tokenType = "sToken";
          // setTokenFunc = setSToken; // À implémenter plus tard
          break;
        default:
          toast.error("Rôle inconnu");
          setIsLoading(false);
          return;
      }
  
      if (remember) {
        localStorage.setItem("remembered_email", EMAIL);
      } else {
        localStorage.removeItem("remembered_email");
      }
  
      const { data } = await axios.post(backendUrl + endpoint, { EMAIL, PASSWORD });
  
      if (data && data.token) {
        localStorage.setItem(tokenType, data.token);
        if (setTokenFunc) setTokenFunc(data.token);
  
        navigate(roles[activeRoleIndex].path);
        toast.success(`Connexion réussie en tant que ${roles[activeRoleIndex].label}`);
  
        // 🔥 WebSocket: Émission de l'état en ligne après connexion
        if (userType && userIdKey && data[userIdKey]) {
          console.log(`🔹 WebSocket: Émission du statut pour ${data[userIdKey]} (${userType})`);
          socket.emit("updateUserStatus", {
            userId: data[userIdKey],
            userType,
            isOnline: true,
          });
        }
      } else {
        toast.error("Réponse du serveur incorrecte");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la connexion :", error);
      toast.error(error.response?.data?.message || "Identifiants incorrects. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Pré-remplir les champs si stockés localement
  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);


  const nextRole = () => {
    setActiveRoleIndex((prev) => (prev === roles.length - 1 ? 0 : prev + 1));
  };

  const prevRole = () => {
    setActiveRoleIndex((prev) => (prev === 0 ? roles.length - 1 : prev - 1));
  };

  const handleRoleSelect = (index) => {
    setActiveRoleIndex(index);
  };

  const activeRole = roles[activeRoleIndex];

  const handleRememberMe = () => {
    setRemember(!remember);
    if (!remember) {
      localStorage.setItem("remembered_email", EMAIL);
    } else {
      localStorage.removeItem("remembered_email");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4 py-8">
      <div className="w-full max-w-md relative">
        {/* Logo ou titre d'application */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">MediConnect</h2>
          <p className="text-gray-600">Plateforme de gestion hospitalière</p>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300">
          {/* Sélecteur de rôles (style carrousel) */}
          <div className="relative">
            <div
              className={`h-28 flex items-center justify-center ${activeRole.color} transition-colors duration-300`}
            >
              <button
                onClick={prevRole}
                className="absolute left-4 text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Rôle précédent"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="text-white text-center transition-all duration-300 transform">
                <activeRole.icon size={40} className="mx-auto mb-1" />
                <h3 className="font-semibold">{activeRole.label}</h3>
              </div>

              <button
                onClick={nextRole}
                className="absolute right-4 text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Rôle suivant"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Indicateurs de rôle */}
            <div className="flex justify-center -mt-3 relative z-10">
              <div className="bg-white px-3 py-1 rounded-full shadow flex space-x-2">
                {roles.map((role, idx) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      idx === activeRoleIndex
                        ? `${role.color.replace("bg", "bg")}`
                        : "bg-gray-300"
                    }`}
                    aria-label={`Sélectionner ${role.label}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="p-6 pt-8">
            <form onSubmit={onSubmitHandler} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    value={EMAIL}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="nom@exemple.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <a
                    href="#"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mot de passe oublié?
                  </a>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="password"
                    required
                    value={PASSWORD}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Option Se souvenir de moi */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={handleRememberMe}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Se souvenir de moi
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${activeRole.color} text-white py-3 rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <LogIn size={18} />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            {/* Info de support */}
            <div className="mt-8 text-center text-xs text-gray-500">
              <p>
                Des problèmes pour vous connecter?{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Contactez le support
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Information sur la sécurité */}
        <div className="mt-6 text-center text-xs text-gray-500 max-w-sm mx-auto">
          <p>
            Votre session est sécurisée. Nous utilisons des connexions chiffrées
            pour protéger vos informations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;