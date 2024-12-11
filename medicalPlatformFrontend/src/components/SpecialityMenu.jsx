import React from "react";
import { specialityData } from "../assets/assets";
import { Link } from "react-router-dom";

const SpecialityMenu = () => {
  return (
    <section
      className="py-16 bg-gradient-to-b from-white to-blue-50"
      id="speciality"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Find by Speciality
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Simply browse through our extensive list of trusted doctors,
            schedule your appointment hassle-free.
          </p>
        </div>

        <div className="relative">
          {/* Gradient fade for scrollable content */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-blue-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-blue-50 to-transparent z-10 pointer-events-none" />

          <div className="flex justify-start sm:justify-center gap-8 pt-5 w-full overflow-x-auto pb-4 px-4 scrollbar-hide">
            {specialityData.map((item, index) => (
              <Link
                onClick={() => scrollTo(0, 0)}
                className="group flex flex-col items-center min-w-[120px] transform transition-all duration-300 hover:-translate-y-2"
                key={index}
                to={`/doctors/${item.speciality}`}
              >
                <div className="relative mb-4 p-4 bg-white rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300" />
                  <img
                    className="w-16 sm:w-20 h-16 sm:h-20 object-contain transform group-hover:scale-110 transition-transform duration-300"
                    src={item.image}
                    alt={item.speciality}
                  />
                </div>
                <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                  {item.speciality}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialityMenu;
