import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl,getHeaders } =
    useContext(DoctorContext);
  const { currency } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const updateProfile = async () => {
    try {
        const updateData = {
            ADRESS_1: profileData.ADRESS_1,    
            ADRESS_2: profileData.ADRESS_2,    
            FEES: profileData.FEES,            
            STATUS: profileData.STATUS,         
        }
        
        const { data } = await axios.post(
            `${backendUrl}/api/doctor/update-profile`,
            updateData,
            getHeaders()
        );

        if (data.success) {
            toast.success(data.message);
            setIsEdit(false);
            getProfileData();
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        console.error('Update profile error:', error);
        toast.error(error.response?.data?.message || "Error updating profile");
    }
};

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  return (
    profileData && (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0 p-6">
              <img
                src={profileData.IMAGE}
                alt=""
                className="h-48 w-48 rounded-full object-cover border-4 border-blue-500 shadow-lg"
              />
            </div>
            <div className="p-8 w-full">
              {/* Doctor info: name, degree, experience */}
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {profileData.NAME}
              </p>
              <div className="flex items-center space-x-4 mb-6">
                <p className="text-lg text-gray-600">
                  {profileData.DEGREE} - {profileData.SPECIALTY}
                </p>
                <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium">
                  {profileData.EXPERIENCE} years experience
                </button>
              </div>

              {/* Doctor About */}
              <div className="mb-6">
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  ABOUT:
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {profileData.ABOUT}
                </p>
              </div>

              <p className="text-lg mb-6">
                Appointment fee:
                <span className="font-semibold text-blue-600 ml-2">
                  {currency}{" "}
                  {isEdit ? (
                    <input
                      type="number"
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          FEES: e.target.value,
                        }))
                      }
                      value={profileData.FEES}
                    />
                  ) : (
                    profileData.FEES
                  )}
                </span>
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="font-semibold text-gray-800 mb-2">Address:</p>
                <p className="text-gray-600">
                  {isEdit ? (
                    <input
                      type="text"
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          ADRESS_1: e.target.value,
                        }))
                      }
                      value={profileData.ADRESS_1}
                    />
                  ) : (
                    profileData.ADRESS_1
                  )}
                </p>
                <br />
                <p className="text-gray-600">
                  {isEdit ? (
                    <input
                      type="text"
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          ADRESS_2: e.target.value,
                        }))
                      }
                      value={profileData.ADRESS_2}
                    />
                  ) : (
                    profileData.ADRESS_2
                  )}
                </p>
              </div>

              <div className="flex items-center space-x-3 mb-6">
                <input
                  onChange={() =>
                    isEdit &&
                    setProfileData((prev) => ({
                      ...prev,
                      STATUS: !prev.STATUS,
                    }))
                  }
                  checked={profileData.STATUS}
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label className="text-gray-700 font-medium">Available</label>
              </div>

              {isEdit ? (
                <button
                  onClick={updateProfile}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setIsEdit(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default DoctorProfile;
