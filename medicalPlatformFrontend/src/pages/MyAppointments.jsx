import React, { useContext, useEffect, useState, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();

  const fetchAppointments = useCallback(async () => {
    if (!token) {
      toast.error("Please login to view appointments");
      navigate("/login");
      return;
    }

    try {
      const { data } = await axios.get(
        `${backendUrl}/api/appointment/patient-appointments`,
        {
          headers: { token },
        }
      );

      if (data.success) {
        const sortedAppointments = data.appointments
          .filter((apt) => apt !== null)
          .sort((a, b) => {
            const dateTimeA = new Date(
              `${a.SLOT_DATE.split("T")[0]} ${a.SLOT_TIME}`
            );
            const dateTimeB = new Date(
              `${b.SLOT_DATE.split("T")[0]} ${b.SLOT_TIME}`
            );
            return dateTimeA - dateTimeB;
          });
        setAppointments(sortedAppointments);
      } else {
        toast.error(data.message || "Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Fetch appointments error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message || "Error fetching appointments"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [backendUrl, token, navigate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleDeleteAppointment = async (appointmentId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this appointment? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(appointmentId);

      const response = await axios.delete(
        `${backendUrl}/api/appointment/cancel/${appointmentId}`,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Appointment deleted successfully");
        setAppointments((prev) =>
          prev.filter((app) => app.APPOINTMENT_ID !== appointmentId)
        );
      } else {
        toast.error(response.data.message || "Failed to delete appointment");
      }
    } catch (error) {
      console.error("Delete appointment error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Error deleting appointment. Please try again later."
        );
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const datePart = dateStr.split("T")[0];
      const [year, month, day] = datePart.split("-");
      const date = new Date(
        Date.UTC(Number(year), Number(month) - 1, Number(day))
      );

      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error, dateStr);
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "N/A";
    try {
      const timePart = timeStr.includes("T") ? timeStr.split("T")[1] : timeStr;
      const [hours, minutes] = timePart.split(":");
      return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    } catch (error) {
      console.error("Error formatting time:", error, timeStr);
      return timeStr;
    }
  };

  const isAppointmentPast = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return false;
    try {
      const datePart = dateStr.split("T")[0];
      const [year, month, day] = datePart.split("-");
      const [hours, minutes] = timeStr.split(":");

      const appointmentDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes)
      );

      return appointmentDate < new Date();
    } catch (error) {
      console.error("Error checking if appointment is past:", error);
      return false;
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-600">Loading appointments...</div>
      </div>
    );
  }

  if (!appointments.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <p className="text-gray-600 text-lg mb-4">No appointments found</p>
        <button
          onClick={() => navigate("/doctors")}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Book an Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          My Appointments
        </h1>
        <button
          onClick={() => navigate("/doctors")}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Book New Appointment
        </button>
      </div>

      <div className="grid gap-6">
        {appointments.map((appointment) => {
          const isPast = isAppointmentPast(
            appointment.SLOT_DATE,
            appointment.SLOT_TIME
          );

          return (
            <div
              key={appointment.APPOINTMENT_ID}
              className={`bg-white rounded-lg shadow p-6 ${
                isPast ? "opacity-75" : ""
              }`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Doctor Image */}
                <div className="w-full md:w-1/4">
                  <img
                    src={appointment.DOCTOR_IMAGE}
                    alt={appointment.DOCTOR_NAME}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "/default-doctor-image.png";
                    }}
                  />
                </div>

                {/* Appointment Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        Dr. {appointment.DOCTOR_NAME}
                      </h2>
                      <p className="text-gray-600">{appointment.SPECIALTY}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">
                        {appointment.FEES} €
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">Date: </span>
                        {formatDate(appointment.SLOT_DATE)}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Time: </span>
                        {formatTime(appointment.SLOT_TIME)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">Location: </span>
                      </p>
                      <p className="text-gray-500 text-sm">
                        {appointment.ADRESS_1}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {appointment.ADRESS_2}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!isPast && (
                    <div className="mt-6 flex gap-4 justify-end">
                      <button
                        className={`px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors ${
                          deleteLoading === appointment.APPOINTMENT_ID
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() =>
                          handleDeleteAppointment(appointment.APPOINTMENT_ID)
                        }
                        disabled={deleteLoading === appointment.APPOINTMENT_ID}
                      >
                        {deleteLoading === appointment.APPOINTMENT_ID
                          ? "Deleting..."
                          : "Delete Appointment"}
                      </button>
                    </div>
                  )}
                  {isPast && (
                    <div className="mt-4">
                      <p className="text-yellow-600 text-sm">
                        This appointment has passed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyAppointments;
