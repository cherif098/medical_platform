import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DoctorContext } from "../../../context/DoctorContext";

const ViewReport = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { getReport, downloadReportPDF } = useContext(DoctorContext);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      const data = await getReport(reportId);
      if (data) {
        setReport(data);
      }
      setLoading(false);
    };
    loadReport();
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading report...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-red-600">Report not found</div>
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

  const InfoSection = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );

  const Field = ({ label, value, className = "" }) => (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 text-sm text-gray-900">
        {value || "Not specified"}
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    const statusStyles = {
      DRAFT: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      PENDING: "bg-blue-100 text-blue-800",
    };
    return statusStyles[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="overflow-y-scroll flex-1 p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical Report</h1>
            <p className="mt-1 text-sm text-gray-600">
              Created on {formatDate(report.CREATED_AT)}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/medical-reports/edit/${reportId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                       transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>
            <button
              onClick={() => downloadReportPDF(reportId)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 
                       transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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

        {/* Status Badge */}
        <div className="mb-6">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm 
                        font-medium ${getStatusBadge(report.STATUS)}`}
          >
            {report.STATUS}
          </span>
        </div>

        <div className="space-y-6">
          {/* Patient Information */}
          <InfoSection title="Patient Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Name" value={report.PATIENT_NAME} />
              <Field label="Gender" value={report.GENDER} />
              <Field
                label="Date of Birth"
                value={formatDate(report.DATE_OF_BIRTH)}
              />
              <Field label="Phone" value={report.PHONE} />
              <Field
                label="Address"
                value={report.ADRESSE}
                className="md:col-span-2"
              />
            </div>
          </InfoSection>

          {/* Consultation Details */}
          <InfoSection title="Consultation Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Date"
                value={formatDate(report.CONSULTATION_DATE)}
              />
              <Field
                label="Duration"
                value={`${report.CONSULTATION_DURATION} minutes`}
              />
              <Field
                label="Reason"
                value={report.CONSULTATION_REASON}
                className="md:col-span-2"
              />
            </div>
          </InfoSection>

          {/* Complaints and History */}
          <InfoSection title="Complaints and History">
            <Field label="Main Complaint" value={report.MAIN_COMPLAINT} />
            <Field
              label="Current Illness History"
              value={report.CURRENT_ILLNESS_HISTORY}
            />
          </InfoSection>

          {/* Vital Signs */}
          <InfoSection title="Vital Signs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field
                label="Temperature"
                value={report.TEMPERATURE && `${report.TEMPERATURE}°C`}
              />
              <Field label="Blood Pressure" value={report.BLOOD_PRESSURE} />
              <Field
                label="Heart Rate"
                value={report.HEART_RATE && `${report.HEART_RATE} bpm`}
              />
              <Field
                label="Respiratory Rate"
                value={
                  report.RESPIRATORY_RATE && `${report.RESPIRATORY_RATE}/min`
                }
              />
              <Field
                label="Oxygen Saturation"
                value={
                  report.OXYGEN_SATURATION && `${report.OXYGEN_SATURATION}%`
                }
              />
              <Field
                label="Weight"
                value={report.WEIGHT && `${report.WEIGHT} kg`}
              />
              <Field
                label="Height"
                value={report.HEIGHT && `${report.HEIGHT} cm`}
              />
              <Field label="BMI" value={report.BMI} />
            </div>
          </InfoSection>

          {/* Medical History */}
          <InfoSection title="Medical History">
            <Field label="Personal History" value={report.PERSONAL_HISTORY} />
            <Field label="Family History" value={report.FAMILY_HISTORY} />
            <Field label="Lifestyle Habits" value={report.LIFESTYLE_HABITS} />
          </InfoSection>

          {/* Examination and Tests */}
          <InfoSection title="Examination and Tests">
            <Field
              label="Physical Examination"
              value={report.PHYSICAL_EXAMINATION}
            />
            <Field label="Tests Performed" value={report.TESTS_PERFORMED} />
            <Field label="Test Results" value={report.TEST_RESULTS} />
          </InfoSection>

          {/* Diagnosis */}
          <InfoSection title="Diagnosis">
            <Field label="Primary Diagnosis" value={report.PRIMARY_DIAGNOSIS} />
            <Field
              label="Differential Diagnosis"
              value={report.DIFFERENTIAL_DIAGNOSIS}
            />
            <Field label="Evolution Notes" value={report.EVOLUTION_NOTES} />
          </InfoSection>

          {/* Treatment Plan */}
          <InfoSection title="Treatment Plan">
            <Field label="Prescriptions" value={report.PRESCRIPTIONS} />
            <Field label="Other Treatments" value={report.OTHER_TREATMENTS} />
            <Field label="Recommendations" value={report.RECOMMENDATIONS} />
            <Field
              label="Next Appointment"
              value={formatDate(report.NEXT_APPOINTMENT)}
            />
          </InfoSection>

          {/* Disability Assessment */}
          <InfoSection title="Disability Assessment">
            <Field
              label="Disability Evaluation"
              value={report.DISABILITY_EVALUATION}
            />
            <Field
              label="Duration"
              value={
                report.DISABILITY_DURATION &&
                `${report.DISABILITY_DURATION} days`
              }
            />
            <Field
              label="Work Return Recommendations"
              value={report.WORK_RETURN_RECOMMENDATIONS}
            />
          </InfoSection>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => navigate("/medical-reports")}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 
                     rounded-md hover:bg-gray-50 transition-colors"
          >
            Back to Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewReport;
