import { executeQuery } from "../config/snowflake.js";

// Créer un nouvel abonnement
export const createSubscription = async (data) => {
  const {
    ID,
    STRIPE_SUBSCRIPTION_ID,
    SUBSCRIPTION_PLAN,
    SUBSCRIPTION_STATUS,
    STARTED_AT,
    EXPIRES_AT,
    LAST_PAYMENT_AT,
    NEXT_PAYMENT_AT,
  } = data;

  const query = `
    INSERT INTO MEDICAL_DB.MEDICAL_SCHEMA.SUBSCRIPTION 
    (ID, STRIPE_SUBSCRIPTION_ID, SUBSCRIPTION_PLAN, SUBSCRIPTION_STATUS, STARTED_AT, EXPIRES_AT, LAST_PAYMENT_AT, NEXT_PAYMENT_AT) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const values = [
    ID,
    STRIPE_SUBSCRIPTION_ID,
    SUBSCRIPTION_PLAN || "STARTER",
    SUBSCRIPTION_STATUS || "active",
    STARTED_AT || null,
    EXPIRES_AT || null,
    LAST_PAYMENT_AT || null,
    NEXT_PAYMENT_AT || null,
  ];

  try {
    await executeQuery(query, values);
    return { success: true };
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};

// Obtenir un abonnement par ID d'hôpital
export const getSubscriptionByHospitalId = async (hospitalId) => {
  const query = `
    SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.SUBSCRIPTION 
    WHERE ID = ?
  `;

  try {
    const result = await executeQuery(query, [hospitalId]);
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    throw error;
  }
};

// Obtenir un abonnement par ID Stripe
export const getSubscriptionByStripeId = async (stripeSubscriptionId) => {
  const query = `
    SELECT * FROM MEDICAL_DB.MEDICAL_SCHEMA.SUBSCRIPTION 
    WHERE STRIPE_SUBSCRIPTION_ID = ?
  `;

  try {
    const result = await executeQuery(query, [stripeSubscriptionId]);
    return result[0] || null;
  } catch (error) {
    console.error("Error fetching subscription by Stripe ID:", error);
    throw error;
  }
};

// Mettre à jour un abonnement
export const updateSubscription = async (subscriptionId, updateData) => {
  // Construire la requête SQL dynamiquement en fonction des champs fournis
  let setClause = "";
  const values = [];

  Object.entries(updateData).forEach(([key, value], index) => {
    if (index > 0) setClause += ", ";
    setClause += `${key} = ?`;
    values.push(value);
  });

  // Ajouter l'ID à la fin des valeurs
  values.push(subscriptionId);

  const query = `
    UPDATE MEDICAL_DB.MEDICAL_SCHEMA.SUBSCRIPTION 
    SET ${setClause}
    WHERE SUBSCRIPTION_ID = ?
  `;

  try {
    await executeQuery(query, values);
    return { success: true };
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
};

// Supprimer un abonnement
export const deleteSubscription = async (subscriptionId) => {
  const query = `
    DELETE FROM MEDICAL_DB.MEDICAL_SCHEMA.SUBSCRIPTION 
    WHERE SUBSCRIPTION_ID = ?
  `;

  try {
    await executeQuery(query, [subscriptionId]);
    return { success: true };
  } catch (error) {
    console.error("Error deleting subscription:", error);
    throw error;
  }
};
