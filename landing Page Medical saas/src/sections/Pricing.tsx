"use client";
import CheckIcon from "@/assets/check.svg";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { useState } from "react";

const pricingTiers = [
  {
    title: "Starter",
    monthlyPrice: 99,
    buttonText: "Start your free trial",
    trialPeriod: "14-day free trial",
    popular: false,
    inverse: false,
    features: [
      "Up to 50 staff accounts",
      "Patient management system",
      "Basic scheduling and calendar",
      "5GB storage",
      "Basic analytics",
      "Standard support",
    ],
  },
  {
    title: "Pro",
    monthlyPrice: 249,
    buttonText: "Upgrade to Pro",
    popular: true,
    inverse: true,
    features: [
      "Up to 200 staff accounts",
      "Advanced patient management",
      "Advanced scheduling and shift management",
      "50GB storage",
      "Detailed analytics and reporting",
      "Priority support",
      "AI-assisted diagnosis suggestions",
      "AI-powered appointment optimization",
      "Export capabilities (PDF, CSV)",
    ],
  },
  {
    title: "Business",
    monthlyPrice: 499,
    buttonText: "Contact us for Business",
    popular: false,
    inverse: false,
    features: [
      "Unlimited staff accounts",
      "Comprehensive patient and department management",
      "Custom workflows and integrations",
      "200GB storage",
      "Advanced analytics with predictive insights",
      "Dedicated account manager",
      "AI-powered hospital resource optimization",
      "AI-driven patient engagement tools",
      "API access for custom integrations",
      "Enhanced security and compliance tools",
      "24/7 dedicated support",
    ],
  },
];

export const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<{
    title: string;
    monthlyPrice: number;
  } | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="container">
        <div className="section-heading">
          <h2 className="section-title">Pricing Plans</h2>
          <p className="section-description mt-5">
            Start with a 14-day free trial. Upgrade for AI-powered tools,
            advanced security, and full hospital management features.
          </p>
        </div>
        <div className="flex flex-col gap-6 items-center mt-10 lg:flex-row lg:items-end lg:justify-center">
          {pricingTiers.map(
            (
              { title, monthlyPrice, buttonText, popular, inverse, features },
              tierIndex
            ) => (
              <div
                key={tierIndex}
                className={twMerge(
                  "card",
                  inverse === true && "border-black bg-black text-white"
                )}
              >
                <div className="flex justify-between">
                  <h3
                    className={twMerge(
                      "text-lg font-bold text-black/50",
                      inverse === true && "text-white/60"
                    )}
                  >
                    {title}
                  </h3>
                  {popular === true && (
                    <div className="inline-flex text-sm px-4 py-1.5 rounded-xl border border-white/20">
                      <motion.span
                        animate={{
                          backgroundPositionX: "100%",
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                          repeatType: "loop",
                        }}
                        className="bg-[linear-gradient(to_right,#DD7DDF,#E1CD86,#BBCB92,#71C2EF,#3BFFFF,#DD7DDF,#E1CD86,#BBCB92,#71C2EF,#3BFFFF,#DD7DDF)] [background-size:200%] text-transparent bg-clip-text font-medium"
                      >
                        Popular
                      </motion.span>
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mt-[30px]">
                  <span className="text-4xl font-bold tracking-tighter leading-none">
                    ${monthlyPrice}
                  </span>
                  <span className="tracking-tight font-bold text-black/50">
                    /month
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPlan({ title, monthlyPrice })}
                  className={twMerge(
                    "btn btn-primary w-full mt-[30px]",
                    inverse === true && "bg-white text-black"
                  )}
                >
                  {buttonText}
                </button>
                <ul className="flex flex-col gap-5 mt-8">
                  {features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="text-sm flex items-center gap-4"
                    >
                      <CheckIcon className="h-6 w-6" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>

        {/* Afficher le formulaire lorsqu'un plan est sélectionné */}
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          >
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-lg w-full max-w-md">
                <h3 className="text-xl font-bold mb-6">
                  Complete Your Subscription
                </h3>
                <SubscriptionForm
                  subscriptionPlan={selectedPlan.title}
                  monthlyPrice={selectedPlan.monthlyPrice}
                />
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
