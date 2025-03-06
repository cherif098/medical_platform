import express from "express";
import {
  createCheckoutSession,
  checkSessionStatus,
  createHospitalAfterPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

// Route pour créer une session de paiement Stripe
router.post("/create-checkout-session", createCheckoutSession);

// Route pour vérifier le statut d'une session
router.get("/check-session", checkSessionStatus);

// Route pour créer un hôpital après un paiement réussi
router.post("/create-hospital", createHospitalAfterPayment);

export default router;
