import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { assets } from "../../assets/assets";

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments } = useContext(DoctorContext);

  useEffect(() => {
    getAppointments();
  }, [dToken]);

  console.log("dans le frontend", appointments);
  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_1fr_3fr_1fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b ">
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
            key={index}
            className="grid grid-cols-[0.5fr_1fr_3fr_1fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b"
          >
            <p>{index + 1}</p>
            <div className="flex items-center gap-2">
              <img src={assets.patients_icon} alt="icon" className="w-6 h-6" />
              <p>{item.PATIENT_NAME}</p>
            </div>
            <p>{item.PATIENT_EMAIL}</p>
            <p>{item.PATIENT_PHONE}</p>
            <p>{item.PATIENT_GENDER}</p>
            <p>{item.STATUS}</p>
            <p>
              {item.SLOT_DATE} à {item.SLOT_TIME}
            </p>
            <p>{item.FEES}€</p>
            <button className="bg-blue-500 text-white px-3 py-1 rounded">
              ACTION
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
