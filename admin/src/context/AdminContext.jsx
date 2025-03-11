import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [nurses, setNurses] = useState([]);
  const [secretaries, setSecretaries] = useState([]);
  const [managers, setManagers] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const getAllDoctors = async () => {
    try {
      console.log("Token from getAllDoctors:", aToken);

      const { data } = await axios.post(
        backendUrl + "/api/admin/all-doctors",
        {},
        {
          headers: { aToken },
        }
      );

      console.log("API Response:", data);

      if (data) {
        setDoctors(data.data);
      } else {
        toast.error(data.message || "Failed to fetch doctors");
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error(error.message || "An error occurred");
    }
  };

  const changeAvailability = async (DOCTOR_LICENCE) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { DOCTOR_LICENCE },
        { headers: { aToken } }
      );
      if (data) {
        toast.success(data.message);
        getAllDoctors();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAllAppointments = async () => {
    try {
      console.log("Token from getAllApointments:", aToken);

      const { data } = await axios.post(
        backendUrl + "/api/admin/appointments",
        { headers: { aToken } }
      );
      console.log("API Response:", data);
      if (data) {
        setAppointments(data.data);
        console.log(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (APPOINTMENT_ID) => {
    try {
      console.log("id1", APPOINTMENT_ID);
      const { data } = await axios.delete(
        `${backendUrl}/api/admin/cancel-appointment/${APPOINTMENT_ID}`,
        { headers: { aToken } }
      );
      if (data) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const deleteDoctor = async (DOCTOR_ID) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/admin/delete-doctor/${DOCTOR_ID}`,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllDoctors(); // Rafraîchir la liste
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting doctor");
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: { aToken },
      });
      if (data) {
        setDashData(data.data);
        console.log(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAllNurses = async () => {
    try {
      console.log("Token from getAllNurses:", aToken);

      const { data } = await axios.get(backendUrl + "/api/admin/all-nurses", {
        headers: { aToken },
      });

      console.log("API Response (nurses):", data);

      if (data.success) {
        setNurses(data.data);
      } else {
        toast.error(data.message || "Failed to fetch nurses");
      }
    } catch (error) {
      console.error("Error fetching nurses:", error);
      toast.error(error.message || "An error occurred");
    }
  };

  const deleteNurse = async (nurseId) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/admin/delete-nurse/${nurseId}`,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllNurses(); // Refresh the list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting nurse");
    }
  };
  const getAllSecretaries = async () => {
    try {
      console.log("Token from getAllSecretaries:", aToken);

      const { data } = await axios.get(
        backendUrl + "/api/admin/all-secretaries",
        {
          headers: { aToken },
        }
      );

      console.log("API Response (secretaries):", data);

      if (data.success) {
        setSecretaries(data.data);
      } else {
        toast.error(data.message || "Failed to fetch secretaries");
      }
    } catch (error) {
      console.error("Error fetching secretaries:", error);
      toast.error(error.message || "An error occurred");
    }
  };

  const deleteSecretary = async (secretaryId) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/admin/delete-secretary/${secretaryId}`,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllSecretaries(); // Refresh the list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting secretary");
    }
  };

  // Manager functions
  const getAllManagers = async () => {
    try {
      console.log("Token from getAllManagers:", aToken);

      const { data } = await axios.get(backendUrl + "/api/admin/all-managers", {
        headers: { aToken },
      });

      console.log("API Response (managers):", data);

      if (data.success) {
        setManagers(data.data);
      } else {
        toast.error(data.message || "Failed to fetch managers");
      }
    } catch (error) {
      console.error("Error fetching managers:", error);
      toast.error(error.message || "An error occurred");
    }
  };

  const deleteManager = async (managerId) => {
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/admin/delete-manager/${managerId}`,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllManagers(); // Refresh the list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting manager");
    }
  };

  const value = {
    aToken,
    setAToken,
    backendUrl,
    getAllDoctors,
    doctors,
    changeAvailability,
    appointments,
    setAppointments,
    getAllAppointments,
    cancelAppointment,
    dashData,
    getDashData,
    deleteDoctor,
    nurses,
    getAllNurses,
    deleteNurse,
    secretaries,
    getAllSecretaries,
    deleteSecretary,
    managers,
    getAllManagers,
    deleteManager,
  };
  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
