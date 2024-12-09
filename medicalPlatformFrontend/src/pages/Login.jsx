import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Check, X, Upload } from "lucide-react";
import { assets } from "../assets/assets";

const MemoInput = React.memo(function MemoInput({ label, error, ...props }) {
  return (
    <div className="w-full space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
});

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [state, setState] = useState("Sign up");
  const [EMAIL, setEmail] = useState("");
  const [PASSWORD, setPassword] = useState("");
  const [NAME, setName] = useState("");
  const [DATE_OF_BIRTH, setDOB] = useState("");
  const [PHONE, setPhone] = useState("");
  const [ADRESSE, setAddress] = useState("");
  const [GENDER, setGender] = useState("");
  const [IMAGE, setImage] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [dobError, setDobError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [imageError, setImageError] = useState("");

  const passwordValidations = {
    hasUpperCase: /[A-Z]/.test(PASSWORD),
    hasNumber: /\d/.test(PASSWORD),
    hasMinLength: PASSWORD.length >= 8,
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return (
      passwordValidations.hasUpperCase &&
      passwordValidations.hasNumber &&
      passwordValidations.hasMinLength
    );
  };

  const validatePhone = (phone) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
  };

  const validateGender = (gender) => {
    return gender === "Male" || gender === "Female" || gender === "Other";
  };

  const validateForm = () => {
    let isValid = true;

    setEmailError("");
    setPasswordError("");
    setNameError("");
    setDobError("");
    setPhoneError("");
    setAddressError("");
    setGenderError("");
    setImageError("");

    if (state === "Sign up") {
      if (!NAME.trim()) {
        setNameError("Please enter your full name");
        isValid = false;
      }
      if (!DATE_OF_BIRTH) {
        setDobError("Please enter your date of birth");
        isValid = false;
      }
      if (!EMAIL.trim()) {
        setEmailError("Please enter your email");
        isValid = false;
      } else if (!validateEmail(EMAIL)) {
        setEmailError("Please enter a valid email");
        isValid = false;
      }
      if (!PASSWORD.trim()) {
        setPasswordError("Please enter your password");
        isValid = false;
      } else if (!validatePassword(PASSWORD)) {
        setPasswordError(
          "Password must have at least 8 characters, one uppercase letter and one number"
        );
        isValid = false;
      }
      if (!PHONE.trim()) {
        setPhoneError("Please enter your phone number");
        isValid = false;
      } else if (!validatePhone(PHONE)) {
        setPhoneError("Please enter a valid phone number");
        isValid = false;
      }
      if (!ADRESSE.trim()) {
        setAddressError("Please enter your address");
        isValid = false;
      }
      if (!GENDER) {
        setGenderError("Please select your gender");
        isValid = false;
      } else if (!validateGender(GENDER)) {
        setGenderError("Please select a valid gender");
        isValid = false;
      }
      if (!IMAGE) {
        setImageError("Please upload an image");
        isValid = false;
      }
    }

    return isValid;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (state === "Sign up") {
        const formData = new FormData();
        formData.append("NAME", NAME.trim());
        formData.append("EMAIL", EMAIL.trim().toLowerCase());
        formData.append("PASSWORD", PASSWORD);
        formData.append("DATE_OF_BIRTH", DATE_OF_BIRTH);
        formData.append("PHONE", PHONE.replace(/\D/g, ""));
        formData.append("ADRESSE", ADRESSE.trim());
        formData.append("GENDER", GENDER);
        if (IMAGE) {
          formData.append("IMAGE", IMAGE);
        }

        const { data } = await axios.post(
          backendUrl + "/api/patient/register",
          formData
        );
        if (data.success) {
          switchState();
          toast.success("Account created successfully! Please log in.");
        } else {
          toast.error(data.message || "Registration failed");
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/patient/login", {
          EMAIL,
          PASSWORD,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          navigate("/");
          toast.success("Logged in successfully!");
        } else {
          toast.error(data.message || "Login failed");
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred. Please try again.";
      toast.error(errorMessage);
    }
  };

  const switchState = () => {
    setState(state === "Sign up" ? "login" : "Sign up");
    setEmail("");
    setPassword("");
    setName("");
    setDOB("");
    setPhone("");
    setAddress("");
    setGender("");
    setImage(false);
    // Clear all errors
    setEmailError("");
    setPasswordError("");
    setNameError("");
    setDobError("");
    setPhoneError("");
    setAddressError("");
    setGenderError("");
    setImageError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            {state === "Sign up" ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please {state === "Sign up" ? "sign up" : "login"} to book an
            appointment
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className="mt-8 space-y-6">
          <div className="space-y-4">
            {state === "Sign up" && (
              <>
                <MemoInput
                  label="Full Name"
                  type="text"
                  value={NAME}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  error={nameError}
                />

                <MemoInput
                  label="Date of Birth"
                  type="date"
                  value={DATE_OF_BIRTH}
                  onChange={(e) => setDOB(e.target.value)}
                  error={dobError}
                />

                <MemoInput
                  label="Phone Number"
                  type="tel"
                  value={PHONE}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="1234567890"
                  error={phoneError}
                />

                <MemoInput
                  label="Address"
                  type="text"
                  value={ADRESSE}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                  error={addressError}
                />

                <div className="w-full space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    value={GENDER}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {genderError && (
                    <p className="text-sm text-red-500">{genderError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Profile Picture
                  </label>
                  <div className="flex items-center justify-center">
                    <label className="relative cursor-pointer group">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200 group-hover:border-blue-500 transition duration-200">
                        {IMAGE ? (
                          <img
                            src={URL.createObjectURL(IMAGE)}
                            alt="Profile preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition duration-200" />
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.type.startsWith("image/")) {
                            setImage(file);
                          } else {
                            toast.error("Please select a valid image");
                          }
                        }}
                        accept="image/*"
                      />
                    </label>
                  </div>
                  {imageError && (
                    <p className="text-sm text-red-500 text-center">
                      {imageError}
                    </p>
                  )}
                </div>
              </>
            )}

            <MemoInput
              label="Email"
              type="email"
              value={EMAIL}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              error={emailError}
            />

            <div className="space-y-1">
              <MemoInput
                label="Password"
                type="password"
                value={PASSWORD}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                error={passwordError}
              />

              {state === "Sign up" && (
                <div className="mt-2 space-y-2">
                  {Object.entries({
                    "At least one uppercase letter":
                      passwordValidations.hasUpperCase,
                    "At least one number": passwordValidations.hasNumber,
                    "At least 8 characters": passwordValidations.hasMinLength,
                  }).map(([text, isValid]) => (
                    <div key={text} className="flex items-center space-x-2">
                      {isValid ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm ${
                          isValid ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 font-medium"
          >
            {state === "Sign up" ? "Create Account" : "Sign In"}
          </button>

          <p className="text-sm text-center text-gray-600">
            {state === "Sign up"
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={switchState}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition duration-200"
            >
              {state === "Sign up" ? "Sign in" : "Sign up"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
