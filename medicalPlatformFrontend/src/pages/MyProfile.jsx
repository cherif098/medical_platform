import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const MyProfile = () => {
  const { patientData, setPatientData, token, backendUrl, loadPatientData } =
    useContext(AppContext);

  const [isEdit, setIsEdit] = useState(true);
  const [IMAGE, setImage] = useState(false);

  const updatePatientProfileData = async () => {
    try {
      const formData = new FormData();
      formData.append("EMAIL", patientData.EMAIL);
      formData.append("NAME", patientData.NAME);
      formData.append("DATE_OF_BIRTH", patientData.DATE_OF_BIRTH);
      formData.append("PHONE", patientData.PHONE);
      formData.append("ADRESSE", patientData.ADRESSE);
      formData.append("GENDER", patientData.GENDER);
      IMAGE && formData.append("IMAGE", IMAGE);

      const { data } = await axios.post(
        backendUrl + "/api/patient/update-profile",
        formData,
        {
          headers: { token },
        }
      );
      if (data.success) {
        toast.success(data.message);
        await loadPatientData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  if (!patientData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    patientData && (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 my-8">
        <div className="flex flex-col items-center">
          {isEdit ? (
            <label htmlFor="IMAGE" className="group relative cursor-pointer">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-blue-100 hover:border-blue-300 transition-all">
                <img
                  className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                  src={IMAGE ? URL.createObjectURL(IMAGE) : patientData.IMAGE}
                  alt=""
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <img
                    className="w-12 h-12"
                    src={IMAGE ? "" : assets.upload_icon}
                    alt=""
                  />
                </div>
              </div>
              <input
                onChange={(e) => setImage(e.target.files[0])}
                type="file"
                id="IMAGE"
                className="hidden"
              />
            </label>
          ) : (
            <img 
              className="w-40 h-40 rounded-full object-cover border-4 border-blue-100" 
              src={patientData.IMAGE} 
              alt="" 
            />
          )}

          {isEdit ? (
            <input
              className="mt-6 text-4xl font-bold text-gray-800 bg-transparent border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none text-center"
              type="text"
              value={patientData.NAME}
              onChange={(e) =>
                setPatientData((prev) => ({ ...prev, NAME: e.target.value }))
              }
            />
          ) : (
            <h1 className="mt-6 text-4xl font-bold text-gray-800">{patientData.NAME}</h1>
          )}
        </div>

        <div className="mt-12 space-y-8">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-blue-600 border-b pb-2">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1 text-blue-500">{patientData.EMAIL}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone</label>
                {isEdit ? (
                  <input
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    type="text"
                    value={patientData.PHONE}
                    onChange={(e) =>
                      setPatientData((prev) => ({ ...prev, PHONE: e.target.value }))
                    }
                  />
                ) : (
                  <p className="mt-1 text-blue-500">{patientData.PHONE}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600">Address</label>
                {isEdit ? (
                  <input
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    type="text"
                    value={patientData.ADRESSE}
                    onChange={(e) =>
                      setPatientData((prev) => ({ ...prev, ADRESSE: e.target.value }))
                    }
                  />
                ) : (
                  <p className="mt-1 text-gray-700">{patientData.ADRESSE}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-blue-600 border-b pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Gender</label>
                {isEdit ? (
                  <select
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={patientData.GENDER}
                    onChange={(e) =>
                      setPatientData((prev) => ({ ...prev, GENDER: e.target.value }))
                    }
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Others">Others</option>
                  </select>
                ) : (
                  <p className="mt-1 text-gray-700">{patientData.GENDER}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Birthday</label>
                {isEdit ? (
                  <input
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    type="date"
                    value={patientData.DATE_OF_BIRTH}
                    onChange={(e) =>
                      setPatientData((prev) => ({
                        ...prev,
                        DATE_OF_BIRTH: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <p className="mt-1 text-gray-700">{patientData.DATE_OF_BIRTH}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          {isEdit ? (
            <button
              className="px-8 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={updatePatientProfileData}
            >
              Save Information
            </button>
          ) : (
            <button
              className="px-8 py-3 border-2 border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => setIsEdit(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    )
  );
};

export default MyProfile;