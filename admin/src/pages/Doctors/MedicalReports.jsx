import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import PatientSelector from "../../components/PatientSelector";
import ReportsList from "../../components/ReportsList";

const MedicalReports = () => {
  const navigate = useNavigate();
  const { getPatients, patients, getPatientReports, reports } =
    useContext(DoctorContext);
  const { calculateAge } = useContext(AppContext);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    getPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      getPatientReports(selectedPatient.PATIENT_ID);
    }
  }, [selectedPatient]);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleCreateReport = () => {
    if (selectedPatient) {
      navigate(`/medical-reports/create/${selectedPatient.PATIENT_ID}`);
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Medical Reports
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Select Patient
          </h2>
          <PatientSelector
            patients={patients}
            selectedPatient={selectedPatient}
            onPatientSelect={handlePatientSelect}
            calculateAge={calculateAge}
          />
        </div>

        {selectedPatient && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Reports for {selectedPatient.NAME}
              </h2>
              <button
                onClick={handleCreateReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                         transition-colors duration-200 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Report
              </button>
            </div>

            <ReportsList
              reports={reports}
              patientId={selectedPatient.PATIENT_ID}
              navigate={navigate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalReports;
