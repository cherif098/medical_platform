import axios from "axios";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
  const [aToken, setAToken] = useState(
    localStorage.getItem("aToken") ? localStorage.getItem("aToken") : ""
  );
  const [hospitalId, setHospitalId] = useState(
    localStorage.getItem("hospitalId")
      ? localStorage.getItem("hospitalId")
      : null
  );
  const [hospitalName, setHospitalName] = useState(
    localStorage.getItem("hospitalName")
      ? localStorage.getItem("hospitalName")
      : ""
  );
  const [isSuperAdmin, setIsSuperAdmin] = useState(
    localStorage.getItem("isSuperAdmin") === "true"
  );

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);
  const [nurses, setNurses] = useState([]);
  const [secretaries, setSecretaries] = useState([]);
  const [managers, setManagers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Effect to update hospital info when token changes
  useEffect(() => {
    if (aToken) {
      const storedHospitalId = localStorage.getItem("hospitalId");
      const storedHospitalName = localStorage.getItem("hospitalName");
      const storedIsSuperAdmin =
        localStorage.getItem("isSuperAdmin") === "true";

      if (storedHospitalId) setHospitalId(storedHospitalId);
      if (storedHospitalName) setHospitalName(storedHospitalName);
      setIsSuperAdmin(storedIsSuperAdmin);
    } else {
      // Clear hospital info when token is cleared
      setHospitalId(null);
      setHospitalName("");
      setIsSuperAdmin(false);
    }
  }, [aToken]);

  // Fetch the list of hospitals (for super admin)
  const fetchHospitals = async () => {
    if (!aToken || !isSuperAdmin) return;

    try {
      setIsLoading(true);
      const { data } = await axios.get(backendUrl + "/api/admin/hospitals", {
        headers: { aToken },
      });

      if (data.success) {
        setHospitals(data.hospitals);
      } else {
        toast.error(data.message || "Failed to fetch hospitals");
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new hospital (for super admin)
  const addHospital = async (hospitalData) => {
    if (!aToken || !isSuperAdmin) {
      toast.error("You don't have permission to add hospitals");
      return (
        <AdminContext.Provider value={value}>
          {props.children}
        </AdminContext.Provider>
      );
    }

    try {
      setIsLoading(true);
      const { data } = await axios.post(
        backendUrl + "/api/admin/hospitals",
        hospitalData,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success("Hospital added successfully");
        await fetchHospitals();
        return data.hospitalId;
      } else {
        toast.error(data.message || "Failed to add hospital");
        return null;
      }
    } catch (error) {
      console.error("Error adding hospital:", error);
      toast.error(error.response?.data?.message || "Failed to add hospital");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a hospital (for super admin)
  const deleteHospital = async (hospitalId) => {
    if (!aToken || !isSuperAdmin) {
      toast.error("You don't have permission to delete hospitals");
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await axios.delete(
        `${backendUrl}/api/admin/hospitals/${hospitalId}`,
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success("Hospital deleted successfully");
        await fetchHospitals();
        return true;
      } else {
        toast.error(data.message || "Failed to delete hospital");
        return false;
      }
    } catch (error) {
      console.error("Error deleting hospital:", error);
      toast.error(error.response?.data?.message || "Failed to delete hospital");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all doctors for the current hospital
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
      console.log("Token from getAllAppointments:", aToken);

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
        getAllDoctors(); // Refresh the list
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

  // Switch hospital (for super admin)
  const switchHospital = async (newHospitalId) => {
    if (!aToken || !isSuperAdmin) {
      toast.error("Only super admin can switch hospitals");
      return;
    }

    try {
      const hospital = hospitals.find((h) => h.ID === newHospitalId);
      if (!hospital) {
        toast.error("Hospital not found");
        return;
      }

      setHospitalId(newHospitalId);
      setHospitalName(hospital.NAME);
      localStorage.setItem("hospitalId", newHospitalId);
      localStorage.setItem("hospitalName", hospital.NAME);

      // Refresh data for the new hospital
      await Promise.all([
        getAllDoctors(),
        getAllNurses(),
        getAllSecretaries(),
        getAllManagers(),
        getAllAppointments(),
        getDashData(),
      ]);

      toast.success(`Switched to hospital: ${hospital.NAME}`);
    } catch (error) {
      console.error("Error switching hospital:", error);
      toast.error("Failed to switch hospital");
    }
  };

  // Handle logout and clear all state
  const handleLogout = () => {
    setAToken("");
    setHospitalId(null);
    setHospitalName("");
    setIsSuperAdmin(false);
    setDoctors([]);
    setNurses([]);
    setSecretaries([]);
    setManagers([]);
    setAppointments([]);
    setDashData(false);

    localStorage.removeItem("aToken");
    localStorage.removeItem("hospitalId");
    localStorage.removeItem("hospitalName");
    localStorage.removeItem("isSuperAdmin");
  };

  // Context value
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
    hospitalId,
    hospitalName,
    isSuperAdmin,
    hospitals,
    isLoading,
    fetchHospitals,
    addHospital,
    deleteHospital,
    switchHospital,
    handleLogout,
  };

  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
