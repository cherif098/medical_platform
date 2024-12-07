import React, { useContext, useState, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { ArrowRight, Check, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const SubscriptionPlan = () => {
  const {
    subscriptionPlan,
    fetchSubscriptionStatus,
    downgradeToBasic,
    backendUrl,
    getHeaders,
  } = useContext(DoctorContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const features = [
    "AI Medical Assistant Integration",
    "Advanced Patient Analytics",
    "Priority Support 24/7",
    "Custom Medical Report Templates",
    "Unlimited Patient Records",
    "Advanced Scheduling Features",
  ];

  useEffect(() => {
    fetchSubscriptionStatus();

    // Vérifier si retour de paiement réussi
    const session_id = searchParams.get("session_id");
    if (session_id) {
      handlePaymentSuccess(session_id);
    }
  }, []);

  const handlePaymentSuccess = async (sessionId) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/stripe/confirm-payment`,
        { session_id: sessionId },
        getHeaders()
      );
      if (data.success) {
        await fetchSubscriptionStatus();
        toast.success("Successfully upgraded to Pro!");
        navigate("/ai-assistant");
      }
    } catch (error) {
      toast.error("Error confirming payment");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/stripe/create-payment`,
        {},
        getHeaders()
      );
      if (data.success && data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error("Error initiating payment");
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async () => {
    setLoading(true);
    try {
      const success = await downgradeToBasic();
      if (success) {
        await fetchSubscriptionStatus();
        toast.success("Successfully downgraded to Basic plan");
      }
    } catch (error) {
      toast.error("Error downgrading subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Subscription Plans
        </h1>
        <p className="mt-2 text-gray-600">
          Current plan:{" "}
          <span className="font-semibold text-primary">{subscriptionPlan}</span>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Basic Plan */}
        <div
          className={`rounded-2xl border ${
            subscriptionPlan === "BASIC"
              ? "border-primary shadow-lg"
              : "border-gray-200"
          } p-6 relative`}
        >
          {subscriptionPlan === "BASIC" && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                Current Plan
              </span>
            </div>
          )}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Basic</h2>
            <p className="text-3xl font-bold">Free</p>
            <p className="text-gray-500">Forever</p>
          </div>
          <div className="space-y-4">
            {features.slice(0, 2).map((feature, index) => (
              <div key={index} className="flex items-center">
                <Check className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-gray-600">{feature}</span>
              </div>
            ))}
            {features.slice(2).map((feature, index) => (
              <div key={index} className="flex items-center text-gray-400">
                <X className="h-5 w-5" />
                <span className="ml-2">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Plan */}
        <div
          className={`rounded-2xl border ${
            subscriptionPlan === "PRO"
              ? "border-primary shadow-lg"
              : "border-gray-200"
          } p-6 bg-gray-50 relative`}
        >
          {subscriptionPlan === "PRO" && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                Current Plan
              </span>
            </div>
          )}
          <div className="absolute -top-3 right-6">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Recommended
            </span>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Pro</h2>
            <p className="text-3xl font-bold">$20</p>
            <p className="text-gray-500">one time payment</p>
          </div>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <Check className="h-5 w-5 text-primary" />
                <span className="ml-2">{feature}</span>
              </div>
            ))}
          </div>

          {loading ? (
            <button
              disabled
              className="mt-6 w-full bg-gray-200 text-gray-500 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading...
            </button>
          ) : subscriptionPlan === "BASIC" ? (
            <button
              onClick={handleUpgrade}
              className="mt-6 w-full bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              Upgrade to Pro
              <ArrowRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleDowngrade}
              className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              Downgrade to Basic
              <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlan;
