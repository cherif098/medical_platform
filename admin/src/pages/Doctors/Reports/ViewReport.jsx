import React, { useContext, useEffect, useState, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DoctorContext } from "../../../context/DoctorContext";
import { toast } from "react-toastify";

// Loading Spinner Component
const LoadingSpinner = memo(() => (
  <div className="flex-1 h-screen flex items-center justify-center bg-gray-50">
    <div className="text-gray-600 flex flex-col items-center gap-2">
      <svg
        className="animate-spin h-8 w-8 text-blue-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span>Loading report data...</span>
    </div>
  </div>
));
LoadingSpinner.displayName = "LoadingSpinner";

// Info Section Component
const InfoSection = memo(({ title, icon, children }) => (
  <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-200 hover:shadow-lg">
    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <span className="text-blue-600">{icon}</span>
      {title}
    </h2>
    {children}
  </div>
));
InfoSection.displayName = "InfoSection";

// Field Component
const Field = memo(({ label, value, className = "" }) => (
  <div className={`mb-4 ${className}`}>
    <label className="block text-sm font-medium text-gray-500">{label}</label>
    <div className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded-md min-h-[1.5rem]">
      {value || "Not specified"}
    </div>
  </div>
));
Field.displayName = "Field";

const ViewReport = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { getReport, downloadReportPDF, getNurseNotesForReport} = useContext(DoctorContext);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nurseNotes, setNurseNotes] = useState([]);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const data = await getReport(reportId);
        if (data) {
          setReport(data);
        } else {
          toast.error("Report not found");
          navigate("/medical-reports");
        }
      } catch (error) {
        toast.error("Failed to load report");
        console.error("Error loading report:", error);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [reportId, getReport, navigate]);

  useEffect(() => {
    const loadNurseNotes = async () => {
        try {
            const notes = await getNurseNotesForReport(reportId);
            console.log("Nurse Notes:", notes);
            setNurseNotes(Array.isArray(notes) ? notes : []);
        } catch (error) {
            console.error("Error fetching nurse notes:", error);
            setNurseNotes([]);
        }
    };

    loadNurseNotes();
}, [reportId, getNurseNotesForReport]);

  
  

  const formatDate = (date) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!report) {
    return (
      <div className="flex-1 h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600">Report not found</div>
      </div>
    );
  }

  const { className: statusClassName, label: statusLabel } = getStatusBadge(
    report.STATUS
  );

  return (
    <div className="flex-1 h-screen flex flex-col bg-gray-50">
      {/* En-tête fixe */}
      <div className="p-8 pb-0">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Medical Report
              </h1>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  Created on {formatDate(report.CREATED_AT)}
                </p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm 
                              font-medium ${statusClassName}`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/medical-reports/edit/${reportId}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                       transition-colors flex items-center gap-2 shadow-sm"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
              <button
                onClick={() => downloadReportPDF(reportId, report.PATIENT_NAME)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 
                       transition-colors flex items-center gap-2 shadow-sm"
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
        </div>
      </div>

      {/* Zone de défilement */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Patient Information */}
          <InfoSection title="Patient Information" icon="👤">
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
          <InfoSection title="Consultation Details" icon="📅">
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
          <InfoSection title="Complaints and History" icon="🔍">
            <Field label="Main Complaint" value={report.MAIN_COMPLAINT} />
            <Field
              label="Current Illness History"
              value={report.CURRENT_ILLNESS_HISTORY}
            />
          </InfoSection>

          {/* Vital Signs */}
          <InfoSection title="Vital Signs" icon="❤️">
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
          <InfoSection title="Medical History" icon="📚">
            <Field label="Personal History" value={report.PERSONAL_HISTORY} />
            <Field label="Family History" value={report.FAMILY_HISTORY} />
            <Field label="Lifestyle Habits" value={report.LIFESTYLE_HABITS} />
          </InfoSection>

          {/* Examination and Tests */}
          <InfoSection title="Examination and Tests" icon="🔬">
            <Field
              label="Physical Examination"
              value={report.PHYSICAL_EXAMINATION}
            />
            <Field label="Tests Performed" value={report.TESTS_PERFORMED} />
            <Field label="Test Results" value={report.TEST_RESULTS} />
          </InfoSection>

          {/* Diagnosis */}
          <InfoSection title="Diagnosis" icon="🏥">
            <Field label="Primary Diagnosis" value={report.PRIMARY_DIAGNOSIS} />
            <Field
              label="Differential Diagnosis"
              value={report.DIFFERENTIAL_DIAGNOSIS}
            />
            <Field label="Evolution Notes" value={report.EVOLUTION_NOTES} />
          </InfoSection>

          {/* Treatment Plan */}
          <InfoSection title="Treatment Plan" icon="💊">
            <Field label="Prescriptions" value={report.PRESCRIPTIONS} />
            <Field label="Other Treatments" value={report.OTHER_TREATMENTS} />
            <Field label="Recommendations" value={report.RECOMMENDATIONS} />
            <Field
              label="Next Appointment"
              value={formatDate(report.NEXT_APPOINTMENT)}
            />
          </InfoSection>

          {/* Disability Assessment */}
          <InfoSection title="Disability Assessment" icon="⚕️">
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
          <InfoSection title="Nurse Observations" icon="📝">
  {Array.isArray(nurseNotes) && nurseNotes.length > 0 ? (
    nurseNotes.map((note) => (
      <div key={note.NOTE_ID} className="bg-gray-100 p-4 rounded-lg mb-3 shadow-sm">
        <p className="text-gray-900">{note.NOTE_TEXT}</p>
        <p className="text-sm text-gray-500 mt-2">
          Written by <strong>{note.NURSE_NAME}</strong> on{" "}
          {new Date(note.CREATED_AT).toLocaleDateString()}
        </p>
      </div>
    ))
  ) : (
    <p className="text-gray-500 italic">No nurse observations available for this report.</p>
  )}
</InfoSection>






        </div>
      </div>

     
      <div className="p-8 pt-4 bg-gray-50">
        <div className="max-w-4xl mx-auto flex justify-end">
          <button
            onClick={() => navigate("/medical-reports")}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 
                   rounded-md hover:bg-gray-50 transition-colors shadow-sm"
          >
            Back to Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewReport;
