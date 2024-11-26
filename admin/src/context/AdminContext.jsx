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

    }catch (error) {
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (APPOINTMENT_ID) => {
    try {
      console.log("id1",APPOINTMENT_ID)
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
    }catch (error) {
      toast.error(error.message);
    }
  }

  const getDashData = async () => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/dashboard",
        { headers: { aToken } }
      );
      if (data) {
        setDashData(data.data);
        console.log(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  const value = {
    aToken,setAToken,
    backendUrl,
    getAllDoctors,
    doctors,
    changeAvailability,
    appointments, setAppointments,
    getAllAppointments,
    cancelAppointment,
    dashData,
    getDashData
  };
  return (
    <AdminContext.Provider value={value}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
