import axios from "axios";
import { createContext } from "react";
import { useState } from "react";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [dToken, setDToken] = useState(
    localStorage.getItem("dToken") ? localStorage.getItem("dToken") : ""
  );
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);

  const [profileData, setProfileData] = useState(false);
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);

  const getReport = async (reportId) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/reports/${reportId}`,
        getHeaders()
      );
      if (data.success) {
        return data.data;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching report");
      return null;
    }
  };

  // Fonction pour mettre à jour un rapport
  const updateReport = async (reportId, reportData) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/reports/${reportId}`,
        reportData,
        getHeaders()
      );
      if (data.success) {
        toast.success("Report updated successfully");
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating report");
      return false;
    }
  };

  // Fonction pour supprimer un rapport
  const deleteReport = async (reportId) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/reports/${reportId}`,
        getHeaders()
      );
      if (data.success) {
        toast.success("Report deleted successfully");
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting report");
      return false;
    }
  };

  // Fonction pour télécharger le PDF
  const downloadReportPDF = async (reportId) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/reports/${reportId}/pdf`,
        {
          ...getHeaders(),
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Error downloading PDF");
    }
  };
  // Récupérer la liste des patients du médecin
  const getPatients = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/reports/patients`,
        getHeaders()
      );
      if (data.success) {
        setPatients(data.patients);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching patients");
    }
  };

  // Récupérer les rapports d'un patient
  const getPatientReports = async (patientId) => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/reports/patient/${patientId}`,
        getHeaders()
      );
      if (data.success) {
        setReports(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching reports");
    }
  };

  const createReport = async (reportData) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/reports`,
        reportData,
        getHeaders()
      );
      if (data.success) {
        toast.success("Report created successfully");
        return data.data;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating report");
      return null;
    }
  };

  // Configuration commune pour axios
  const getHeaders = () => ({
    headers: {
      dToken: dToken,
      "Content-Type": "application/json",
    },
  });

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/appointments`,
        getHeaders()
      );
      if (data.success) {
        setAppointments(data.appointments.reverse());
        console.log(data.appointments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error fetching appointments"
      );
    }
  };

  const completeAppointment = async (APPOINTMENT_ID) => {
    try {
      console.log("premier fois :", APPOINTMENT_ID);
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/complete-appointment`,
        { APPOINTMENT_ID },
        getHeaders()
      );

      if (data.success) {
        toast.success(data.message);
        await getAppointments();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error completing appointment"
      );
      return false;
    }
  };

  const cancelAppointment = async (APPOINTMENT_ID) => {
    console.log("Context - Starting cancellation with token:", dToken);
    console.log("Context - Full headers:", getHeaders());
    console.log(
      "Context - URL:",
      `${backendUrl}/api/doctor/cancel/${APPOINTMENT_ID}`
    );
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/doctor/cancel/${APPOINTMENT_ID}`,
        getHeaders()
      );

      if (data.success) {
        toast.success("Appointment canceled successfully.");
        await getAppointments();
        return true;
      } else {
        toast.error(data.message || "Failed to cancel appointment.");
        return false;
      }
    } catch (error) {
      console.error("Cancel appointment error:", error.response);
      toast.error(
        error.response?.data?.message || "Error canceling appointment."
      );
      return false;
    }
  };
  const getDashData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/doctor/dashboard",
        getHeaders()
      );
      if (data.success) {
        setDashData(data.dashData);
        console.log(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error dashboard");
    }
  };

  const getProfileData = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/profile`,
        getHeaders() // Using the existing getHeaders function which already includes dToken
      );

      if (data.success) {
        setProfileData(data.data);
        console.log("Profile Data:", data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la récupération du profil"
      );
    }
  };
  const refreshDoctorData = async () => {
    try {
      await Promise.all([getAppointments(), getDashData(), getProfileData()]);
    } catch (error) {
      console.error("Error refreshing doctor data:", error);
      toast.error("Error updating some information");
    }
  };
  const value = {
    dToken,
    setDToken,
    backendUrl,
    getAppointments,
    appointments,
    setAppointments,
    completeAppointment,
    cancelAppointment,
    getDashData,
    setDashData,
    dashData,
    profileData,
    setProfileData,
    getProfileData,
    getHeaders,
    refreshDoctorData,
    reports,
    setReports,
    patients,
    setPatients,
    getPatients,
    getPatientReports,
    createReport,
    getReport,
    updateReport,
    deleteReport,
    downloadReportPDF,
  };
  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
