import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { assets } from "../../assets/assets";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const DoctorAppointments = () => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [canceling, setCanceling] = useState(null);

  const {
    dToken,
    appointments,
    setAppointments,
    getAppointments,
    backendUrl,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        await getAppointments();
      } catch (error) {
        toast.error("Failed to fetch appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [dToken]);

  const handleCancelAppointment = async (APPOINTMENT_ID) => {
    try {
      console.log("Vue - Starting cancellation for ID:", APPOINTMENT_ID);
      setCanceling(APPOINTMENT_ID);
      console.log("Vue - Current dToken:", localStorage.getItem("dToken"));
      await cancelAppointment(APPOINTMENT_ID);
    } catch (error) {
      console.error("Vue - Error:", error);
      toast.error("Failed to cancel appointment. Please try again.");
    } finally {
      setCanceling(null);
    }
  };

  const handleCompleteAppointment = async (APPOINTMENT_ID) => {
    try {
      setProcessing(APPOINTMENT_ID);
      const success = await completeAppointment(APPOINTMENT_ID);
      if (success) {
        // Mise à jour locale du statut du rendez-vous
        setAppointments((prevAppointments) =>
          prevAppointments.map((apt) =>
            apt.APPOINTMENT_ID === APPOINTMENT_ID
              ? { ...apt, STATUS: "COMPLETED" }
              : apt
          )
        );
      }
    } catch (error) {
      toast.error("Failed to complete appointment. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-600">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_3fr_1fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>E-mail</p>
          <p>Phone</p>
          <p>Gender</p>
          <p>Status</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {appointments.map((item, index) => (
          <div
            key={item.APPOINTMENT_ID}
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_3fr_1fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b"
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img
                src={item.PATIENT_IMAGE}
                alt="Patient Icon"
                className="w-8 rounded-full"
              />
              <p>{item.PATIENT_NAME}</p>
            </div>
            <p>{item.PATIENT_EMAIL}</p>
            <p>{item.PATIENT_PHONE}</p>
            <p>{item.PATIENT_GENDER}</p>
            <p
              className={`text-xs inline border px-2 rounded-full ${
                item.STATUS === "COMPLETED"
                  ? "border-green-500 text-green-500"
                  : "border-primary"
              }`}
            >
              {item.STATUS}
            </p>
            <p>
              {item.SLOT_DATE}, {item.SLOT_TIME}
            </p>
            <p>{item.FEES}€</p>
            <div className="flex items-center gap-2">
              {item.STATUS === "COMPLETED" ? (
                <span className="text-green-500 font-medium">Completed</span>
              ) : (
                <>
                  <img
                    className={`w-10 cursor-pointer ${
                      canceling === item.APPOINTMENT_ID ? "opacity-50" : ""
                    }`}
                    src={assets.cancel_icon}
                    alt="Cancel Icon"
                    onClick={() => handleCancelAppointment(item.APPOINTMENT_ID)}
                  />
                  <img
                    className={`w-10 cursor-pointer ${
                      processing === item.APPOINTMENT_ID ? "opacity-50" : ""
                    }`}
                    src={assets.tick_icon}
                    alt="Complete Icon"
                    onClick={() =>
                      handleCompleteAppointment(item.APPOINTMENT_ID)
                    }
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
