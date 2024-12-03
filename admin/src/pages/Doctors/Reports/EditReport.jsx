import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DoctorContext } from "../../../context/DoctorContext";

const EditReport = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { getReport, updateReport } = useContext(DoctorContext);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      const report = await getReport(reportId);
      if (report) {
        // Formater la date de consultation pour l'input date
        if (report.CONSULTATION_DATE) {
          report.CONSULTATION_DATE = new Date(report.CONSULTATION_DATE)
            .toISOString()
            .split("T")[0];
        }
        if (report.NEXT_APPOINTMENT) {
          report.NEXT_APPOINTMENT = new Date(report.NEXT_APPOINTMENT)
            .toISOString()
            .split("T")[0];
        }
        setFormData(report);
      }
      setLoading(false);
    };
    loadReport();
  }, [reportId]);

  // Calculer l'IMC automatiquement
  useEffect(() => {
    if (formData?.WEIGHT && formData?.HEIGHT) {
      const heightInMeters = formData.HEIGHT / 100;
      const bmi = (formData.WEIGHT / (heightInMeters * heightInMeters)).toFixed(
        1
      );
      setFormData((prev) => ({ ...prev, BMI: bmi }));
    }
  }, [formData?.WEIGHT, formData?.HEIGHT]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e, status) => {
    e.preventDefault();
    try {
      const success = await updateReport(reportId, {
        ...formData,
        STATUS: status,
      });
      if (success) {
        navigate("/medical-reports");
      }
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  if (loading || !formData) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading report data...</div>
      </div>
    );
  }

  const InputField = ({ label, name, type = "text", required = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 
                 focus:border-blue-500 text-gray-900"
      />
    </div>
  );

  const TextArea = ({ label, name, required = false, rows = 3 }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        required={required}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 
                 focus:border-blue-500 text-gray-900"
      />
    </div>
  );

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Medical Report
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/medical-reports")}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                window.open(`/api/reports/${reportId}/pdf`, "_blank")
              }
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Download PDF
            </button>
          </div>
        </div>

        <form className="bg-white rounded-lg shadow-md p-6">
          {/* Section: Informations de base */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
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

          {/* Section: Plaintes et histoire */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Complaints and History
            </h2>
            <TextArea label="Main Complaint" name="MAIN_COMPLAINT" required />
            <TextArea
              label="Current Illness History"
              name="CURRENT_ILLNESS_HISTORY"
              rows={4}
            />
          </div>

          {/* Section: Signes vitaux */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Vital Signs
            </h2>
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

          {/* Section: Antécédents */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Medical History
            </h2>
            <TextArea
              label="Personal History"
              name="PERSONAL_HISTORY"
              rows={4}
            />
            <TextArea label="Family History" name="FAMILY_HISTORY" rows={4} />
            <TextArea
              label="Lifestyle Habits"
              name="LIFESTYLE_HABITS"
              rows={4}
            />
          </div>

          {/* Section: Examen et tests */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Examination and Tests
            </h2>
            <TextArea
              label="Physical Examination"
              name="PHYSICAL_EXAMINATION"
              rows={4}
            />
            <TextArea label="Tests Performed" name="TESTS_PERFORMED" rows={4} />
            <TextArea label="Test Results" name="TEST_RESULTS" rows={4} />
          </div>

          {/* Section: Diagnostic */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Diagnosis
            </h2>
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

          {/* Section: Plan de traitement */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Treatment Plan
            </h2>
            <TextArea label="Prescriptions" name="PRESCRIPTIONS" rows={4} />
            <TextArea label="Other Treatments" name="OTHER_TREATMENTS" />
            <TextArea label="Recommendations" name="RECOMMENDATIONS" />
            <InputField
              label="Next Appointment"
              name="NEXT_APPOINTMENT"
              type="date"
            />
          </div>

          {/* Section: Évaluation de l'incapacité */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Disability Evaluation
            </h2>
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

          {/* Boutons d'action */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "DRAFT")}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              onClick={(e) => handleSubmit(e, "COMPLETED")}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Complete Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReport;
