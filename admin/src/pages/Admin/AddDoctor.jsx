import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("1");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [specialty, setSpecialty] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [docLicense, setDocLicense] = useState("");

  const { backendUrl, aToken } = useContext(AdminContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (!docImg) {
        return toast.error("Image not selected");
      }
      const formData = new FormData();

      formData.append("IMAGE", docImg);
      formData.append("NAME", name);
      formData.append("EMAIL", email);
      formData.append("PASSWORD", password);
      formData.append("EXPERIENCE", experience);
      formData.append("FEES", fees);
      formData.append("DOCTOR_LICENCE", docLicense);
      formData.append("SPECIALTY", specialty);
      formData.append("ADRESS_1", address1);
      formData.append("ADRESS_2", address2);
      formData.append("ABOUT", about);
      formData.append("DEGREE", degree);
      formData.append("STATUS", "true");
      formData.append("CREATED_AT", new Date().toISOString());
      formData.append("CREATED_BY", "ADMIN");
      formData.append("IS_PASSWORD_TEMPORARY", "true");

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-doctor",
        formData,
        {
          headers: { aToken },
        }
      );

      if (data) {
        toast.success(data.message);
        // Reset form
        setDocImg(false);
        setName("");
        setEmail("");
        setPassword("");
        setExperience("1");
        setFees("");
        setAbout("");
        setSpecialty("General physician");
        setDegree("");
        setAddress1("");
        setAddress2("");
        setDocLicense("");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Error details:", err);
      toast.error("Failed to add doctor");
    }
  };

  const specialties = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatricians",
    "Neurologist",
    "Gastroenterologist",
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Doctor</h1>
        <p className="text-gray-500 mt-1">
          Fill in the details to add a new medical professional
        </p>
      </div>

      <form
        onSubmit={onSubmitHandler}
        className="bg-white rounded-xl shadow-sm border border-gray-100"
      >
        {/* Image Upload Section */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Profile Picture
          </h2>
          <div className="flex items-center gap-6">
            <label htmlFor="doc-img" className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                <img
                  className="w-full h-full object-cover"
                  src={
                    docImg ? URL.createObjectURL(docImg) : assets.upload_area
                  }
                  alt=""
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-xs">Change photo</p>
              </div>
            </label>
            <input
              onChange={(e) => setDocImg(e.target.files[0])}
              type="file"
              name="doc-img"
              id="doc-img"
              className="hidden"
              accept="image/*"
            />
            <div className="text-sm text-gray-500">
              <p className="font-medium">Upload doctor photo</p>
              <p>JPG, GIF or PNG. Max size of 800K</p>
            </div>
          </div>
        </div>

        {/* Main Form Section */}
        <div className="p-6 grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Personal Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Dr. John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="doctor@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>
              <input
                type="text"
                value={docLicense}
                onChange={(e) => setDocLicense(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="License number"
                required
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Professional Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience
                </label>
                <select
                  value={experience + " Year"}
                  onChange={(e) => setExperience(e.target.value.split(" ")[0])}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={`${i + 1} Year`}>
                      {i + 1} Year
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Fee
                </label>
                <input
                  type="number"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Amount"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Degree
              </label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., MBBS, MD"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-2"
                placeholder="Address Line 1"
                required
              />
              <input
                type="text"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Address Line 2"
                required
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="p-6 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            About Doctor
          </label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows="4"
            placeholder="Write a brief description about the doctor's background and expertise..."
            required
          />
        </div>

        {/* Submit Button */}
        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all duration-200"
          >
            Add Doctor
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDoctor;
