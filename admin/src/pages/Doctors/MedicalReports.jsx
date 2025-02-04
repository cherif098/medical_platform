import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import PatientSelector from "../../components/PatientSelector";
import ReportsList from "../../components/ReportsList";
import {
  FilePlus,
  Search,
  Clock,
  UserCircle,
  FileText,
  AlertCircle,
} from "lucide-react";

const MedicalReports = () => {
  const navigate = useNavigate();
  const { getPatients, patients, getPatientReports, reports } =
    useContext(DoctorContext);
  const { calculateAge } = useContext(AppContext);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getPatients();
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      getPatientReports(selectedPatient.PATIENT_ID);
    }
  }, [selectedPatient]);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setSearchTerm("");
  };

  const handleCreateReport = () => {
    if (selectedPatient) {
      navigate(`/medical-reports/create/${selectedPatient.PATIENT_ID}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Rapports Médicaux
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez les dossiers médicaux de vos patients
            </p>
          </div>

          {selectedPatient && (
            <button
              onClick={handleCreateReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors duration-200 flex items-center gap-2 shadow-sm"
            >
              <FilePlus className="w-5 h-5" />
              Nouveau Rapport
            </button>
          )}
        </div>

        {/* Section de sélection du patient */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-2 text-gray-800">
              <UserCircle className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Sélection du Patient</h2>
            </div>
          </div>

          <div className="p-6">
            {/* Barre de recherche */}
            <div className="relative mb-6">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher un patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 
                         focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              />
            </div>

            <PatientSelector
              patients={patients}
              selectedPatient={selectedPatient}
              onPatientSelect={handlePatientSelect}
              calculateAge={calculateAge}
            />
          </div>
        </div>

        {/* Section des rapports */}
        {selectedPatient && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-800">
                  <FileText className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">
                    Rapports de {selectedPatient.NAME}
                  </h2>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Dernier rapport: {reports[0]?.DATE || "Aucun"}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {reports.length > 0 ? (
                <ReportsList
                  reports={reports}
                  patientId={selectedPatient.PATIENT_ID}
                  navigate={navigate}
                />
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Aucun rapport disponible pour ce patient
                  </p>
                  <button
                    onClick={handleCreateReport}
                    className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 
                             rounded-lg transition-colors duration-200 inline-flex items-center gap-2"
                  >
                    <FilePlus className="w-5 h-5" />
                    Créer le premier rapport
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedPatient && !isLoading && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <UserCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun patient sélectionné
            </h3>
            <p className="text-gray-600">
              Veuillez sélectionner un patient pour voir ses rapports médicaux
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalReports;