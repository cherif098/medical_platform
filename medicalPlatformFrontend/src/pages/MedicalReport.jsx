import React,{useState} from 'react'
import MyProfile from './MyProfile';

const MedicalReport = () => {

  const [uploadedImages, setUploadedImages] = useState([]);
  
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setUploadedImages(prevImages => [...prevImages, ...imageUrls]);
  };

  const physicalExamItems = [
    "General",
    "Ears, nose, throat (ENT)",
    "Mouth",
    "Speech",
    "Audiogram",
    "Cardiovascular",
    "Vascular system",
    "Lungs and chest",
    "Abdomen and viscera (including hernia)",
    "Lymphatic system (spleen/lymph nodes)",
    "Back/spine",
    "Extremities/joints",
    "Endocrine",
    "Genito-urinary",
    "Skin",
    "Locomotor",
    "Neurological system (including reflexes)",
    "Gait",
    "Psychiatric",
    "Urinalysis"
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
              <p className="text-gray-600 w-32">Name: </p>
              <span className="text-gray-900 flex-1"></span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Gender:</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Address:</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Contact:</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Date of birth:</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Exam date:</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Email:</span>
              <span className="text-gray-900 flex-1"></span>
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
              <tr>
                <td className="border-b p-2"></td>
                <td className="border-b p-2"></td>
                <td className="border-b p-2"></td>
                <td className="border-b p-2"></td>
              </tr>
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
              <span className="text-gray-600 w-32">Height:</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Blood pressure:</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Pulse rate:</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Systolic BP (seated):</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Weight:</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Heart rate:</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Rhythm:</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Diastolic BP:</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Vision</h2>
        <table className="w-full border border-gray-200 mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b p-2"></th>
              <th className="border-b p-2" colSpan="3">Unaided</th>
              <th className="border-b p-2" colSpan="3">Aided</th>
            </tr>
            <tr>
              <th className="border-b p-2"></th>
              <th className="border-b p-2">Right</th>
              <th className="border-b p-2">Left</th>
              <th className="border-b p-2">Binocular</th>
              <th className="border-b p-2">Right</th>
              <th className="border-b p-2">Left</th>
              <th className="border-b p-2">Binocular</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b p-2">Distant</td>
              <td className="border-b p-2"></td>
              <td className="border-b p-2"></td>
              <td className="border-b p-2"></td>
              <td className="border-b p-2"></td>
              <td className="border-b p-2"></td>
              <td className="border-b p-2"></td>
            </tr>
            <tr>
              <td className="border-b p-2">Near</td>
              <td className="border-b p-2"></td>
              <td className="border-b p-2"></td>
              <td className="border-b p-2"></td>
              <td className="border-b p-2"></td>
              <td className="border-b p-2"></td>
              <td className="border-b p-2"></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Hearing */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Hearing</h2>
        <div className="mb-4">
          <p className="font-medium mb-2">Hearing aids:</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="hearingAids" />
              <span>No</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="hearingAids" />
              <span>Left</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="hearingAids" />
              <span>Right</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="hearingAids" />
              <span>Both</span>
            </label>
          </div>
        </div>
      </section>

      {/* Physical Examination */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Physical Examination</h2>
        <p className="mb-4">Are the following normal without unusual features?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {physicalExamItems.map((item, index) => (
            <div key={index} className="flex justify-between border-b border-gray-200 pb-2">
              <span>{item}</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name={`exam-${index}`} />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name={`exam-${index}`} />
                  <span>No</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

       {/* Section for Vision IA Images */}
      <section className="mb-8">
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
      </section>

      {/* Laboratory Tests */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Laboratory Tests</h2>
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b p-2 text-left">Test name</th>
              <th className="border-b p-2 text-left">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b p-2"></td>
              <td className="border-b p-2"></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Healthcare Provider */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Healthcare Provider Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Name:</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">License:</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Date:</span>
              <span className="text-gray-900 flex-1"></span>
            </div>
            <div className="flex border-b border-gray-200 pb-2">
              <span className="text-gray-600 w-32">Signature:</span>
              <div className="flex-1 h-16 border-b border-gray-900"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MedicalReport