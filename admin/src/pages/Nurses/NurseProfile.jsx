import React, { useContext, useEffect, useState } from "react";
import { NurseContext } from "../../context/NurseContext";
import { toast } from "react-toastify";
import {
  MapPin,
  Award,
  Phone,
  Mail,
  Edit2,
  Save,
  User2,
} from "lucide-react";

const NurseProfile = () => {
  const {
    nToken,
    profileData,
    fetchNurseProfile,
    updateNurseProfile,
  } = useContext(NurseContext);

  // États locaux
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editableProfileData, setEditableProfileData] = useState(null);

  useEffect(() => {
    if (profileData) {
      setEditableProfileData({ ...profileData });
    }
  }, [profileData]);

  // Récupère le profil 
  useEffect(() => {
    if (nToken) {
      fetchNurseProfile();
    }
  }, [nToken]);

  //  enregistrer les modifications
  const saveProfile = async () => {
    try {
      setIsLoading(true);
      const updatedData = {
        EMAIL: editableProfileData.EMAIL,
        PHONE: editableProfileData.PHONE,
        ADRESSE: editableProfileData.ADRESSE,
        ABOUT: editableProfileData.ABOUT,
      };

      const response = await updateNurseProfile(updatedData);

      if (response.success) {
        toast.success("Profil mis à jour avec succès");
        setIsEdit(false); 
      } else {
        toast.error(response.message || "Échec de la mise à jour du profil");
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  if (!editableProfileData) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-[20px] shadow-sm overflow-hidden mb-6 relative">
          <div className="bg-primary/10 h-48 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('path/to/pattern.svg')] opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
          </div>

          <div className="px-8 pb-8 -mt-20 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end sm:space-x-8">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={editableProfileData.IMAGE || "default-image.png"}
                    alt={editableProfileData.NAME}
                    className="w-40 h-40 object-cover"
                  />
                </div>
              </div>

              <div className="mt-6 sm:mt-0 text-center sm:text-left flex-1">
                <h2 className="text-xl font-semibold text-blue-600 mb-1">🩺 Nurse</h2>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {editableProfileData.NAME}
                </h1>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Award className="w-4 h-4" />
                    {editableProfileData.EXPERIENCE || 0} ans d'expérience
                  </span>
                </div>
              </div>

              <button
                onClick={() => (isEdit ? saveProfile() : setIsEdit(true))}
                disabled={isLoading}
                className={`mt-6 sm:mt-0 px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all
                  ${
                    isEdit
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-primary hover:bg-primary/90 text-white"
                  }`}
              >
                {isLoading ? (
                  <span className="animate-spin">⌛</span>
                ) : isEdit ? (
                  <>
                    <Save className="w-4 h-4" /> Enregistrer
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" /> Modifier
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* À propos */}
          <div className="bg-white rounded-[20px] shadow-sm p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User2 className="w-5 h-5 text-primary" /> À propos
            </h2>
            {isEdit ? (
              <textarea
                value={editableProfileData.ABOUT || ""}
                onChange={(e) =>
                  setEditableProfileData((prev) => ({
                    ...prev,
                    ABOUT: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
              ></textarea>
            ) : (
              <p className="text-gray-600 leading-relaxed">
                {editableProfileData.ABOUT || "Aucune information"}
              </p>
            )}
          </div>

          {/* Adresse */}
          <div className="bg-white rounded-[20px] shadow-sm p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Adresse
            </h2>
            {isEdit ? (
              <input
                type="text"
                value={editableProfileData.ADRESSE || ""}
                onChange={(e) =>
                  setEditableProfileData((prev) => ({
                    ...prev,
                    ADRESSE: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            ) : (
              <p className="text-gray-600">{editableProfileData.ADRESSE || "Non spécifié"}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Email */}
          <div className="bg-white rounded-[20px] shadow-sm p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> Email
            </h2>
            {isEdit ? (
              <input
                type="email"
                value={editableProfileData.EMAIL || ""}
                onChange={(e) =>
                  setEditableProfileData((prev) => ({
                    ...prev,
                    EMAIL: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            ) : (
              <p className="text-gray-600">{editableProfileData.EMAIL || "Non spécifié"}</p>
            )}
          </div>

          {/* Téléphone */}
          <div className="bg-white rounded-[20px] shadow-sm p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" /> Téléphone
            </h2>
            {isEdit ? (
              <input
                type="tel"
                value={editableProfileData.PHONE || ""}
                onChange={(e) =>
                  setEditableProfileData((prev) => ({
                    ...prev,
                    PHONE: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            ) : (
              <p className="text-gray-600">{editableProfileData.PHONE || "Non spécifié"}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseProfile;
