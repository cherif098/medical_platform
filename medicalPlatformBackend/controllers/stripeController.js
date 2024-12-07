import Stripe from "stripe";
import {
  updateDoctorSubscription,
  updateStripeCustomerId,
  getDoctorSubscriptionInfo,
} from "../models/subscriptionModel.js";
import { getDoctorById } from "../models/doctorModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentSession = async (req, res) => {
  try {
    const doctorId = req.user.DOCTOR_ID;
    const doctor = await getDoctorById(doctorId);

    // Créer ou récupérer le client Stripe
    let stripeCustomerId = doctor.STRIPE_CUSTOMER_ID;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: doctor.EMAIL,
        name: doctor.NAME,
        metadata: {
          doctorId: doctorId.toString(),
        },
      });
      stripeCustomerId = customer.id;
      await updateStripeCustomerId(doctorId, stripeCustomerId);
    }

    // Créer la session de paiement
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Pro Plan Subscription",
              description: "One-time payment for Pro access",
            },
            unit_amount: 2000, // $20.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        doctorId: doctorId.toString(),
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Error creating payment session:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { session_id } = req.body;
    const doctorId = req.user.DOCTOR_ID;

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === "paid") {
      await updateDoctorSubscription(doctorId, "PRO");

      res.json({
        success: true,
        message: "Subscription upgraded successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const doctorId = req.user.DOCTOR_ID;
    await updateDoctorSubscription(doctorId, "BASIC");

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSubscriptionStatus = async (req, res) => {
  try {
    const doctorId = req.user.DOCTOR_ID;
    const subscriptionInfo = await getDoctorSubscriptionInfo(doctorId);

    res.json({
      success: true,
      plan: subscriptionInfo.SUBSCRIPTION_PLAN || "BASIC",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
