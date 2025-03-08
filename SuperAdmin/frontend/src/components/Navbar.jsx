import React, { useState, useContext } from 'react';
import { superAdminContext } from '../context/superAdminContext';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';

const Navbar = () => {

    const {saToken, setSAToken} = useContext(superAdminContext);
    const navigate = useNavigate();

    const logout = () => {
        navigate("/");
        saToken && setSAToken("");
        saToken && localStorage.removeItem("saToken");
      };

  return (
     
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
          <div className="flex items-center gap-2 text-sx">
            <img className="w-30 sm:w-40 cursor-pointer" src={assets.logo} alt="" />
            <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
              Super Admin
    
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-primary text-white text-sm px-10 py-2 rounded-full"
          >
            Logout
          </button>
        </div>
  )
}

export default Navbar