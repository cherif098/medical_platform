import Stripe from "stripe";
import {
  createHospital,
  checkHospitalExists,
} from "../models/hospitalModel.js";
import { createSubscription } from "../models/subscriptionModel.js";
import bcrypt from "bcryptjs";

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Créer une session de paiement Stripe
export const createCheckoutSession = async (req, res) => {
  try {
    const { subscriptionPlan, monthlyPrice, hospitalData } = req.body;

    // Validation des données
    if (!subscriptionPlan || !monthlyPrice || !hospitalData) {
      return res.status(400).json({
        success: false,
        message: "Données de paiement ou d'hôpital manquantes",
      });
    }

    // Vérifier si l'hôpital existe déjà
    const hospitalExists = await checkHospitalExists(
      hospitalData.NAME,
      hospitalData.EMAIL
    );

    if (hospitalExists) {
      return res.status(400).json({
        success: false,
        message: "Un hôpital avec ce nom ou cette adresse email existe déjà.",
      });
    }

    // Créer une session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Plan ${subscriptionPlan}`,
              description: `Abonnement mensuel au plan ${subscriptionPlan} pour votre hôpital`,
            },
            unit_amount: monthlyPrice * 100, // Montant en centimes
          },
          quantity: 1,
        },
      ],
      mode: "payment", // Mode paiement unique
      success_url: `${
        process.env.FRONTEND_URL
      }/payment-success?session_id={CHECKOUT_SESSION_ID}&name=${encodeURIComponent(
        hospitalData.NAME
      )}&email=${encodeURIComponent(
        hospitalData.EMAIL
      )}&plan=${encodeURIComponent(subscriptionPlan)}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
    });

    res.status(200).json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error(
      "Erreur lors de la création de la session de paiement:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Une erreur s'est produite lors de la préparation du paiement.",
      error: error.message,
    });
  }
};

// Créer un hôpital après paiement réussi
export const createHospitalAfterPayment = async (req, res) => {
  try {
    const { name, email, address, phone, plan, password, sessionId } = req.body;

    // Validation des données
    if (!name || !email || !password || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Données manquantes pour la création de l'hôpital",
      });
    }

    // Vérifier la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Le paiement n'a pas été effectué.",
      });
    }

    // Vérifier si l'hôpital existe déjà
    const hospitalExists = await checkHospitalExists(name, email);
    if (hospitalExists) {
      return res.status(400).json({
        success: false,
        message: "Un hôpital avec ce nom ou cette adresse email existe déjà.",
      });
    }

    // Générer un ID numérique pour l'hôpital et l'abonnement
    // Dans Snowflake, l'ID de l'hôpital sera généré automatiquement par la séquence HOSPITAL_ID_SEQ.NEXTVAL
    // Nous n'avons donc pas besoin de fournir un ID manuellement pour l'hôpital

    // Pour l'abonnement, nous allons utiliser un timestamp comme ID temporaire
    const tempSubscriptionId = Math.floor(Date.now());

    // Créer un abonnement dans la base de données
    const subscriptionData = {
      ID: tempSubscriptionId, // ID numérique pour respecter le schéma Snowflake
      STRIPE_SUBSCRIPTION_ID: sessionId,
      SUBSCRIPTION_PLAN: plan,
      SUBSCRIPTION_STATUS: "active",
      STARTED_AT: new Date().toISOString(),
      EXPIRES_AT: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
      LAST_PAYMENT_AT: new Date().toISOString(),
      NEXT_PAYMENT_AT: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(), // +30 jours
    };

    try {
      await createSubscription(subscriptionData);
    } catch (error) {
      console.error("Erreur lors de la création de l'abonnement:", error);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la création de l'abonnement.",
        error: error.message,
      });
    }

    // Créer l'hôpital dans la base de données
    const hospitalData = {
      NAME: name,
      ADDRESS: address || "",
      EMAIL: email,
      PHONE_NUMBER: phone || "",
      PASSWORD: password,
      SUBSCRIPTION_STATUS: plan,
      SUBSCRIPTION_ID: tempSubscriptionId, // Lien vers l'abonnement créé précédemment
      TOTAL_BEDS: 0, // Valeur par défaut
    };

    try {
      await createHospital(hospitalData);

      res.status(200).json({
        success: true,
        message: "Hôpital créé avec succès après paiement.",
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'hôpital:", error);
      res.status(500).json({
        success: false,
        message: "Une erreur s'est produite lors de la création de l'hôpital.",
        error: error.message,
      });
    }
  } catch (error) {
    console.error(
      "Erreur lors de la création de l'hôpital après paiement:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Une erreur s'est produite lors de la création de l'hôpital.",
      error: error.message,
    });
  }
};

// Vérifier le statut d'une session de paiement
export const checkSessionStatus = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "ID de session manquant",
      });
    }

    // Récupérer les détails de la session depuis Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session non trouvée",
      });
    }

    // Vérifier si le paiement a réussi
    if (session.payment_status === "paid") {
      return res.status(200).json({
        success: true,
        paymentStatus: session.payment_status,
        amount: session.amount_total / 100,
        customer: session.customer_details,
      });
    } else {
      return res.status(200).json({
        success: false,
        paymentStatus: session.payment_status,
        message: "Le paiement n'a pas encore été confirmé",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de la session:", error);
    res.status(500).json({
      success: false,
      message: "Une erreur s'est produite lors de la vérification du paiement.",
      error: error.message,
    });
  }
};
