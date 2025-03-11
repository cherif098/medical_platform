import React, { useContext, useEffect } from "react";
import { AdminContext } from "../context/AdminContext";
import { Building, RefreshCw } from "lucide-react";

const HospitalSelector = () => {
  const {
    isSuperAdmin,
    hospitals,
    fetchHospitals,
    hospitalId,
    hospitalName,
    switchHospital,
    isLoading,
  } = useContext(AdminContext);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchHospitals();
    }
  }, [isSuperAdmin, fetchHospitals]);

  // If not super admin, just display current hospital
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100">
        <Building className="w-5 h-5 text-primary" />
        <div className="text-sm">
          <span className="text-gray-500 mr-1">Hôpital:</span>
          <span className="font-medium">{hospitalName || "Non défini"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <select
          value={hospitalId || ""}
          onChange={(e) => switchHospital(e.target.value)}
          disabled={isLoading}
          className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <option value="" disabled>
            Sélectionner un hôpital
          </option>
          {hospitals.map((hospital) => (
            <option key={hospital.ID} value={hospital.ID}>
              {hospital.NAME}
            </option>
          ))}
        </select>
        <Building
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <button
          onClick={fetchHospitals}
          disabled={isLoading}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          title="Rafraîchir la liste"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
};

export default HospitalSelector;
