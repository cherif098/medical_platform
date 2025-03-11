import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import { NurseContext } from "../context/NurseContext";
import axios from "axios";
import { socket } from "../socket";



const Navbar = () => {
  const { aToken, setAToken } = useContext(AdminContext);
  const { dToken, setDToken } = useContext(DoctorContext);
  const { nToken, setNToken } = useContext(NurseContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const navigate = useNavigate();

  const logout = async () => {
    try {
      let apiUrl = "";
      let headers = { "Content-Type": "application/json" };
      let userId = null;
      let userType = null;
  
      if (dToken) {
        apiUrl = `${backendUrl}/api/doctor/logout`;
        headers = { ...headers, dtoken: dToken };
        userId = JSON.parse(atob(dToken.split(".")[1])).doctorId;
        userType = "DOCTOR";
      } else if (nToken) {
        apiUrl = `${backendUrl}/api/nurse/logout`;
        headers = { ...headers, ntoken: nToken };
        userId = JSON.parse(atob(nToken.split(".")[1])).nurseId;
        userType = "NURSE";
      }
  
      if (apiUrl) {
        await axios.post(apiUrl, {}, { headers });
  
        if (userId) {
          socket.emit("userOffline", { userId, userType }); 
        }
      }
  
      navigate("/");
      localStorage.removeItem("dToken");
      localStorage.removeItem("nToken");
      localStorage.removeItem("aToken");
      setDToken("");
      setNToken("");
      setAToken("");
  
      console.log("Utilisateur déconnecté avec succès");
    } catch (error) {
      console.error("Erreur lors du logout:", error);
    }
  };
  
  

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
      <div className="flex items-center gap-2 text-sx">
        <img className="w-30 sm:w-40 cursor-pointer" src={assets.logo} alt="" />
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
          {aToken ? "Admin" : dToken ? "Doctor" : "Nurse"}
        </p>
      </div>
      <button
        onClick={logout}
        className="bg-primary text-white text-sm px-10 py-2 rounded-full"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
