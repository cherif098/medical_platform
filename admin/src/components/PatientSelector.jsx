import React from "react";

const PatientSelector = ({
  patients,
  selectedPatient,
  onPatientSelect,
  calculateAge,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {patients.map((patient) => (
        <div
          key={patient.PATIENT_ID}
          onClick={() => onPatientSelect(patient)}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
            ${
              selectedPatient?.PATIENT_ID === patient.PATIENT_ID
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {patient.NAME.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{patient.NAME}</h3>
              <div className="mt-1 text-sm text-gray-600">
                <p>Age: {calculateAge(patient.DATE_OF_BIRTH)} years</p>
                <p>Gender: {patient.GENDER}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientSelector;
