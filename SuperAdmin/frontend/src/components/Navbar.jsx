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
        <div className="flex justify-between items-center px-3 sm:px-6 md:px-10 py-3 border-b bg-white shadow-sm">
            <div className="flex items-center gap-1 sm:gap-2">
                {/* Logo plus petit sur mobile, taille normale sur grand écran */}
                <img 
                    className="h-8 sm:h-10 w-auto cursor-pointer" 
                    src={assets.logo} 
                    alt="Logo" 
                />
                
                {/* Badge avec taille de texte adaptative */}
                <div className="border px-1.5 sm:px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">
                    <span className="text-xs sm:text-sm whitespace-nowrap">Super Admin</span>
                </div>
            </div>
            
            {/* Bouton de déconnexion avec taille adaptative */}
            <button
                onClick={logout}
                className="bg-primary text-white text-xs sm:text-sm px-4 sm:px-6 md:px-10 py-1.5 sm:py-2 rounded-full hover:bg-opacity-90 transition-colors"
            >
                Logout
            </button>
        </div>
    );
};

export default Navbar