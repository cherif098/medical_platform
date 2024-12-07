import { executeQuery } from "../config/snowflake.js";

export const updateDoctorSubscription = async (doctorId, plan) => {
  const query = `
        UPDATE MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
        SET SUBSCRIPTION_PLAN = ?
        WHERE DOCTOR_ID = ?
    `;

  await executeQuery(query, [plan, doctorId]);
};

export const updateStripeCustomerId = async (doctorId, stripeCustomerId) => {
  const query = `
        UPDATE MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
        SET STRIPE_CUSTOMER_ID = ?
        WHERE DOCTOR_ID = ?
    `;

  await executeQuery(query, [stripeCustomerId, doctorId]);
};

export const getDoctorSubscriptionInfo = async (doctorId) => {
  const query = `
        SELECT SUBSCRIPTION_PLAN, STRIPE_CUSTOMER_ID
        FROM MEDICAL_DB.MEDICAL_SCHEMA.DOCTORS
        WHERE DOCTOR_ID = ?
    `;

  const result = await executeQuery(query, [doctorId]);
  return result[0];
};
