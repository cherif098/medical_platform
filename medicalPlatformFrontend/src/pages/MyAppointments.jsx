import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/patient/appointments`,
          { headers: { token } }
        );

        if (data.success) {
          setAppointments(data.appointments);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [backendUrl, token]);

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await axios.post(`${backendUrl}/api/patient/appointments/cancel`, {
        appointmentId,
      }, {
        headers: { token },
      });

      if (response.data.success) {
        toast.success(response.data.message);
        // Mettre à jour la liste des rendez-vous
        setAppointments(appointments.filter((a) => a.APPOINTMENT_ID !== appointmentId));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error cancelling appointment");
    }
  };

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My appointments
      </p>
      <div>
        {appointments.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            key={index}
          >
            <div>
              <img className="w-32 bg-indigo-50" src={item.DOCTOR_IMAGE} alt="" />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">{item.DOCTOR_NAME}</p>
              <p>{item.SPECIALTY}</p>
              <p className="text-zinc-700 font-medium mt-1">Adresse:</p>
              <p className="text-xs">{item.ADRESS_1}</p>
              <p className="text-xs">{item.ADRESS_2}</p>
              <p className="text-xs mt-1">
                <span>Date & Time: </span>
                {item.SLOT_DATE} | {item.SLOT_TIME}
              </p>
              <p className="text-xs mt-1">
                <span>Status: </span>
                <span className={item.STATUS === 'SCHEDULED' ? 'text-green-500' : 'text-red-500'}>
                  {item.STATUS}
                </span>
              </p>
              <p className="text-xs mt-1">
                <span>Fees: </span>
                {item.FEES} €
              </p>
            </div>
            <div className="flex flex-col gap-2 justify-end">
              <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300">
                Pay Online
              </button>
              <button
                className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                onClick={() => handleCancelAppointment(item.APPOINTMENT_ID)}
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;