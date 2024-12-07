// pages/Doctors/PaymentCancel.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const PaymentCancel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/subscription-plans");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <div className="mb-4 flex justify-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <X className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement annulé
        </h2>
        <p className="text-gray-600 mb-4">
          Le paiement a été annulé. Vous allez être redirigé vers la page des
          abonnements.
        </p>
        <div className="animate-pulse">
          <div className="h-2 bg-gray-200 rounded w-24 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
