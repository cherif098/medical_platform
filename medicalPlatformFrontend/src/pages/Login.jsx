import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [state, setState] = useState("Sign up");
  const [EMAIL, setEmail] = useState("");
  const [PASSWORD, setPassword] = useState("");
  const [NAME, setName] = useState("");
  const [DATE_OF_BIRTH, setDOB] = useState("");

  const validateForm = () => {
    if (state === "Sign up") {
      if (!NAME.trim()) {
        toast.error("Please enter your full name");
        return false;
      }
      if (!DATE_OF_BIRTH) {
        toast.error("Please enter your date of birth");
        return false;
      }
    }
    if (!EMAIL.trim()) {
      toast.error("Please enter your email");
      return false;
    }
    if (!PASSWORD.trim()) {
      toast.error("Please enter your password");
      return false;
    }
    return true;
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
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">
          {state === "Sign up" ? "Create Account" : "Login"}
        </p>
        <p>
          Please {state === "Sign up" ? "Sign up" : "Login"} to book appointment
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
            </div>

            <div className="w-full">
              <p>Date of Birth</p>
              <input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="date"
                onChange={(e) => setDOB(e.target.value)}
                value={DATE_OF_BIRTH}
              />
            </div>
          </>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={EMAIL}
            placeholder="Enter your email"
          />
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
        </div>
        <button
          type="submit"
          className="bg-primary text-white w-full py-2 rounded-md text-base hover:opacity-90 transition-opacity"
        >
          {state === "Sign up" ? "Create Account" : "Login"}
        </button>
        {state === "Sign up" ? (
          <p>
            Already have an account?{" "}
            <span
              onClick={switchState}
              className="text-primary underline cursor-pointer hover:opacity-80"
            >
              Login here
            </span>
          </p>
        ) : (
          <p>
            Create a new account?{" "}
            <span
              onClick={switchState}
              className="text-primary underline cursor-pointer hover:opacity-80"
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;