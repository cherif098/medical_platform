import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const SectionTitle = ({ children }) => (
  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
    {children}
  </h2>
);

const InfoField = ({ label, value, className = "" }) => (
  <div className={`mb-3 ${className}`}>
    <label className="text-sm font-medium text-gray-500">{label}</label>
    <div className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded-md">
      {value || "Not specified"}
    </div>
  </div>
);

const ReportDetails = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { token, backendUrl } = useContext(AppContext);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${backendUrl}/api/reports/patient-report/${reportId}`,
          {
            headers: { token },
          }
        );
        

        if (response.data) {
          setReport(response.data.reports);
          console.log(response.data)

        } else {
          throw new Error(response.data.message || "Failed to fetch report");
        }
      } catch (err) {
        console.error("Error fetching report:", err);
        setError(err.message);
        toast.error("Failed to load medical report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId, token, backendUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report details...</p>
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
            onClick={() => navigate("/medical-reports")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">📋</div>
          <p className="text-gray-600">Report not found</p>
          <button
            onClick={() => navigate("/medical-reports")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Medical Report
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Created on {formatDate(report.CREATED_AT)}
              </p>
            </div>
            <button
              onClick={() =>
                window.open(
                  `${backendUrl}/api/reports/patient-report/${reportId}/pdf`,
                  "_blank"
                )
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                     transition-colors flex items-center gap-2"
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
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Doctor Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <SectionTitle>👨‍⚕️ Doctor Information</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="Name" value={report.DOCTOR_NAME} />
              <InfoField label="Specialty" value={report.SPECIALTY} />
            </div>
          </div>

          {/* Consultation Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <SectionTitle>📅 Consultation Details</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField
                label="Date"
                value={formatDate(report.CONSULTATION_DATE)}
              />
              <InfoField
                label="Duration"
                value={`${report.CONSULTATION_DURATION} minutes`}
              />
              <InfoField
                label="Reason"
                value={report.CONSULTATION_REASON}
                className="md:col-span-2"
              />
            </div>
          </div>

          {/* Complaints and History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <SectionTitle>🔍 Complaints and History</SectionTitle>
            <InfoField label="Main Complaint" value={report.MAIN_COMPLAINT} />
            <InfoField
              label="Current Illness History"
              value={report.CURRENT_ILLNESS_HISTORY}
            />
          </div>

          {/* Vital Signs */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <SectionTitle>❤️ Vital Signs</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoField
                label="Temperature"
                value={report.TEMPERATURE && `${report.TEMPERATURE}°C`}
              />
              <InfoField label="Blood Pressure" value={report.BLOOD_PRESSURE} />
              <InfoField
                label="Heart Rate"
                value={report.HEART_RATE && `${report.HEART_RATE} bpm`}
              />
              <InfoField
                label="Respiratory Rate"
                value={
                  report.RESPIRATORY_RATE && `${report.RESPIRATORY_RATE}/min`
                }
              />
              <InfoField
                label="Oxygen Saturation"
                value={
                  report.OXYGEN_SATURATION && `${report.OXYGEN_SATURATION}%`
                }
              />
              <InfoField
                label="Weight"
                value={report.WEIGHT && `${report.WEIGHT} kg`}
              />
              <InfoField
                label="Height"
                value={report.HEIGHT && `${report.HEIGHT} cm`}
              />
              <InfoField label="BMI" value={report.BMI} />
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <SectionTitle>📚 Medical History</SectionTitle>
            <InfoField
              label="Personal History"
              value={report.PERSONAL_HISTORY}
            />
            <InfoField label="Family History" value={report.FAMILY_HISTORY} />
            <InfoField
              label="Lifestyle Habits"
              value={report.LIFESTYLE_HABITS}
            />
          </div>

          {/* Examination and Tests */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <SectionTitle>🔬 Examination and Tests</SectionTitle>
            <InfoField
              label="Physical Examination"
              value={report.PHYSICAL_EXAMINATION}
            />
            <InfoField label="Tests Performed" value={report.TESTS_PERFORMED} />
            <InfoField label="Test Results" value={report.TEST_RESULTS} />
          </div>

          {/* Diagnosis */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <SectionTitle>🏥 Diagnosis</SectionTitle>
            <InfoField
              label="Primary Diagnosis"
              value={report.PRIMARY_DIAGNOSIS}
            />
            <InfoField
              label="Differential Diagnosis"
              value={report.DIFFERENTIAL_DIAGNOSIS}
            />
            <InfoField label="Evolution Notes" value={report.EVOLUTION_NOTES} />
          </div>

          {/* Treatment Plan */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <SectionTitle>💊 Treatment Plan</SectionTitle>
            <InfoField label="Prescriptions" value={report.PRESCRIPTIONS} />
            <InfoField
              label="Other Treatments"
              value={report.OTHER_TREATMENTS}
            />
            <InfoField label="Recommendations" value={report.RECOMMENDATIONS} />
            <InfoField
              label="Next Appointment"
              value={formatDate(report.NEXT_APPOINTMENT)}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end mt-6">
            <button
              onClick={() => navigate("/my-medicalReport")}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 
                       transition-colors flex items-center gap-2"
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
