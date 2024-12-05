import React from "react";
import { assets } from "../assets/assets";

const Contact = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold">
            <span className="text-gray-400">CONTACT</span>
            <span className="text-gray-800 ml-2">US</span>
          </h1>
          <div className="w-20 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          {/* Image Container */}
          <div className="w-full md:w-1/2 relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-5 group-hover:opacity-10 transition duration-500"></div>
            <img
              className="w-full rounded-lg shadow-lg relative transform transition duration-500 group-hover:scale-[1.02]"
              src={assets.contact_image}
              alt="Contact"
            />
          </div>

          {/* Contact Information */}
          <div className="w-full md:w-1/2 space-y-8">
            {/* Office Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="w-8 h-1 bg-blue-500 rounded-full mr-3"></span>
                Our Office
              </h2>
              <div className="space-y-3 pl-11">
                <p className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  xxx Rue xxx, Montreal, QC
                </p>
                <p className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  (438) 283‑1632
                </p>
                <p className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  KOC@gmail.com
                </p>
              </div>
            </div>

            {/* Careers Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="w-8 h-1 bg-blue-500 rounded-full mr-3"></span>
                Careers at J-KOC
              </h2>
              <div className="pl-11">
                <p className="text-gray-600 mb-6">
                  Learn more about our teams and job openings.
                </p>
                <button className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-medium transition-all duration-300 ease-in-out">
                  <span className="absolute inset-0 w-full h-full rounded-full border-2 border-black group-hover:border-blue-500"></span>
                  <span className="absolute inset-0 w-full h-full transform scale-x-0 rounded-full bg-blue-500 transition-transform group-hover:scale-x-100 origin-center"></span>
                  <span className="relative text-black group-hover:text-white transition-colors duration-300">
                    Explore Jobs
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;