import express from "express";
import {
  createPaymentSession,
  confirmPayment,
  cancelSubscription,
  getSubscriptionStatus,
} from "../controllers/stripeController.js";
import authDoctor from "../middlewares/authDoctor.js";

const stripeRouter = express.Router();

stripeRouter.post("/create-payment", authDoctor, createPaymentSession);
stripeRouter.post("/confirm-payment", authDoctor, confirmPayment);
stripeRouter.post("/cancel-subscription", authDoctor, cancelSubscription);
stripeRouter.get("/status", authDoctor, getSubscriptionStatus);

export default stripeRouter;
