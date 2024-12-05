import React, {
  useContext,
  useEffect,
  useState,
  memo,
  useCallback,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DoctorContext } from "../../../context/DoctorContext";
import { toast } from "react-toastify";

// Form Context
const FormContext = React.createContext();

// Reusable Components with Display Names
const InputField = memo(
  ({
    label,
    name,
    type = "text",
    required = false,
    placeholder = "",
    disabled = false,
  }) => {
    const { formData, handleChange } = useContext(FormContext);
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                  focus:ring-blue-500 focus:border-blue-500 text-gray-900
                  ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
                  transition-all duration-200 ease-in-out`}
        />
      </div>
    );
  }
);
InputField.displayName = "InputField";

const TextArea = memo(({ label, name, required = false, rows = 3 }) => {
  const { formData, handleChange } = useContext(FormContext);
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        required={required}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                 focus:ring-blue-500 focus:border-blue-500 text-gray-900
                 transition-all duration-200 ease-in-out"
      />
    </div>
  );
});
TextArea.displayName = "TextArea";

const SectionTitle = memo(({ children }) => (
  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
    {children}
  </h2>
));
SectionTitle.displayName = "SectionTitle";

// Loading Component
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

const EditReport = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { getReport, updateReport } = useContext(DoctorContext);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load report data
  useEffect(() => {
    const loadReport = async () => {
      try {
        const report = await getReport(reportId);
        if (report) {
          // Format dates for input fields
          report.CONSULTATION_DATE = report.CONSULTATION_DATE
            ? new Date(report.CONSULTATION_DATE).toISOString().split("T")[0]
            : "";
          report.NEXT_APPOINTMENT = report.NEXT_APPOINTMENT
            ? new Date(report.NEXT_APPOINTMENT).toISOString().split("T")[0]
            : "";

          setFormData(report);
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

  // Handle form field changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Calculate BMI automatically
  useEffect(() => {
    if (formData?.WEIGHT && formData?.HEIGHT) {
      const heightInMeters = formData.HEIGHT / 100;
      const bmi = (formData.WEIGHT / (heightInMeters * heightInMeters)).toFixed(
        1
      );
      setFormData((prev) => ({ ...prev, BMI: bmi }));
    }
  }, [formData?.WEIGHT, formData?.HEIGHT]);

  // Handle form submission
  const handleSubmit = async (e, status) => {
    e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      const success = await updateReport(reportId, {
        ...formData,
        STATUS: status,
      });

      if (success) {
        toast.success(
          `Report ${
            status === "DRAFT" ? "saved as draft" : "completed"
          } successfully`
        );
        navigate("/medical-reports");
      }
    } catch (error) {
      toast.error("Failed to update report");
      console.error("Error updating report:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !formData) {
    return <LoadingSpinner />;
  }

  const formContextValue = {
    formData,
    handleChange,
  };

  return (
    <FormContext.Provider value={formContextValue}>
      <div className="flex-1 h-screen overflow-hidden bg-gray-50">
        <div className="max-w-4xl mx-auto h-full flex flex-col p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Medical Report
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Last updated:{" "}
                {new Date(
                  formData.UPDATED_AT || formData.CREATED_AT
                ).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/medical-reports")}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md 
                         hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  window.open(`/api/reports/${reportId}/pdf`, "_blank")
                }
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 
                         transition-colors duration-200 flex items-center gap-2"
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

          {/* Scrollable Form Container */}
          <div className="flex-1 overflow-y-auto">
            <form className="bg-white rounded-lg shadow-md p-6 space-y-8">
              {/* Basic Information */}
              <div>
                <SectionTitle>📋 Basic Information</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Consultation Date"
                    name="CONSULTATION_DATE"
                    type="date"
                    required
                  />
                  <InputField
                    label="Duration (minutes)"
                    name="CONSULTATION_DURATION"
                    type="number"
                    required
                  />
                </div>
                <TextArea
                  label="Reason for Consultation"
                  name="CONSULTATION_REASON"
                  required
                />
              </div>

              {/* Complaints and History */}
              <div>
                <SectionTitle>🔍 Complaints and History</SectionTitle>
                <TextArea
                  label="Main Complaint"
                  name="MAIN_COMPLAINT"
                  required
                  rows={4}
                />
                <TextArea
                  label="Current Illness History"
                  name="CURRENT_ILLNESS_HISTORY"
                  rows={4}
                />
              </div>

              {/* Vital Signs */}
              <div>
                <SectionTitle>❤️ Vital Signs</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    label="Temperature (°C)"
                    name="TEMPERATURE"
                    type="number"
                    step="0.1"
                  />
                  <InputField
                    label="Blood Pressure"
                    name="BLOOD_PRESSURE"
                    placeholder="120/80"
                  />
                  <InputField
                    label="Heart Rate (bpm)"
                    name="HEART_RATE"
                    type="number"
                  />
                  <InputField
                    label="Respiratory Rate (/min)"
                    name="RESPIRATORY_RATE"
                    type="number"
                  />
                  <InputField
                    label="Oxygen Saturation (%)"
                    name="OXYGEN_SATURATION"
                    type="number"
                  />
                  <InputField
                    label="Weight (kg)"
                    name="WEIGHT"
                    type="number"
                    step="0.1"
                  />
                  <InputField label="Height (cm)" name="HEIGHT" type="number" />
                  <InputField
                    label="BMI"
                    name="BMI"
                    type="number"
                    step="0.1"
                    disabled
                  />
                </div>
              </div>

              {/* Medical History */}
              <div>
                <SectionTitle>📚 Medical History</SectionTitle>
                <TextArea
                  label="Personal History"
                  name="PERSONAL_HISTORY"
                  rows={4}
                />
                <TextArea
                  label="Family History"
                  name="FAMILY_HISTORY"
                  rows={4}
                />
                <TextArea
                  label="Lifestyle Habits"
                  name="LIFESTYLE_HABITS"
                  rows={4}
                />
              </div>

              {/* Examination and Tests */}
              <div>
                <SectionTitle>🔬 Examination and Tests</SectionTitle>
                <TextArea
                  label="Physical Examination"
                  name="PHYSICAL_EXAMINATION"
                  rows={4}
                />
                <TextArea
                  label="Tests Performed"
                  name="TESTS_PERFORMED"
                  rows={4}
                />
                <TextArea label="Test Results" name="TEST_RESULTS" rows={4} />
              </div>

              {/* Diagnosis */}
              <div>
                <SectionTitle>🏥 Diagnosis</SectionTitle>
                <TextArea
                  label="Primary Diagnosis"
                  name="PRIMARY_DIAGNOSIS"
                  required
                />
                <TextArea
                  label="Differential Diagnosis"
                  name="DIFFERENTIAL_DIAGNOSIS"
                />
                <TextArea label="Evolution Notes" name="EVOLUTION_NOTES" />
              </div>

              {/* Treatment Plan */}
              <div>
                <SectionTitle>💊 Treatment Plan</SectionTitle>
                <TextArea label="Prescriptions" name="PRESCRIPTIONS" rows={4} />
                <TextArea label="Other Treatments" name="OTHER_TREATMENTS" />
                <TextArea label="Recommendations" name="RECOMMENDATIONS" />
                <InputField
                  label="Next Appointment"
                  name="NEXT_APPOINTMENT"
                  type="date"
                />
              </div>

              {/* Disability Evaluation */}
              <div>
                <SectionTitle>⚕️ Disability Evaluation</SectionTitle>
                <TextArea
                  label="Disability Evaluation"
                  name="DISABILITY_EVALUATION"
                />
                <InputField
                  label="Disability Duration (days)"
                  name="DISABILITY_DURATION"
                  type="number"
                />
                <TextArea
                  label="Work Return Recommendations"
                  name="WORK_RETURN_RECOMMENDATIONS"
                />
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-0 flex justify-end gap-4 pt-4 bg-white">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={(e) => handleSubmit(e, "DRAFT")}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600
                           transition-colors duration-200 flex items-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save as Draft"}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  onClick={(e) => handleSubmit(e, "COMPLETED")}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
                           transition-colors duration-200 flex items-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Complete Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </FormContext.Provider>
  );
};

export default EditReport;
