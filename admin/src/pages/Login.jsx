import React, { useState, useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { NurseContext } from "../context/NurseContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { socket } from "../socket"; 

const Login = () => {
  const [state, setState] = useState("Admin");
  const navigate = useNavigate();
  const [EMAIL, setEmail] = useState("");
  const [PASSWORD, setPassword] = useState("");

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);
  const { setNToken } = useContext(NurseContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let apiUrl = "";
      let tokenKey = "";
      let userType = "";
      let userIdKey = "";
   
      if (state === "Admin") {
        apiUrl = `${backendUrl}/api/admin/login`;
        tokenKey = "aToken";
      } else if (state === "Doctor") {
        apiUrl = `${backendUrl}/api/doctor/login`;
        tokenKey = "dToken";
        userType = "DOCTOR";
        userIdKey = "doctorId";
      } else if (state === "Nurse") {
        apiUrl = `${backendUrl}/api/nurse/login`;
        tokenKey = "nToken";
        userType = "NURSE";
        userIdKey = "nurseId";
      }
   
      if (apiUrl) {
        const { data } = await axios.post(apiUrl, { EMAIL, PASSWORD });
   
        if (data && data.token) {
          localStorage.setItem(tokenKey, data.token);
          if (state === "Doctor") setDToken(data.token);
          else if (state === "Nurse") setNToken(data.token);
          else setAToken(data.token);
   
          navigate(
            state === "Doctor"
              ? "/doctor-dashboard"
              : state === "Nurse"
              ? "/nurse-dashboard"
              : "/admin-dashboard"
          );
          toast.success("Connexion réussie");
   
          //  WebSocket
          if (data[userIdKey]) {
            console.log(`🔹 Émission du statut pour ${data[userIdKey]} (${userType})`);
            socket.emit("updateUserStatus", { 
              userId: data[userIdKey], 
              userType,
              isOnline: true 
            });
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      toast.error(error.response?.data?.message || "Erreur de connexion");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue</h2>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        {/* Sélecteur Admin/Docteur/Infirmier */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex rounded-md overflow-hidden mb-8">
            <button
              onClick={() => setState("Admin")}
              className={`flex-1 py-3 text-sm font-medium ${
                state === "Admin"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              } transition-colors duration-200`}
            >
              Admin
            </button>
            <button
              onClick={() => setState("Doctor")}
              className={`flex-1 py-3 text-sm font-medium ${
                state === "Doctor"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              } transition-colors duration-200`}
            >
              Médecin
            </button>
            <button
              onClick={() => setState("Nurse")}
              className={`flex-1 py-3 text-sm font-medium ${
                state === "Nurse"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              } transition-colors duration-200`}
            >
              Infirmier
            </button>
          </div>

          <form onSubmit={onSubmitHandler} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={EMAIL}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="Entrez votre email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={PASSWORD}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="Entrez votre mot de passe"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mot de passe oublié ?
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          Besoin d'aide ?{" "}
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
            Contactez le support
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;