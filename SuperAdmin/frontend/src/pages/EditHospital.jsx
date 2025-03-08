import React, { useContext, useState, useEffect } from "react";
import { superAdminContext } from "../context/superAdminContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditHospital = () => {
  const [NAME, setName] = useState("");
  const [EMAIL, setEmail] = useState("");
  const [ADDRESS, setAddress] = useState("");
  const [PHONE_NUMBER, setPhoneNumber] = useState("");
  const [TOTAL_BEDS, setTotalBeds] = useState("");
  const [SUBSCRIPTION_STATUS, setSubscriptionStatus] = useState("Active");
  const [SUBSCRIPTION_ID, setSubscriptionId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { saToken, backendUrl } = useContext(superAdminContext);
  const { ID } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHospitalDetails();
  }, [ID]);

  const fetchHospitalDetails = async () => {
    try {
      setIsLoading(true);
      
      if (!saToken) {
        toast.error("Jeton d'authentification manquant. Veuillez vous reconnecter.");
        navigate("/login");
        return;
      }
      
      const { data } = await axios.get(
        `${backendUrl}/api/superAdmin/get-hospital/${ID}`,
        {
          headers: { saToken }
        }
      );

      if (data && data.success && data.hospital) {
        const hospital = data.hospital;
        setName(hospital.NAME || "");
        setEmail(hospital.EMAIL || "");
        setAddress(hospital.ADDRESS || "");
        setPhoneNumber(hospital.PHONE_NUMBER || "");
        setTotalBeds(hospital.TOTAL_BEDS || "");
        setSubscriptionStatus(hospital.SUBSCRIPTION_STATUS || "Active");
        setSubscriptionId(hospital.SUBSCRIPTION_ID || "");
      } else {
        toast.error("Impossible de récupérer les informations de l'hôpital");
        navigate("/hospitals");
      }
    } catch (error) {
      console.error("Détails de l'erreur:", error);
      toast.error(error.response?.data?.message || "Échec de la récupération des détails de l'hôpital");
      navigate("/hospitals");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (!saToken) {
        toast.error("Jeton d'authentification manquant. Veuillez vous reconnecter.");
        return;
      }
      
      const hospitalData = {
        NAME,
        EMAIL,
        ADDRESS,
        PHONE_NUMBER,
        TOTAL_BEDS: TOTAL_BEDS === '' ? 0 : parseInt(TOTAL_BEDS) || 0,
        SUBSCRIPTION_STATUS,
        SUBSCRIPTION_ID: SUBSCRIPTION_ID || ""
      };
      
      const { data } = await axios.put(
        `${backendUrl}/api/superAdmin/update-hospital/${ID}`,
        hospitalData,
        {
          headers: { 
            saToken,
            'Content-Type': 'application/json'
          },
        }
      );

      if (data && data.success) {
        toast.success(data.message || "Hôpital mis à jour avec succès");
        navigate("/hospital_list");
      } else {
        toast.error(data.message || "Échec de la mise à jour de l'hôpital");
      }
    } catch (err) {
      console.error("Détails de l'erreur:", err);
      toast.error(err.response?.data?.message || "Échec de la mise à jour de l'hôpital");
    }
  };

  const subscriptionStatuses = [
    "Active",
    "Pending",
    "Expired",
    "Canceled"
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Modifier l'hôpital</h1>
        <p className="text-gray-500 mt-1">
          Mettez à jour les informations de l'établissement médical
        </p>
      </div>

      <form
        onSubmit={onSubmitHandler}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        {/* Main Form Section */}
        <div className="p-6 grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Informations de base
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'hôpital
              </label>
              <input
                type="text"
                value={NAME}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="ex: Hôpital Général"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                value={EMAIL}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="contact@hopital.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={PHONE_NUMBER}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="+1 (123) 456-7890"
                required
              />
            </div>
          </div>

          {/* Facility Details */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Détails de l'établissement
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <textarea
                value={ADDRESS}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Adresse complète de l'hôpital"
                rows="3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre total de lits
              </label>
              <input
                type="number"
                value={TOTAL_BEDS}
                onChange={(e) => setTotalBeds(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="ex: 200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut de l'abonnement
                </label>
                <select
                  value={SUBSCRIPTION_STATUS}
                  onChange={(e) => setSubscriptionStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  {subscriptionStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <button
            type="button"
            onClick={() => navigate("/hospital-list")}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-200 transition-all duration-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            onClick={() => navigate("/hospital-list")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all duration-200"
          >
            Mettre à jour
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditHospital;