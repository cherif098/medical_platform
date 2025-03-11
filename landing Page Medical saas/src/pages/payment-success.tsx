import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  const router = useRouter();
  const { session_id, name, email, plan } = router.query;
  const [status, setStatus] = useState("loading");
  const [isCreatingHospital, setIsCreatingHospital] = useState(false);
  const [hospitalCreated, setHospitalCreated] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");

  useEffect(() => {
    // Attendre que router.query soit disponible
    if (!router.isReady) return;

    if (!session_id) {
      setStatus("error");
      setErrorDetails("Session ID manquant dans l'URL");
      return;
    }

    verifyPayment();
  }, [router.isReady, session_id]);

  const verifyPayment = async () => {
    try {
      // Vérifier le statut de la session
      const response = await axios.get(
        `http://localhost:4000/api/payment/check-session?session_id=${session_id}`
      );

      if (response.data.success && response.data.paymentStatus === "paid") {
        setStatus("success");

        // Essayer de créer l'hôpital automatiquement
        if (!hospitalCreated && !isCreatingHospital) {
          createHospital();
        }
      } else {
        setStatus("error");
        setErrorDetails("Le paiement n'a pas été confirmé par Stripe");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setStatus("error");
      setErrorDetails(
        error.response?.data?.message ||
          "Erreur lors de la vérification du paiement"
      );
    }
  };

  const createHospital = async () => {
    setIsCreatingHospital(true);

    try {
      // Récupérer les données du formulaire depuis sessionStorage
      const hospitalDataString = sessionStorage.getItem("hospitalData");

      if (!hospitalDataString) {
        setErrorDetails("Données de l'hôpital introuvables dans la session");
        setStatus("error");
        setIsCreatingHospital(false);
        return;
      }

      const hospitalData = JSON.parse(hospitalDataString);

      // Récupérer les paramètres de l'URL
      const hospitalName = name || hospitalData.NAME;
      const hospitalEmail = email || hospitalData.EMAIL;
      const subscriptionPlan = plan || "STARTER";

      // Créer l'hôpital via l'API
      const response = await axios.post(
        "http://localhost:4000/api/payment/create-hospital",
        {
          sessionId: session_id,
          name: hospitalName,
          email: hospitalEmail,
          address: hospitalData.ADDRESS,
          phone: hospitalData.PHONE_NUMBER,
          password: hospitalData.PASSWORD,
          plan: subscriptionPlan,
        }
      );

      if (response.data.success) {
        setHospitalCreated(true);
        // Nettoyer sessionStorage
        sessionStorage.removeItem("hospitalData");
      } else {
        setErrorDetails(
          response.data.message || "Échec de la création de l'hôpital"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'hôpital:", error);
      setErrorDetails(
        error.response?.data?.message ||
          "Erreur lors de la création de l'hôpital"
      );
    } finally {
      setIsCreatingHospital(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg"
      >
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold">
              Vérification du paiement...
            </h2>
            <p className="mt-2 text-gray-600">
              Veuillez patienter pendant que nous confirmons votre paiement.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-800">
              Paiement confirmé !
            </h2>
            <p className="mt-2 text-gray-600">
              Merci d'avoir souscrit à notre service.
              {hospitalCreated
                ? " Votre hôpital a été créé avec succès."
                : isCreatingHospital
                ? " Création de votre hôpital en cours..."
                : " Nous préparons la création de votre hôpital."}
            </p>

            <div className="mt-6 bg-gray-50 p-4 rounded text-left">
              <h3 className="font-medium text-gray-800">Informations</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Plan :</span>
                  <span className="text-sm font-medium">
                    {plan || "Standard"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Nom de l'hôpital :
                  </span>
                  <span className="text-sm font-medium">{name || "-"}</span>
                </div>
              </div>
            </div>

            {!hospitalCreated && !isCreatingHospital && (
              <button
                onClick={createHospital}
                className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900"
              >
                Créer mon hôpital
              </button>
            )}

            {hospitalCreated && (
              <div className="mt-8">
                <p className="text-sm text-gray-600 mb-4">
                  Vous pouvez maintenant vous connecter avec l'email et le mot
                  de passe que vous avez fournis.
                </p>
                <Link href="/login" className="btn btn-primary w-full">
                  Se connecter
                </Link>
              </div>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-800">
              Problème de vérification
            </h2>
            <p className="mt-2 text-gray-600">
              Nous n'avons pas pu vérifier votre paiement.{" "}
              {errorDetails && (
                <span className="block mt-2 text-sm text-red-500">
                  {errorDetails}
                </span>
              )}
            </p>
            <div className="mt-8 space-y-4">
              <Link href="/pricing" className="btn btn-primary w-full">
                Retour aux plans
              </Link>
              <Link href="/contact" className="btn btn-secondary w-full">
                Contacter le support
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
