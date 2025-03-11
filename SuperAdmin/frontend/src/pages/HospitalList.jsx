import React, { useContext, useEffect, useState } from "react";
import { superAdminContext } from "../context/superAdminContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const HospitalList = () => {
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { saToken, backendUrl } = useContext(superAdminContext);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setIsLoading(true);
      
      if (!saToken) {
        toast.error("Jeton d'authentification manquant. Veuillez vous reconnecter.");
        setIsLoading(false);
        return;
      }
      
      const { data } = await axios.get(
        `${backendUrl}/api/superAdmin/get-hospitals`,
        {
          headers: { saToken }
        }
      );

      if (data && data.success) {
        setHospitals(data.hospitals);
      } else {
        toast.error(data.message || "Échec de la récupération des hôpitaux");
      }
    } catch (error) {
      console.error("Détails de l'erreur:", error);
      toast.error(error.response?.data?.message || "Échec de la récupération des hôpitaux");
    } finally {
      setIsLoading(false);
    }
  };

  const removeHospital = async (hospitalId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet hôpital?")) {
      return;
    }
    
    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/superAdmin/remove-hospital/${hospitalId}`,
        {
          headers: { saToken }
        }
      );

      if (data && data.success) {
        toast.success(data.message || "Hôpital supprimé avec succès");
        fetchHospitals(); // Actualiser la liste
      } else {
        toast.error(data.message || "Échec de la suppression de l'hôpital");
      }
    } catch (error) {
      console.error("Détails de l'erreur:", error);
      toast.error(error.response?.data?.message || "Échec de la suppression de l'hôpital");
    }
  };

  const approveHospital = async (hospitalId) => {
    try {
      console.log("Approbation de l'hôpital:", hospitalId);
      
      // Données à envoyer
      const statusData = { status: "Active" };
      console.log("Données envoyées:", statusData);
      
      const { data } = await axios.put(
        `${backendUrl}/api/superAdmin/update-hospital-status/${hospitalId}`,
        statusData,
        {
          headers: { 
            saToken,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Réponse reçue:", data);
      
      if (data && data.success) {
        toast.success("Hôpital approuvé avec succès");
        fetchHospitals(); // Actualiser la liste
      } else {
        toast.error(data.message || "Échec de l'approbation de l'hôpital");
      }
    } catch (error) {
      console.error("Détails de l'erreur:", error);
      
      // Afficher le message d'erreur du serveur s'il existe
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Échec de l'approbation de l'hôpital");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Liste des hôpitaux</h1>
          <p className="text-gray-500 mt-1">
            Gérer et surveiller les établissements médicaux
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600">Total des hôpitaux</p>
            <p className="text-2xl font-bold text-indigo-600">
              {hospitals.length}
            </p>
          </div>
          <Link 
            to="/add-hospital" 
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <span className="mr-2">+</span>
            Ajouter un hôpital
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_2fr_2fr_1fr_1fr_1fr] gap-4 py-4 px-6 bg-gray-50 border-b">
          <p className="text-sm font-medium text-gray-600">#</p>
          <p className="text-sm font-medium text-gray-600">Nom</p>
          <p className="text-sm font-medium text-gray-600">Adresse</p>
          <p className="text-sm font-medium text-gray-600">Contact</p>
          <p className="text-sm font-medium text-gray-600">Lits</p>
          <p className="text-sm font-medium text-gray-600">Statut</p>
          <p className="text-sm font-medium text-gray-600">Actions</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="divide-y max-h-[70vh] overflow-y-auto">
            {hospitals.length > 0 ? (
              hospitals.map((hospital, index) => (
                <div
                  key={index}
                  className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_2fr_2fr_1fr_1fr_1fr] items-center py-4 px-6 hover:bg-gray-50 transition-colors duration-150"
                >
                  <p className="max-sm:hidden text-gray-600">{index + 1}</p>

                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 text-indigo-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      {hospital.NAME ? hospital.NAME.charAt(0) : "?"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {hospital.NAME}
                      </p>
                      <p className="text-sm text-gray-500">
                        {hospital.EMAIL}
                      </p>
                    </div>
                  </div>

                  <div className="text-gray-600">
                    <p>{hospital.ADDRESS || "Non spécifié"}</p>
                  </div>

                  <div className="text-gray-600">
                    <p>{hospital.PHONE_NUMBER || "Non spécifié"}</p>
                  </div>

                  <p className="font-medium text-gray-800">
                    {hospital.TOTAL_BEDS || 0}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      hospital.SUBSCRIPTION_STATUS === "Active" 
                        ? "bg-green-100 text-green-800" 
                        : hospital.SUBSCRIPTION_STATUS === "Pending" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {hospital.SUBSCRIPTION_STATUS}
                    </span>
                    
                    {hospital.SUBSCRIPTION_STATUS === "Pending" && (
                      <button
                        onClick={() => approveHospital(hospital.ID)}
                        className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                        title="Approuver cet hôpital"
                      >
                        Approuver
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/edit-hospital/${hospital.ID}`}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier l'hôpital"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="w-5 h-5 text-blue-600" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                        />
                      </svg>
                    </Link>
                    <button
                      onClick={() => removeHospital(hospital.ID)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer l'hôpital"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="w-5 h-5 text-red-600" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-500">
                Aucun hôpital trouvé. Ajoutez votre premier hôpital en cliquant sur le bouton "Ajouter un hôpital".
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalList;