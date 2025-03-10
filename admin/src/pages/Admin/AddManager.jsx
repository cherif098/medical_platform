import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

const AddManager = () => {
  const [managerImg, setManagerImg] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("1");
  const [about, setAbout] = useState("");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("General Administration");

  const { backendUrl, aToken } = useContext(AdminContext);

  const departments = [
    "General Administration",
    "Finance",
    "Human Resources",
    "Operations",
    "Quality Assurance",
    "Information Technology",
    "Facilities Management",
  ];

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (!managerImg) {
        return toast.error("Image not selected");
      }
      const formData = new FormData();

      formData.append("IMAGE", managerImg);
      formData.append("NAME", name);
      formData.append("EMAIL", email);
      formData.append("PASSWORD", password);
      formData.append("EXPERIENCE", experience);
      formData.append("PHONE", phone);
      formData.append("ADDRESS", address);
      formData.append("DEPARTMENT", department);
      formData.append("ABOUT", about);
      formData.append("STATUS", "true");
      formData.append("CREATED_AT", new Date().toISOString());
      formData.append("IS_PASSWORD_TEMPORARY", "true");
      formData.append("HOSPITAL_ID", "1");

      const { data } = await axios.post(
        backendUrl + "/api/admin/add-manager",
        formData,
        {
          headers: { aToken },
        }
      );

      if (data && data.success) {
        toast.success(data.message);
        // Reset form
        setManagerImg(false);
        setName("");
        setEmail("");
        setPassword("");
        setExperience("1");
        setPhone("");
        setAbout("");
        setAddress("");
        setDepartment("General Administration");
      } else {
        toast.error(data.message || "Failed to add manager");
      }
    } catch (err) {
      console.error("Error details:", err);
      toast.error(err.response?.data?.error || "Failed to add manager");
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Manager</h1>
        <p className="text-gray-500 mt-1">
          Fill in the details to add a new department manager
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
            <label
              htmlFor="manager-img"
              className="relative group cursor-pointer"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                <img
                  className="w-full h-full object-cover"
                  src={
                    managerImg
                      ? URL.createObjectURL(managerImg)
                      : assets.upload_area
                  }
                  alt=""
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-xs">Change photo</p>
              </div>
            </label>
            <input
              onChange={(e) => setManagerImg(e.target.files[0])}
              type="file"
              name="manager-img"
              id="manager-img"
              className="hidden"
              accept="image/*"
            />
            <div className="text-sm text-gray-500">
              <p className="font-medium">Upload manager photo</p>
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
                placeholder="John Doe"
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
                placeholder="manager@example.com"
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
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Phone number"
                required
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Professional Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

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
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={`${i + 1} Year`}>
                    {i + 1} Year
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Full address"
                rows="3"
                required
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="p-6 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            About Manager
          </label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows="4"
            placeholder="Write a brief description about the manager's background, expertise, and management style..."
            required
          />
        </div>

        {/* Submit Button */}
        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all duration-200"
          >
            Add Manager
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddManager;
