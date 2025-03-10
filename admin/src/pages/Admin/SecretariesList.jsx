import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";

const SecretariesList = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [secretaries, setSecretaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (aToken) {
      fetchSecretaries();
    }
  }, [aToken]);

  const fetchSecretaries = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        backendUrl + "/api/admin/all-secretaries",
        {
          headers: { aToken },
        }
      );

      if (data.success) {
        setSecretaries(data.data);
      } else {
        toast.error(data.message || "Failed to fetch secretaries");
      }
    } catch (error) {
      console.error("Error fetching secretaries:", error);
      toast.error(
        error.message || "An error occurred while fetching secretaries"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (secretaryId, secretaryName) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${secretaryName} from the system?`
      )
    ) {
      try {
        const { data } = await axios.delete(
          `${backendUrl}/api/admin/delete-secretary/${secretaryId}`,
          { headers: { aToken } }
        );

        if (data.success) {
          toast.success(data.message);
          fetchSecretaries(); // Refresh the list
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error deleting secretary:", error);
        toast.error(
          error.response?.data?.message || "Error deleting secretary"
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Administrative Staff
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your hospital's secretaries
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600">Total Secretaries</p>
          <p className="text-2xl font-bold text-indigo-600">
            {secretaries?.length || 0}
          </p>
        </div>
      </div>

      {/* Secretaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.isArray(secretaries) && secretaries.length > 0 ? (
          secretaries.map((secretary) => (
            <div
              key={secretary.SECRETARY_ID}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative">
                <div className="aspect-w-4 aspect-h-3 overflow-hidden">
                  <img
                    src={secretary.IMAGE}
                    alt={secretary.NAME}
                    className="w-full h-40 object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      secretary.STATUS
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {secretary.STATUS ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Secretary Info */}
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {secretary.NAME}
                </h3>

                <div className="text-gray-600 text-sm space-y-2">
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {secretary.EMAIL}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {secretary.PHONE || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Experience:</span>{" "}
                    {secretary.EXPERIENCE} years
                  </p>
                </div>

                <div className="mt-3 text-sm text-gray-500 line-clamp-2">
                  {secretary.ABOUT || "No description available."}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() =>
                      handleDelete(secretary.SECRETARY_ID, secretary.NAME)
                    }
                    className="px-4 py-2 w-full bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">No secretaries available</p>
            <p className="text-gray-400 text-sm mt-1">
              Add new secretaries to see them here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretariesList;
