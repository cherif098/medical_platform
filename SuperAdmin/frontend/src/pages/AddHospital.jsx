import React, { useContext, useState } from "react";
import { superAdminContext } from "../context/superAdminContext";
import { toast } from "react-toastify";
import axios from "axios";

const AddHospital = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [totalBeds, setTotalBeds] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("Active");
  const [subscriptionId, setSubscriptionId] = useState("");

  const { saToken, backendUrl } = useContext(superAdminContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      console.log("Utilisation de l'URL backend:", backendUrl);
      console.log("Token utilisé:", saToken);
      
      if (!saToken) {
        toast.error("Jeton d'authentification manquant. Veuillez vous reconnecter.");
        return;
      }
      
      const formData = new FormData();
      
      formData.append("NAME", name);
      formData.append("EMAIL", email);
      formData.append("PASSWORD", password);
      formData.append("ADDRESS", address);
      formData.append("PHONE_NUMBER", phoneNumber);
      formData.append("TOTAL_BEDS", totalBeds);
      formData.append("SUBSCRIPTION_STATUS", subscriptionStatus);
      
      if (subscriptionId) {
        formData.append("SUBSCRIPTION_ID", subscriptionId);
      }

      const { data } = await axios.post(
        `${backendUrl}/api/superAdmin/add-hospital`,
        formData,
        {
          headers: { 
            saToken: saToken
          },
        }
      );

      if (data && data.success) {
        toast.success(data.message);
        // Réinitialisation du formulaire
        setName("");
        setEmail("");
        setPassword("");
        setAddress("");
        setPhoneNumber("");
        setTotalBeds("");
        setSubscriptionStatus("Active");
        setSubscriptionId("");
      } else {
        toast.error(data.message || "Échec de l'ajout de l'hôpital");
      }
    } catch (err) {
      console.error("Détails de l'erreur:", err);
      toast.error(err.response?.data?.message || "Échec de l'ajout de l'hôpital");
    }
  };

  const subscriptionStatuses = [
    "Active",
    "Pending",
    "Expired",
    "Canceled"
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ajouter un nouvel hôpital</h1>
        <p className="text-gray-500 mt-1">
          Remplissez les détails pour ajouter un nouvel établissement médical
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
                value={name}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="contact@hopital.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={phoneNumber}
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
                value={address}
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
                value={totalBeds}
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
                  value={subscriptionStatus}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID d'abonnement
                </label>
                <input
                  type="text"
                  value={subscriptionId}
                  onChange={(e) => setSubscriptionId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Optionnel"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all duration-200"
          >
            Ajouter l'hôpital
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddHospital;