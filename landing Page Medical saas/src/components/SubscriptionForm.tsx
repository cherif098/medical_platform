"use client";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

// Types pour les données du formulaire
type FormData = {
  NAME: string;
  ADDRESS: string;
  EMAIL: string;
  PHONE_NUMBER: string;
  PASSWORD: string;
  CONFIRM_PASSWORD: string;
};

// Initialisation de Stripe avec la clé publique
const stripePromise = loadStripe(
  "pk_test_51L5Le5JvbPhK7s1efWSQLZYAdfnJlfreQeTRuOhEFqkzCReX5VNw807ZWNYPDGqzvDcHzWDIYnWnGjLvXiqcsEBj00UKfiZUIm"
);

export const SubscriptionForm = ({
  subscriptionPlan,
  monthlyPrice,
}: {
  subscriptionPlan: string;
  monthlyPrice: number;
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const [errorMessage, setErrorMessage] = useState("");

  // Surveiller le mot de passe pour la validation de confirmation
  const password = watch("PASSWORD");

  // Soumission du formulaire
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setErrorMessage("");

    try {
      // Stocker les données du formulaire dans sessionStorage pour les récupérer après paiement
      sessionStorage.setItem(
        "hospitalData",
        JSON.stringify({
          NAME: data.NAME,
          ADDRESS: data.ADDRESS,
          EMAIL: data.EMAIL,
          PHONE_NUMBER: data.PHONE_NUMBER,
          PASSWORD: data.PASSWORD,
        })
      );

      // Créer l'intention de paiement côté serveur
      const response = await axios.post(
        "http://localhost:4000/api/payment/create-checkout-session",
        {
          subscriptionPlan,
          monthlyPrice,
          hospitalData: {
            NAME: data.NAME,
            ADDRESS: data.ADDRESS,
            EMAIL: data.EMAIL,
            PHONE_NUMBER: data.PHONE_NUMBER,
            PASSWORD: data.PASSWORD,
          },
        }
      );

      // Rediriger vers la page de paiement Stripe
      const { sessionId } = response.data;
      const stripe = await stripePromise;

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId,
        });

        if (error) {
          setErrorMessage(
            error.message || "Une erreur est survenue lors du paiement."
          );
        }
      }
    } catch (error: any) {
      console.error("Error during payment setup:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Une erreur est survenue. Veuillez réessayer."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMessage && (
        <div className="bg-red-50 p-3 rounded-md border border-red-200">
          <p className="text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Champ Nom */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nom de l'hôpital
        </label>
        <input
          {...register("NAME", { required: "Le nom de l'hôpital est requis" })}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
        />
        {errors.NAME && (
          <p className="text-red-500 text-sm mt-1">{errors.NAME.message}</p>
        )}
      </div>

      {/* Champ Adresse */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Adresse
        </label>
        <input
          {...register("ADDRESS", { required: "L'adresse est requise" })}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
        />
        {errors.ADDRESS && (
          <p className="text-red-500 text-sm mt-1">{errors.ADDRESS.message}</p>
        )}
      </div>

      {/* Champ Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          {...register("EMAIL", {
            required: "L'email est requis",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Adresse email invalide",
            },
          })}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
        />
        {errors.EMAIL && (
          <p className="text-red-500 text-sm mt-1">{errors.EMAIL.message}</p>
        )}
      </div>

      {/* Champ Téléphone */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Numéro de téléphone
        </label>
        <input
          {...register("PHONE_NUMBER", {
            required: "Le numéro de téléphone est requis",
          })}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
        />
        {errors.PHONE_NUMBER && (
          <p className="text-red-500 text-sm mt-1">
            {errors.PHONE_NUMBER.message}
          </p>
        )}
      </div>

      {/* Champ Mot de passe */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <input
          type="password"
          {...register("PASSWORD", {
            required: "Le mot de passe est requis",
            minLength: {
              value: 8,
              message: "Le mot de passe doit contenir au moins 8 caractères",
            },
          })}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
        />
        {errors.PASSWORD && (
          <p className="text-red-500 text-sm mt-1">{errors.PASSWORD.message}</p>
        )}
      </div>

      {/* Champ Confirmation Mot de passe */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Confirmer le mot de passe
        </label>
        <input
          type="password"
          {...register("CONFIRM_PASSWORD", {
            required: "Veuillez confirmer votre mot de passe",
            validate: (value) =>
              value === password || "Les mots de passe ne correspondent pas",
          })}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black"
        />
        {errors.CONFIRM_PASSWORD && (
          <p className="text-red-500 text-sm mt-1">
            {errors.CONFIRM_PASSWORD.message}
          </p>
        )}
      </div>

      {/* Récapitulatif du plan */}
      <div className="mt-6 bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium text-sm text-gray-700">Récapitulatif</h4>
        <div className="mt-2 flex justify-between">
          <span className="text-sm text-gray-500">Plan sélectionné:</span>
          <span className="text-sm font-medium">{subscriptionPlan}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Prix mensuel:</span>
          <span className="text-sm font-medium">${monthlyPrice}/mois</span>
        </div>
      </div>

      {/* Bouton de Soumission */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          {isSubmitting ? "Traitement en cours..." : "Procéder au paiement"}
        </button>
      </div>
    </form>
  );
};
