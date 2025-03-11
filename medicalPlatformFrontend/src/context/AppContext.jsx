import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "$";
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"; // Ajoutez une valeur par défaut si l'env n'est pas défini

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true); // État pour suivre le chargement
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : false
  );
  const [patientData, setPatientData] = useState(false);

  const getDoctorsData = async () => {
    try {
      setLoading(true);
      console.log("Fetching doctors from:", `${backendUrl}/api/doctor/list`); // Debug log

      const { data } = await axios.get(`${backendUrl}/api/doctor/list`);

      if (data.success) {
        console.log("Doctors data received:", data.doctors); // Debug log
        setDoctors(data.doctors);
      } else {
        console.error("API error:", data.message); // Debug log
        toast.error(data.message || "Failed to fetch doctors");
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error(error.message || "An error occurred while fetching doctors");
    } finally {
      setLoading(false);
    }
  };

  const loadPatientData = async () => {
    if (!token) return;

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/patient/get-profile`,
        { headers: { token } }
      );

      if (data.success) {
        setPatientData(data.data);
      } else {
        toast.error(data.message || "Failed to load patient profile");
      }
    } catch (error) {
      console.error("Error loading patient data:", error);
      toast.error(error.message || "Error loading your profile");

      // Si l'erreur est liée à l'authentification, déconnectons l'utilisateur
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        setToken(false);
      }
    }
  };

  // Calculer l'âge à partir de la date de naissance
  const calculateAge = (DATE_OF_BIRTH) => {
    if (!DATE_OF_BIRTH) return 0;

    const today = new Date();
    const birthDate = new Date(DATE_OF_BIRTH);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Fonctions utilitaires pour le format des dates et heures
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const value = {
    doctors,
    loading,
    getDoctorsData,
    currencySymbol,
    token,
    setToken,
    backendUrl,
    patientData,
    setPatientData,
    loadPatientData,
    calculateAge,
    formatDate,
  };

  // Chargement initial des données des médecins
  useEffect(() => {
    getDoctorsData();

    // Rafraîchir les données toutes les 5 minutes
    const interval = setInterval(getDoctorsData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Chargement des données du patient lorsque le token change
  useEffect(() => {
    if (token) {
      loadPatientData();
    } else {
      setPatientData(false);
    }
  }, [token]);

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
