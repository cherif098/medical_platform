import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";

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

  // Error message states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [dobError, setDobError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [genderError, setGenderError] = useState("");

  // Real-time password validations
  const passwordValidations = {
    hasUpperCase: /[A-Z]/.test(PASSWORD),
    hasNumber: /\d/.test(PASSWORD),
    hasMinLength: PASSWORD.length >= 8
  };

  // Email validation
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  // Password validation
  const validatePassword = (password) => {
    return passwordValidations.hasUpperCase && 
           passwordValidations.hasNumber && 
           passwordValidations.hasMinLength;
  };

  // Phone validation
  const validatePhone = (phone) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
  };

  // Gender validation
  const validateGender = (gender) => {
    return gender === "Male" || gender === "Female" || gender === "Other";
  };

  // Form validation
  const validateForm = () => {
    let isValid = true;

    // Reset error messages
    setEmailError("");
    setPasswordError("");
    setNameError("");
    setDobError("");
    setPhoneError("");
    setAddressError("");
    setGenderError("");

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
        setPasswordError("Password must have at least 8 characters, one uppercase letter and one number");
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
        const { data } = await axios.post(backendUrl + "/api/patient/register", {
          NAME,
          EMAIL,
          PASSWORD,
          DATE_OF_BIRTH,
          PHONE,
          ADRESSE,
          GENDER,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          toast.success("Account created successfully!");
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
          toast.success("Logged in successfully!");
        } else {
          toast.error(data.message || "Login failed");
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                          error.message ||
                          "An error occurred. Please try again.";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const switchState = () => {
    setState(state === "Sign up" ? "login" : "Sign up");
    setEmail("");
    setPassword("");
    setName("");
    setDOB("");
    setPhone("");
    setAddress("");
    setGender("");
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          {state === "Sign up" ? "Create Account" : "Login"}
        </p>
        <p>
          Please {state === "Sign up" ? "sign up" : "login"} to book appointment
        </p>
        
        {state === "Sign up" && (
          <>
            <div className="w-full">
              <p>Full Name</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={NAME}
                placeholder="Enter your full name"
              />
              {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
            </div>

            <div className="w-full">
              <p>Date of Birth</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="date"
                onChange={(e) => setDOB(e.target.value)}
                value={DATE_OF_BIRTH}
              />
              {dobError && <p className="text-red-500 text-sm">{dobError}</p>}
            </div>

            <div className="w-full">
              <p>Phone Number</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="text"
                onChange={(e) => setPhone(e.target.value)}
                value={PHONE}
                placeholder="Enter your phone number"
              />
              {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
            </div>

            <div className="w-full">
              <p>Address</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="text"
                onChange={(e) => setAddress(e.target.value)}
                value={ADRESSE}
                placeholder="Enter your address"
              />
              {addressError && <p className="text-red-500 text-sm">{addressError}</p>}
            </div>

            <div className="w-full">
              <p>Gender</p>
              <select
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                value={GENDER}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select your gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {genderError && <p className="text-red-500 text-sm">{genderError}</p>}
            </div>
          </>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="text"
            onChange={(e) => setEmail(e.target.value)}
            value={EMAIL}
            placeholder="Enter your email"
          />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={PASSWORD}
            placeholder="Enter your password"
          />
          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          
          {/* Password validation indicators */}
          {state === "Sign up" && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                {passwordValidations.hasUpperCase ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span className={`${passwordValidations.hasUpperCase ? 'text-green-500' : 'text-red-500'}`}>
                  At least one uppercase letter
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                {passwordValidations.hasNumber ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span className={`${passwordValidations.hasNumber ? 'text-green-500' : 'text-red-500'}`}>
                  At least one number
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                {passwordValidations.hasMinLength ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span className={`${passwordValidations.hasMinLength ? 'text-green-500' : 'text-red-500'}`}>
                  At least 8 characters
                </span>
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="w-full py-2 bg-blue-500 text-white rounded mt-4 hover:bg-blue-600 transition-colors"
        >
          {state === "Sign up" ? "Sign up" : "Login"}
        </button>

        <p>
          {state === "Sign up" ? (
            <span>
              Already have an account?{" "}
              <span
                onClick={switchState}
                className="text-blue-500 cursor-pointer hover:text-blue-600"
              >
                Login
              </span>
            </span>
          ) : (
            <span>
              Don't have an account?{" "}
              <span
                onClick={switchState}
                className="text-blue-500 cursor-pointer hover:text-blue-600"
              >
                Sign up
              </span>
            </span>
          )}
        </p>
      </div>
    </form>
  );
};

export default Login;