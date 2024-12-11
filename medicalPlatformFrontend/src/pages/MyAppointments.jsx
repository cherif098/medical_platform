import React, { useContext, useEffect, useState, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Calendar, Clock, MapPin, Trash2, Plus, Loader2 } from "lucide-react";

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
          .filter((apt) => apt !== null && apt.STATUS !== "COMPLETED")
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

  const handleCancelAppointment = async (appointmentId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this appointment? This action cannot be undone."
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
        toast.success("Appointment cancelled successfully");
        setAppointments((prev) =>
          prev.filter((app) => app.APPOINTMENT_ID !== appointmentId)
        );
      } else {
        toast.error(response.data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Cancel appointment error:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Error cancelling appointment. Please try again later."
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
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-gray-600 animate-pulse">
            Loading your appointments...
          </p>
        </div>
      </div>
    );
  }

  if (!appointments.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white">
        <div className="text-center space-y-4 max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg transform hover:scale-105 transition-all">
          <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            No Appointments Yet
          </h2>
          <p className="text-gray-600">
            Schedule your first appointment with one of our qualified doctors.
          </p>
          <button
            onClick={() => navigate("/doctors")}
            className="group flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all transform hover:translate-y-[-2px]"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Book an Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              My Appointments
            </h1>
            <p className="text-gray-600">
              {appointments.length} upcoming appointments
            </p>
          </div>
          <button
            onClick={() => navigate("/doctors")}
            className="group flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-all transform hover:translate-y-[-2px] hover:shadow-lg"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Book New
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
                className={`group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden ${
                  isPast ? "opacity-75" : ""
                }`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Doctor Image Container */}
                  <div className="w-full md:w-1/4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <img
                      src={appointment.DOCTOR_IMAGE}
                      alt={appointment.DOCTOR_NAME}
                      className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = "/default-doctor-image.png";
                      }}
                    />
                  </div>

                  {/* Appointment Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">
                          Dr. {appointment.DOCTOR_NAME}
                        </h2>
                        <p className="text-primary font-medium">
                          {appointment.SPECIALTY}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {appointment.FEES} €
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium">
                              {formatDate(appointment.SLOT_DATE)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-gray-500">Time</p>
                            <p className="font-medium">
                              {formatTime(appointment.SLOT_TIME)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Location</p>
                          <p className="font-medium">{appointment.ADRESS_1}</p>
                          <p className="text-gray-600">
                            {appointment.ADRESS_2}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!isPast && (
                      <div className="mt-6 flex justify-end">
                        <button
                          className={`group flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg 
                            hover:bg-red-100 transition-colors ${
                              deleteLoading === appointment.APPOINTMENT_ID
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          onClick={() =>
                            handleCancelAppointment(appointment.APPOINTMENT_ID)
                          }
                          disabled={
                            deleteLoading === appointment.APPOINTMENT_ID
                          }
                        >
                          {deleteLoading === appointment.APPOINTMENT_ID ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          )}
                          {deleteLoading === appointment.APPOINTMENT_ID
                            ? "Cancelling..."
                            : "Cancel Appointment"}
                        </button>
                      </div>
                    )}
                    {isPast && (
                      <div className="mt-4 flex items-center gap-2 text-yellow-600">
                        <Clock className="w-4 h-4" />
                        <p className="text-sm font-medium">
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
    </div>
  );
};

export default MyAppointments;
