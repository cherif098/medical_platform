import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Hospital, Handshake, ScrollText, ChevronRight, ChevronLeft } from 'lucide-react';

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`relative min-h-screen bg-white border-r border-gray-100 shadow-sm transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Bouton pour réduire/étendre la sidebar */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-10 bg-white border border-gray-200 rounded-full p-1 shadow-md z-10 hover:bg-gray-50"
      >
        {collapsed ? 
          <ChevronRight className="w-4 h-4 text-gray-600" /> : 
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        }
      </button>
      
      <div className="pt-4">
        <ul className="text-gray-600 mt-5 flex flex-col">
          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-4 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/dashboard"
          >
            <LayoutDashboard className="w-5 h-5 min-w-5" />
            <p className={`transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              Dashboard
            </p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-4 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/add-hospital"
          >
            <Hospital className="w-5 h-5 min-w-5" />
            <p className={`transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              Add Hospital
            </p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-4 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/hospital-list"
          >
            <ScrollText className="w-5 h-5 min-w-5" />
            <p className={`transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              Hospital List
            </p>
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `flex items-center gap-3 py-3.5 px-4 cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary/10 border-r-4 border-primary text-primary font-medium"
                  : "hover:bg-gray-50"
              }`
            }
            to="/partnership"
          >
            <Handshake className="w-5 h-5 min-w-5" />
            <p className={`transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
              Partnership
            </p>
          </NavLink>
        </ul>
      </div>
    </div>
  );
};

export default SideBar;