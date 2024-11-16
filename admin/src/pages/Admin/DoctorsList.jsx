import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">All Doctors</h1>
      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {Array.isArray(doctors) && doctors.length > 0 ? (
          doctors.map((item, index) => (
            <div
              className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer"
              key={index}
            >
              <img
                className="bg-indigo-50 group-hover:bg-primary transition-all duration-500"
                src={item.IMAGE}
                alt=""
              />
              <div className="p-4">
                <p className="text-neutral-800 text-lg font-medium">
                  {item.NAME}
                </p>
                <p className="text-zinc-600 text-sm">{item.SPECIALTY}</p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <input
                    onChange={() => changeAvailability(item.DOCTOR_LICENCE)}
                    type="checkbox"
                    checked={item.STATUS}
                  />
                  <p>Available</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No doctors available</p>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;
