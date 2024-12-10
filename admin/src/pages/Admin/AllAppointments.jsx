import React from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { useContext, useEffect } from "react";
import { assets } from "../../assets/assets";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } =
    useContext(AdminContext);
  const { calculateAge, slotDateFormat, convertTimeToAmPm, currency } =
    useContext(AppContext);

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  const StatusBadge = ({ status }) => {
    const getStatusStyle = () => {
      switch (status) {
        case "COMPLETED":
          return "bg-green-100 text-green-700";
        case "CANCELLED":
          return "bg-red-100 text-red-700";
        default:
          return "bg-blue-100 text-blue-700";
      }
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle()}`}
      >
        {status?.toLowerCase().replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Appointments</h1>
          <p className="text-gray-500 mt-1">
            Manage and monitor patient appointments
          </p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Total Appointments</p>
          <p className="text-2xl font-bold text-indigo-600">
            {appointments.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] gap-4 py-4 px-6 bg-gray-50 border-b">
          <p className="text-sm font-medium text-gray-600">#</p>
          <p className="text-sm font-medium text-gray-600">Patient</p>
          <p className="text-sm font-medium text-gray-600">Age</p>
          <p className="text-sm font-medium text-gray-600">Date & Time</p>
          <p className="text-sm font-medium text-gray-600">Doctor</p>
          <p className="text-sm font-medium text-gray-600">Fees</p>
          <p className="text-sm font-medium text-gray-600">Status</p>
        </div>

        <div className="divide-y max-h-[70vh] overflow-y-auto">
          {appointments.map((item, index) => (
            <div
              key={index}
              className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center py-4 px-6 hover:bg-gray-50 transition-colors duration-150"
            >
              <p className="max-sm:hidden text-gray-600">{index + 1}</p>

              <div className="flex items-center gap-3">
                <img
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  src={item.PATIENT.IMAGE}
                  alt=""
                />
                <div>
                  <p className="font-medium text-gray-800">
                    {item.PATIENT.NAME}
                  </p>
                  <p className="text-sm text-gray-500 sm:hidden">
                    Age: {calculateAge(item.PATIENT.DATE_OF_BIRTH)}
                  </p>
                </div>
              </div>

              <p className="max-sm:hidden text-gray-600">
                {calculateAge(item.PATIENT.DATE_OF_BIRTH)}
              </p>

              <div className="text-gray-600">
                <p className="font-medium">
                  {slotDateFormat(item.APPOINTMENT.SLOT_DATE)}
                </p>
                <p className="text-sm text-gray-500">
                  {convertTimeToAmPm(item.APPOINTMENT.SLOT_TIME)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <img
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  src={item.DOCTOR.IMAGE}
                  alt=""
                />
                <p className="font-medium text-gray-800">{item.DOCTOR.NAME}</p>
              </div>

              <p className="font-medium text-gray-800">
                {currency}
                {item.DOCTOR.FEES}
              </p>

              <div className="flex items-center justify-start gap-2">
                {item.APPOINTMENT.STATUS === "COMPLETED" ? (
                  <StatusBadge status="COMPLETED" />
                ) : (
                  <button
                    onClick={() =>
                      cancelAppointment(item.APPOINTMENT.APPOINTMENT_ID)
                    }
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                    title="Cancel appointment"
                  >
                    <img
                      className="w-6 h-6 opacity-60 group-hover:opacity-100"
                      src={assets.cancel_icon}
                      alt="Cancel"
                    />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllAppointments;
