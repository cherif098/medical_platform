import React, { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DoctorContext } from "../../context/DoctorContext";
import { Check } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { upgradeToPro, fetchSubscriptionStatus } = useContext(DoctorContext);

  useEffect(() => {
    const handleSuccess = async () => {
      const sessionId = searchParams.get("session_id");
      if (sessionId) {
        const success = await upgradeToPro(sessionId);
        await fetchSubscriptionStatus();
        if (success) {
          setTimeout(() => {
            navigate("/ai-assistant");
          }, 2000);
        } else {
          navigate("/subscription-plans");
        }
      } else {
        navigate("/subscription-plans");
      }
    };

    handleSuccess();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-4">
            Thank you for upgrading to Pro. You'll be redirected shortly.
          </p>
          <div className="animate-pulse">
            <div className="h-2 bg-gray-200 rounded w-24 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
