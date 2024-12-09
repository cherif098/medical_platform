import React, { useContext, useState, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { ArrowRight, Check, X, Loader2, Zap, ArrowDown } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const SubscriptionPlan = () => {
  const {
    subscriptionPlan,
    fetchSubscriptionStatus,
    downgradeToBasic,
    initiateSubscriptionPayment,
    backendUrl,
    getHeaders,
  } = useContext(DoctorContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const plans = {
    basic: {
      name: "Basic",
      price: "Free",
      period: "Forever",
      features: [
        "Basic Patient Management",
        "Appointment Scheduling",
        "Medical Reports",
        "Profile Management",
      ],
    },
    pro: {
      name: "Pro",
      price: "$20",
      period: "/month",
      features: [
        "Everything in Basic",
        "AI Medical Assistant",
        "Advanced Patient Analytics",
        "Priority Support 24/7",
        "Custom Report Templates",
        "Unlimited Patient Records",
      ],
    },
    platinum: {
      name: "Platinum",
      price: "$50",
      period: "/month",
      features: [
        "Everything in Pro",
        "AI Image Scanner",
        "Premium Support",
        "Custom Analytics Dashboard",
        "Advanced AI Features",
        "Priority Feature Updates",
      ],
    },
  };

  useEffect(() => {
    fetchSubscriptionStatus();
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
        toast.success(`Successfully upgraded to ${data.plan}!`);
        if (data.plan === "PRO" || data.plan === "PLATINUM") {
          navigate("/ai-assistant");
        }
      }
    } catch (error) {
      toast.error("Error confirming payment");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    setLoading(true);
    try {
      await initiateSubscriptionPayment(plan);
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

        {/* Bouton de retour au plan Basic */}
        {subscriptionPlan !== "BASIC" && (
          <button
            onClick={handleDowngrade}
            disabled={loading}
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Downgrading...
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 mr-2" />
                Return to Basic Plan
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {Object.entries(plans).map(([planKey, plan]) => (
          <div
            key={planKey}
            className={`rounded-2xl border ${
              subscriptionPlan === planKey.toUpperCase()
                ? "border-primary shadow-lg"
                : "border-gray-200"
            } p-6 ${
              planKey === "platinum"
                ? "bg-gradient-to-br from-gray-50 to-purple-50"
                : planKey === "pro"
                ? "bg-gray-50"
                : ""
            } relative`}
          >
            {subscriptionPlan === planKey.toUpperCase() && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                  Current Plan
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <p className="text-3xl font-bold">{plan.price}</p>
              <p className="text-gray-500">{plan.period}</p>
            </div>

            <div className="space-y-4">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <Check
                    className={`h-5 w-5 ${
                      planKey === "platinum"
                        ? "text-purple-500"
                        : planKey === "pro"
                        ? "text-primary"
                        : "text-gray-400"
                    }`}
                  />
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
            ) : (
              subscriptionPlan !== planKey.toUpperCase() &&
              planKey !== "basic" && (
                <button
                  onClick={() => handleUpgrade(planKey.toUpperCase())}
                  className={`mt-6 w-full ${
                    planKey === "platinum"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                      : "bg-primary hover:bg-primary/90"
                  } text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors`}
                >
                  Upgrade to {plan.name}
                  {planKey === "platinum" ? (
                    <Zap className="h-5 w-5" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlan;
