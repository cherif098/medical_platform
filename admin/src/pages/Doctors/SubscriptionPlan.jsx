import React, { useContext, useState, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import {
  ArrowRight,
  Check,
  Loader2,
  Stethoscope,
  Brain,
  Beaker,
  Shield,
  Clock,
  Users,
  FileText,
  Crown,
  Sparkles,
  ArrowDown,
} from "lucide-react";
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
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [processingPlan, setProcessingPlan] = useState(null);

  const plans = {
    basic: {
      name: "Essentiel",
      description: "L'essentiel pour gérer votre cabinet médical",
      price: "Gratuit",
      period: "à vie",
      icon: <Stethoscope className="w-6 h-6" />,
      features: [
        { icon: <Users className="w-4 h-4" />, text: "Gestion des patients" },
        {
          icon: <Clock className="w-4 h-4" />,
          text: "Planification des rendez-vous",
        },
        {
          icon: <FileText className="w-4 h-4" />,
          text: "Rapports médicaux basiques",
        },
        { icon: <Shield className="w-4 h-4" />, text: "Sécurité des données" },
      ],
    },
    pro: {
      name: "Expert",
      description: "Pour les médecins qui veulent plus d'efficacité",
      price: "20$",
      period: "/mois",
      icon: <Brain className="w-6 h-6" />,
      features: [
        {
          icon: <Check className="w-4 h-4" />,
          text: "Tout de l'offre Essentiel",
        },
        { icon: <Brain className="w-4 h-4" />, text: "Assistant IA médical" },
        {
          icon: <Users className="w-4 h-4" />,
          text: "Analyses patients avancées",
        },
        {
          icon: <Clock className="w-4 h-4" />,
          text: "Support prioritaire 24/7",
        },
        {
          icon: <FileText className="w-4 h-4" />,
          text: "Templates personnalisés",
        },
        {
          icon: <Shield className="w-4 h-4" />,
          text: "Dossiers patients illimités",
        },
      ],
    },
    platinum: {
      name: "Premium",
      description: "L'excellence pour votre pratique médicale",
      price: "50$",
      period: "/mois",
      icon: <Crown className="w-6 h-6" />,
      features: [
        { icon: <Check className="w-4 h-4" />, text: "Tout de l'offre Expert" },
        { icon: <Brain className="w-4 h-4" />, text: "Scanner IA d'images" },
        { icon: <Shield className="w-4 h-4" />, text: "Support VIP dédié" },
        {
          icon: <Beaker className="w-4 h-4" />,
          text: "Dashboard analytique personnalisé",
        },
        {
          icon: <Sparkles className="w-4 h-4" />,
          text: "Fonctionnalités IA avancées",
        },
        {
          icon: <Crown className="w-4 h-4" />,
          text: "Accès prioritaire aux nouveautés",
        },
      ],
    },
  };

  useEffect(() => {
    const initPage = async () => {
      await fetchSubscriptionStatus();
      const session_id = searchParams.get("session_id");
      if (session_id) {
        handlePaymentSuccess(session_id);
      }
    };
    initPage();
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
        toast.success(`Mise à niveau vers ${data.plan} réussie !`);
        if (data.plan === "PRO" || data.plan === "PLATINUM") {
          navigate("/ai-assistant");
        }
      }
    } catch (error) {
      toast.error("Erreur lors de la confirmation du paiement");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    try {
      setProcessingPlan(plan);
      await initiateSubscriptionPayment(plan);
    } catch (error) {
      toast.error("Erreur lors de l'initialisation du paiement");
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleDowngrade = async () => {
    try {
      setLoading(true);
      const success = await downgradeToBasic();
      if (success) {
        await fetchSubscriptionStatus();
        toast.success("Retour au plan Essentiel effectué");
      }
    } catch (error) {
      toast.error("Erreur lors du changement de plan");
    } finally {
      setLoading(false);
    }
  };

  // Composant de carte pour un plan
  const PlanCard = ({ planKey, plan, isCurrentPlan }) => {
    const isPremium = planKey === "platinum";
    const isPro = planKey === "pro";

    return (
      <div
        className={`relative group transition-all duration-300 ${
          hoveredPlan === planKey ? "scale-[1.02]" : "scale-100"
        }`}
        onMouseEnter={() => setHoveredPlan(planKey)}
        onMouseLeave={() => setHoveredPlan(null)}
      >
        <div
          className={`
          relative rounded-[2rem] p-8 h-full 
          ${
            isCurrentPlan
              ? "border-2 border-primary shadow-lg shadow-primary/10"
              : "border border-gray-100 shadow-md"
          }
          ${
            isPremium
              ? "bg-gradient-to-br from-gray-50 via-purple-50 to-gray-50"
              : isPro
              ? "bg-gradient-to-br from-gray-50 via-primary/5 to-gray-50"
              : "bg-white"
          }
        `}
        >
          {/* Badge Plan actuel */}
          {isCurrentPlan && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                Plan actuel
              </span>
            </div>
          )}

          {/* En-tête du plan */}
          <div className="text-center mb-8">
            <div
              className={`
              inline-flex items-center justify-center w-16 h-16 rounded-full mb-4
              ${
                isPremium
                  ? "bg-purple-100 text-purple-600"
                  : isPro
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-100 text-gray-600"
              }
            `}
            >
              {plan.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {plan.name}
            </h3>
            <p className="text-gray-500 mb-4">{plan.description}</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-gray-900">
                {plan.price}
              </span>
              <span className="text-gray-500">{plan.period}</span>
            </div>
          </div>

          {/* Liste des fonctionnalités */}
          <div className="space-y-4 mb-8">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`
                  flex-shrink-0
                  ${
                    isPremium
                      ? "text-purple-500"
                      : isPro
                      ? "text-primary"
                      : "text-gray-400"
                  }
                `}
                >
                  {feature.icon}
                </div>
                <span className="text-gray-600">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Bouton d'action */}
          {!isCurrentPlan && planKey !== "basic" && (
            <button
              onClick={() => handleUpgrade(planKey.toUpperCase())}
              disabled={loading || processingPlan === planKey.toUpperCase()}
              className={`
                w-full py-4 px-6 rounded-xl font-medium text-white
                transition-all duration-200 flex items-center justify-center gap-2
                ${
                  loading || processingPlan === planKey.toUpperCase()
                    ? "bg-gray-300 cursor-not-allowed"
                    : isPremium
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                    : "bg-primary hover:bg-primary/90"
                }
                ${hoveredPlan === planKey ? "shadow-lg scale-[1.02]" : "shadow"}
              `}
            >
              {processingPlan === planKey.toUpperCase() ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Passer au plan {plan.name}
                  {isPremium ? (
                    <Crown className="w-5 h-5" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Choisissez votre plan
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Améliorez votre pratique médicale avec nos outils avancés. Plan
            actuel:{" "}
            <span className="text-primary font-medium">{subscriptionPlan}</span>
          </p>

          {subscriptionPlan !== "BASIC" && (
            <button
              onClick={handleDowngrade}
              disabled={loading}
              className="mt-6 inline-flex items-center px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-2" />
              )}
              Revenir au plan Essentiel
            </button>
          )}
        </div>

        {/* Grille des plans */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {Object.entries(plans).map(([planKey, plan]) => (
            <PlanCard
              key={planKey}
              planKey={planKey}
              plan={plan}
              isCurrentPlan={subscriptionPlan === planKey.toUpperCase()}
            />
          ))}
        </div>

        {/* Note de bas de page */}
        <p className="text-center text-sm text-gray-500 mt-12">
          Tous nos plans incluent la sécurité des données et le support
          technique. Annulez à tout moment.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlan;
