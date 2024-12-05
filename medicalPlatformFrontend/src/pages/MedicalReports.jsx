import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const ReportCard = ({ report, onClick,backendUrl }) => {

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: {
        className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        label: "Draft",
      },
      COMPLETED: {
        className: "bg-green-100 text-green-800 border border-green-200",
        label: "Completed",
      },
      PENDING: {
        className: "bg-blue-100 text-blue-800 border border-blue-200",
        label: "Pending",
      },
    };
    return (
      statusConfig[status] || {
        className: "bg-gray-100 text-gray-800",
        label: status,
      }
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const { className, label } = getStatusBadge(report.STATUS);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {report.CONSULTATION_REASON}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Dr. {report.DOCTOR_NAME} - {report.SPECIALTY}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${className}`}
        >
          {label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Consultation Date</p>
          <p className="text-sm font-medium">
            {formatDate(report.CONSULTATION_DATE)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Primary Diagnosis</p>
          <p className="text-sm font-medium">
            {report.PRIMARY_DIAGNOSIS || "Not specified"}
          </p>
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClick}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Details
            </button>
            <button
              onClick={() =>
                window.open(
                  `${backendUrl}/api/reports/patient-report/${report.REPORT_ID}/pdf`,
                  "_blank"
                )
              }
              className="text-purple-600 hover:text-purple-800 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              Download PDF
            </button>
          </div>
          <span className="text-sm text-gray-500">
            {formatDate(report.CREATED_AT)}
          </span>
        </div>
      </div>
    </div>
  );
};

const MedicalReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token, backendUrl } = useContext(AppContext);
  console.log(token);
  useEffect(() => {
    const fetchReports = async () => {
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${backendUrl}/api/reports/patient-reports`,
          {
            headers: { token },
          }
        );

        console.log("API Response:", response.data); // Pour voir la structure exacte

        if (response.data.success) {
          // Vérifions où se trouvent les données
          const reportsData = response.data.reports || response.data.data;
          setReports(reportsData || []);
          console.log("Reports set:", reportsData);
        } else {
          throw new Error(response.data.message || "Failed to fetch reports");
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError(err.message);
        toast.error("Failed to load medical reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token, backendUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your medical reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Medical Reports
          </h1>
          <p className="mt-2 text-gray-600">
            View and download your complete medical history
          </p>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Reports Yet
            </h3>
            <p className="text-gray-600">
              You don't have any medical reports at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <ReportCard
                key={report.REPORT_ID}
                report={report}
                backendUrl={backendUrl}
                onClick={() => navigate(`/report-details/${report.REPORT_ID}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalReports;
