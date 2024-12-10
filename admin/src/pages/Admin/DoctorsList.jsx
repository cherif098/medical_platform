import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability, deleteDoctor } =
    useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  const handleDelete = async (doctorId, doctorName) => {
    if (
      window.confirm(
        `Are you sure you want to remove Dr. ${doctorName} from the system?`
      )
    ) {
      await deleteDoctor(doctorId);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Medical Staff</h1>
          <p className="text-gray-500 mt-1">Manage your hospital's doctors</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Total Doctors</p>
          <p className="text-2xl font-bold text-indigo-600">
            {doctors?.length || 0}
          </p>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.isArray(doctors) && doctors.length > 0 ? (
          doctors.map((doctor) => (
            <div
              key={doctor.DOCTOR_ID}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative">
                <div className="aspect-w-4 aspect-h-3 overflow-hidden">
                  <img
                    src={doctor.IMAGE}
                    alt={doctor.NAME}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doctor.STATUS
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {doctor.STATUS ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Dr. {doctor.NAME}
                </h3>

                <p className="text-indigo-600 text-sm font-medium mb-3">
                  {doctor.SPECIALTY}
                </p>

                <p className="text-gray-500 text-sm mb-4">{doctor.EMAIL}</p>

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => changeAvailability(doctor.DOCTOR_LICENCE)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      doctor.STATUS
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-red-50 text-red-700 hover:bg-red-100"
                    }`}
                  >
                    {doctor.STATUS ? "Available" : "Unavailable"}
                  </button>

                  <button
                    onClick={() => handleDelete(doctor.DOCTOR_ID, doctor.NAME)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">No doctors available</p>
            <p className="text-gray-400 text-sm mt-1">
              Add new doctors to see them here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;
