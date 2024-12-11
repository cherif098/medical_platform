import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Doctors = () => {
  const { speciality } = useParams();
  const { doctors } = useContext(AppContext);
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  const specialties = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatricians",
    "Neurologist",
    "Gastroenterologist",
  ];

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter((doc) => doc.SPECIALTY === speciality));
    } else {
      setFilterDoc(doctors);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [speciality, doctors]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <p className="text-gray-600 mb-8">
        Browse through the doctors specialist.
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filtres */}
        <div className="lg:w-1/4">
          <div className="sticky top-4">
            <button
              className="w-full lg:hidden mb-4 px-3 py-1 border rounded text-sm transition-all"
              onClick={() => setShowFilter(!showFilter)}
            >
              Filters
            </button>

            <div
              className={`flex flex-col gap-4 text-sm text-gray-600 ${
                showFilter ? "flex" : "hidden lg:flex"
              }`}
            >
              {specialties.map((spec) => (
                <p
                  key={spec}
                  onClick={() =>
                    spec === speciality
                      ? navigate("/doctors")
                      : navigate(`/doctors/${spec}`)
                  }
                  className={`w-full sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
                    speciality === spec ? "bg-indigo-100 text-black" : ""
                  }`}
                >
                  {spec}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Liste des médecins */}
        <div className="lg:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filterDoc.map((doctor, index) => (
              <div
                key={index}
                onClick={() => navigate(`/appointments/${doctor.DOCTOR_ID}`)}
                className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-[300px] bg-blue-50">
                  <img
                    src={doctor.IMAGE}
                    alt={doctor.NAME}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-green-500 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p>Disponible</p>
                  </div>

                  <h3 className="text-gray-900 text-lg font-medium mb-1">
                    Dr. {doctor.NAME}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {doctor.SPECIALTY}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="text-lg font-medium text-gray-900">
                      80€{" "}
                      <span className="text-sm text-gray-500">
                        / consultation
                      </span>
                    </div>
                    <button className="text-blue-600 font-medium hover:underline flex items-center">
                      Prendre RDV
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctors;
