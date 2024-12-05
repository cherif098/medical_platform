import React from "react";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold">
            <span className="text-gray-400">ABOUT</span>
            <span className="text-gray-800 ml-2">US</span>
          </h1>
          <div className="w-20 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Main Content Section */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 mb-24">
          {/* Image Container */}
          <div className="w-full md:w-1/2 lg:w-2/5 relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-5 group-hover:opacity-10 transition duration-500"></div>
            <img
              className="w-full rounded-lg shadow-lg relative transform transition duration-500 group-hover:scale-[1.02]"
              src={assets.about_image}
              alt="About J-KOC Medical"
            />
          </div>

          {/* Text Content */}
          <div className="w-full md:w-1/2 lg:w-3/5 space-y-8">
            <p className="text-gray-600 leading-relaxed">
              Welcome to J-KOC Medical, your trusted partner in managing your
              healthcare needs conveniently and efficiently. At Prescripto, we
              understand the challenges individuals face when it comes to
              scheduling doctor appointments and managing their health records.
            </p>
            <p className="text-gray-600 leading-relaxed">
              J-KOC is committed to excellence in healthcare technology. We
              continuously strive to enhance our platform, integrating the latest
              advancements to improve user experience and deliver superior
              service. Whether you're booking your first appointment or managing
              ongoing care, Prescripto is here to support you every step of the
              way.
            </p>
            <div className="pt-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-8 h-1 bg-blue-500 rounded-full mr-3"></span>
                Our Vision
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Our vision at J-KOC is to create a seamless healthcare
                experience for every user. We aim to bridge the gap between patients
                and healthcare providers, making it easier for you to access the
                care you need, when you need it.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold mb-12 flex items-center">
            <span className="text-gray-400">WHY</span>
            <span className="text-gray-800 ml-2">CHOOSE US</span>
            <span className="w-20 h-1 bg-blue-500 ml-6 rounded-full"></span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Efficiency",
                description: "Streamlined appointment scheduling that fits into your busy lifestyle."
              },
              {
                title: "Convenience",
                description: "Access to a network of trusted healthcare professionals in your area."
              },
              {
                title: "Personalization",
                description: "Tailored recommendations and reminders to help you stay on top of your health."
              }
            ].map((item, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-8 sm:p-10 h-full flex flex-col">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-white transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;