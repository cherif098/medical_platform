import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  MapPin,
  Award,
  Briefcase,
  Edit2,
  Save,
  Clock,
  User2,
  Stethoscope,
} from "lucide-react";

const DoctorProfile = () => {
  const {
    dToken,
    profileData,
    setProfileData,
    getProfileData,
    backendUrl,
    getHeaders,
  } = useContext(DoctorContext);
  const { currency } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateProfile = async () => {
    try {
      setIsLoading(true);
      const updateData = {
        ADRESS_1: profileData.ADRESS_1,
        ADRESS_2: profileData.ADRESS_2,
        FEES: profileData.FEES,
        STATUS: profileData.STATUS,
      };

      const { data } = await axios.post(
        `${backendUrl}/api/doctor/update-profile`,
        updateData,
        getHeaders()
      );

      if (data.success) {
        toast.success("Profil mis à jour avec succès");
        setIsEdit(false);
        getProfileData();
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  if (!profileData) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* En-tête du profil */}
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
                    src={profileData.IMAGE}
                    alt={profileData.NAME}
                    className="w-40 h-40 object-cover"
                  />
                </div>
                <div
                  className={`absolute bottom-4 right-4 w-5 h-5 rounded-full border-4 border-white ${
                    profileData.STATUS ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
              </div>

              <div className="mt-6 sm:mt-0 text-center sm:text-left flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  <span className="text-primary font-medium">
                    {profileData.SPECIALTY}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profileData.NAME}
                </h1>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Award className="w-4 h-4" />
                    {profileData.DEGREE}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Briefcase className="w-4 h-4" />
                    {profileData.EXPERIENCE} ans d'expérience
                  </span>
                </div>
              </div>

              <button
                onClick={() => (isEdit ? updateProfile() : setIsEdit(true))}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* À propos */}
            <div className="bg-white rounded-[20px] shadow-sm p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User2 className="w-5 h-5 text-primary" />À propos
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {profileData.ABOUT}
              </p>
            </div>

            {/* Tarifs et disponibilité */}
            <div className="bg-white rounded-[20px] shadow-sm p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Disponibilité et Tarifs
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-gray-50/50 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Statut actuel</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={profileData.STATUS}
                        onChange={() =>
                          isEdit &&
                          setProfileData((prev) => ({
                            ...prev,
                            STATUS: !prev.STATUS,
                          }))
                        }
                        disabled={!isEdit}
                      />
                      <div
                        className={`w-11 h-6 bg-gray-200 rounded-full peer 
                        peer-focus:ring-4 peer-focus:ring-primary/20
                        peer-checked:after:translate-x-full after:content-[''] 
                        after:absolute after:top-[2px] after:left-[2px] 
                        after:bg-white after:rounded-full after:h-5 after:w-5 
                        after:transition-all ${
                          profileData.STATUS ? "peer-checked:bg-primary" : ""
                        }`}
                      ></div>
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tarif consultation</span>
                    <div className="flex items-center gap-2">
                      {isEdit ? (
                        <input
                          type="number"
                          value={profileData.FEES}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              FEES: e.target.value,
                            }))
                          }
                          className="w-24 px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      ) : (
                        <span className="font-semibold text-primary text-lg">
                          {profileData.FEES}
                        </span>
                      )}
                      <span className="text-gray-600">{currency}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="space-y-6">
            {/* Adresse */}
            <div className="bg-white rounded-[20px] shadow-sm p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Adresse du cabinet
              </h2>
              {isEdit ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">
                      Ligne 1
                    </label>
                    <input
                      type="text"
                      value={profileData.ADRESS_1}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          ADRESS_1: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">
                      Ligne 2
                    </label>
                    <input
                      type="text"
                      value={profileData.ADRESS_2}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          ADRESS_2: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-gray-600">
                  <p>{profileData.ADRESS_1}</p>
                  <p>{profileData.ADRESS_2}</p>
                </div>
              )}
            </div>

            {/* Horaires de consultation */}
            <div className="bg-white rounded-[20px] shadow-sm p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Horaires de consultation
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Lundi - Vendredi</span>
                  <span className="text-gray-900">09:00 - 17:00</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Samedi</span>
                  <span className="text-gray-900">09:00 - 12:00</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Dimanche</span>
                  <span className="text-primary font-medium">Fermé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
