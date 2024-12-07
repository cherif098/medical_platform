// pages/Doctors/PaymentSuccess.jsx
import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorContext } from "../../context/DoctorContext";
import { Check } from "lucide-react";
import axios from "axios";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { backendUrl, getHeaders, setSubscriptionPlan } =
    useContext(DoctorContext);

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const session_id = urlParams.get("session_id");

        const { data } = await axios.post(
          `${backendUrl}/api/stripe/confirm-payment`,
          { session_id },
          getHeaders()
        );

        if (data.success) {
          setSubscriptionPlan("PRO");
          setTimeout(() => {
            navigate("/ai-assistant");
          }, 3000);
        }
      } catch (error) {
        console.error("Error confirming payment:", error);
        setTimeout(() => {
          navigate("/subscription-plans");
        }, 3000);
      }
    };

    confirmPayment();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <div className="mb-4 flex justify-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement réussi !
        </h2>
        <p className="text-gray-600 mb-4">
          Merci d'avoir souscrit au plan Pro. Vous allez être redirigé vers
          l'assistant AI.
        </p>
        <div className="animate-pulse">
          <div className="h-2 bg-gray-200 rounded w-24 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
