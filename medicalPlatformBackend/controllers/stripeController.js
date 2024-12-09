import Stripe from "stripe";
import {
  updateDoctorSubscription,
  updateStripeCustomerId,
  getDoctorSubscriptionInfo,
} from "../models/subscriptionModel.js";
import { getDoctorById } from "../models/doctorModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLAN_PRICES = {
  PRO: 2000, // $20.00
  PLATINUM: 5000, // $50.00
};

export const createPaymentSession = async (req, res) => {
  try {
    const doctorId = req.user.DOCTOR_ID;
    const plan = req.body.plan || "PRO"; // Default to PRO if no plan specified
    const doctor = await getDoctorById(doctorId);

    // Create or get Stripe customer
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

    // Create payment session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan} Plan Subscription`,
              description: `One-time payment for ${plan} access`,
            },
            unit_amount: PLAN_PRICES[plan],
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        doctorId: doctorId.toString(),
        plan: plan,
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
      const plan = session.metadata.plan;
      await updateDoctorSubscription(doctorId, plan);

      res.json({
        success: true,
        message: "Subscription upgraded successfully",
        plan: plan,
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
