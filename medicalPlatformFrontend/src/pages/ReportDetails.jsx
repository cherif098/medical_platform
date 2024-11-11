import React,{useState, useContext} from 'react'
import MyProfile from './MyProfile';
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { doctors } from "../assets/assets";

const ReportDetails = () => {

  const navigate = useNavigate();
  const doctor = doctors[0];

  const [uploadedImages, setUploadedImages] = useState([]);
  
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setUploadedImages(prevImages => [...prevImages, ...imageUrls]);
  };

  const patientData = [
    {
      "id": 1,
      "patientInformation": {
        "name": "John Doe",
        "gender": "Male",
        "address": "123 Main St, Cityville, ABC",
        "contact": "+1234567890",
        "dateOfBirth": "1980-01-01",
        "examDate": "2024-11-10",
        "email": "johndoe@example.com"
      },
      "medications": [
        {
          "name": "Med1",
          "dosage": "100mg",
          "frequency": "Twice a day",
          "remarks": "None"
        },
        {
          "name": "Med2",
          "dosage": "200mg",
          "frequency": "Once a day",
          "remarks": "Take with food"
        }
      ],
      "vitalSigns": {
        "height": "175 cm",
        "bloodPressure": "120/80 mmHg",
        "pulseRate": "72 bpm",
        "systolicBPSeated": "120 mmHg",
        "weight": "70 kg",
        "heartRate": "72 bpm",
        "rhythm": "Regular",
        "diastolicBP": "80 mmHg"
      },
      "vision": {
        "unaided": {
          "right": "20/20",
          "left": "20/20",
          "binocular": "20/20"
        },
        "aided": {
          "right": "20/20",
          "left": "20/20",
          "binocular": "20/20"
        }
      },
      "hearing": {
        "hearingAids": "Not specified"
      },
      "physicalExamResults": {
        "General": "Normal",
        "Ears, nose, throat (ENT)": "Normal",
        "Mouth": "Normal",
        "Speech": "Normal",
        "Audiogram": "Normal",
        "Cardiovascular": "Normal",
        "Vascular system": "Normal",
        "Lungs and chest": "Normal",
        "Abdomen and viscera (including hernia)": "Normal",
        "Lymphatic system (spleen/lymph nodes)": "Normal",
        "Back/spine": "Normal",
        "Extremities/joints": "Normal",
        "Endocrine": "Normal",
        "Genito-urinary": "Normal",
        "Skin": "Normal",
        "Locomotor": "Normal",
        "Neurological system (including reflexes)": "Normal",
        "Gait": "Normal",
        "Psychiatric": "Normal",
        "Urinalysis": "Normal"
      },
      "laboratoryTests": [
        {
          "testName": "Blood Test",
          "result": "Normal"
        },
        {
          "testName": "Urine Test",
          "result": "Normal"
        }
      ],
      "healthcareProvider": {
        "name": "Dr. Jane Smith",
        "license": "MD123456",
        "date": "2024-11-10",
        "signature": "Dr. Jane Smith's Signature"
      }
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Medical Examination Report</h1>

      {/* Patient Information */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Name: {patientData[0].patientInformation.name}</span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Gender: {patientData[0].patientInformation.gender}</span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Address: {patientData[0].patientInformation.address}</span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Contact: {patientData[0].patientInformation.contact}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Date of birth: {patientData[0].patientInformation.dateOfBirth}</span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Exam date: {patientData[0].patientInformation.examDate}</span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Email: {patientData[0].patientInformation.email}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Medications */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Medications</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b p-2 text-left">Name</th>
                <th className="border-b p-2 text-left">Dosage</th>
                <th className="border-b p-2 text-left">Frequency</th>
                <th className="border-b p-2 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {patientData[0].medications.map((medication, index) => (
                <tr key={index}>
                  <td className="border-b p-2">{medication.name}</td>
                  <td className="border-b p-2">{medication.dosage}</td>
                  <td className="border-b p-2">{medication.frequency}</td>
                  <td className="border-b p-2">{medication.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Vital Signs */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Vital Signs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Height: {patientData[0].vitalSigns.height}</span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Blood pressure: {patientData[0].vitalSigns.bloodPressure}</span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Pulse rate: {patientData[0].vitalSigns.pulseRate}</span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Systolic BP (seated): {patientData[0].vitalSigns.systolicBPSeated}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Weight: {patientData[0].vitalSigns.weight}</span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Heart rate: {patientData[0].vitalSigns.heartRate}</span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Rhythm: {patientData[0].vitalSigns.rhythm}</span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Diastolic BP: {patientData[0].vitalSigns.diastolicBP}</span>
            </div>
          </div>
        </div>
      </section>

       {/* Section for Vision IA Images */}
      {/*<section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Image Upload for Vision Analysis</h2>
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <p className="mb-2 text-gray-600">Please upload images for AI vision analysis:</p>
          <input
            type="file"
            accept="image/*"
            multiple
            className="block w-full text-gray-900 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
          />
          <p className="mt-1 text-sm text-gray-500">Accepted formats: JPG, PNG, JPEG. Maximum file size: 20MB per image.</p>
        </div>
      </section>*/}

      {/* Healthcare Provider Information */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Healthcare Provider Information</h2>
        <div className="space-y-3">
          <div className="flex border-b border-gray-200 pb-2">
            <span className="text-gray-600 w-32">Provider: {doctor.name}</span>
          </div>
          <div className="flex border-b border-gray-200 pb-2">
            <span className="text-gray-600 w-32">License: {patientData[0].healthcareProvider.license}</span>
          </div>
          <div className="flex border-b border-gray-200 pb-2">
            <span className="text-gray-600 w-32">Speciality: {doctor.speciality}</span>
          </div>
          <div className="flex border-b border-gray-200 pb-2">
            <span className="text-gray-600 w-32">Date: {patientData[0].healthcareProvider.date}</span>
          </div>
          <div className="flex border-b border-gray-200 pb-2">
            <span className="text-gray-600 w-32">Signature: {patientData[0].healthcareProvider.signature}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReportDetails