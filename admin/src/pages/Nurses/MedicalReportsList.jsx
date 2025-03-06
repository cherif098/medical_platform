import React, { useContext, useEffect, useState, useRef } from "react";
import { NurseContext } from "../../context/NurseContext";
import ReportsList from "../../components/ReportsList";
import { AlertCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MedicalReportsList = () => {
  const navigate = useNavigate();
  const { patients, fetchPatientsList, patientReports, getPatientReports, downloadNurseReportPDF} = useContext(NurseContext);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filteredPatients, setFilteredPatients] = useState([]); 
  const [selectedPatient, setSelectedPatient] = useState(null);
  const reportsSectionRef = useRef(null);

  useEffect(() => {
    fetchPatientsList();
    const storedPatient = localStorage.getItem("selectedPatient");
    if (storedPatient) {
      const parsedPatient = JSON.parse(storedPatient);
      setSelectedPatient(parsedPatient);
      getPatientReports(parsedPatient.PATIENT_ID);
    }
  }, []);
  
  useEffect(() => {
    if (patients && patients.length > 0) {
      setFilteredPatients(
        patients.filter((patient) =>
          patient.NAME.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [patients, searchTerm]);

  const handlePatientSelect = (patient, event) => {
    event.stopPropagation(); 
    setSelectedPatient(patient);
    localStorage.setItem("selectedPatient", JSON.stringify(patient));
  
    getPatientReports(patient.PATIENT_ID);
    
    setTimeout(() => {
      if (reportsSectionRef.current) {
        reportsSectionRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 300);
  };
  

  const handleOutsideClick = () => {
    setSelectedPatient(null); 
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50" onClick={handleOutsideClick}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Medical Reports</h1>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Total Patients</p>
          <p className="text-2xl font-bold text-indigo-600">{filteredPatients?.length || 0}</p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search patients by name"
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none text-gray-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Liste des patients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <div
              key={patient.PATIENT_ID}
              className={`bg-white rounded-lg shadow-sm transition-all duration-300 border p-4 cursor-pointer 
                ${selectedPatient?.PATIENT_ID === patient.PATIENT_ID ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-blue-300 hover:bg-gray-50"}`}
              onClick={(e) => handlePatientSelect(patient, e)}
            >
              <div className="relative flex justify-center mb-4">
                <img src={patient.IMAGE || "default-patient.jpg"} alt={patient.NAME} className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{patient.NAME}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  Date of Birth:{" "}
                  <span className="text-indigo-600 font-medium">
                    {patient.DATE_OF_BIRTH ? new Date(patient.DATE_OF_BIRTH).toLocaleDateString() : "N/A"}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Gender: <span className="text-indigo-600 font-medium">{patient.GENDER || "N/A"}</span>                 
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-600 text-lg">No patients found</p>
          </div>
        )}
      </div>

      {/* Affichage des rapports du patient sélectionné */}
      {selectedPatient && (
        <div className="mt-12" ref={reportsSectionRef} onClick={(e) => e.stopPropagation()}>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-gray-700" />
            {selectedPatient.NAME}'s reports
          </h2>
          <style>
            {`
              .text-green-600, .text-red-600, .create-first-report {
                display: none !important;
              }
            `}
          </style>

          <ReportsList
            reports={patientReports}
            patientId={selectedPatient.PATIENT_ID}
            navigate={(url) => {
              const reportId = url.split("/").pop();
              navigate(`/view-report/${reportId}`);
            }}
            hideCreateButton={true} 
            onDownloadPDF={(reportId) => downloadNurseReportPDF(reportId, selectedPatient.NAME)}
            userRole="Nurse"
          />
        </div>
      )}

      {!selectedPatient && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm mt-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 text-lg">Please select a patient to view reports</p>
        </div>
      )}
    </div>
  );
};

export default MedicalReportsList;
