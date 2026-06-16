import { SubscriptionPlanType } from "@prisma/client";

export const trialDurationDays = 30;

export const subscriptionPlanDefinitions = [
  {
    code: "STARTER",
    name: "Starter Free Forever",
    description: "Free forever merchant plan with starter limits.",
    planType: SubscriptionPlanType.STARTER,
    priceCents: 0,
    currency: "USD",
    productLimit: 20,
    monthlyOrderLimit: 50,
    liveCommerce: false,
    advancedAnalytics: false,
    multiStaff: false,
    aiMerchantAssistant: false,
    crmAdvanced: false,
    promotionFullAccess: false,
  },
  {
    code: "PRO",
    name: "Pro Merchant",
    description:
      "Growth plan with live commerce, unlimited catalog and orders, CRM, promotions, staff, and analytics.",
    planType: SubscriptionPlanType.PRO,
    priceCents: 2900,
    currency: "USD",
    productLimit: null,
    monthlyOrderLimit: null,
    liveCommerce: true,
    advancedAnalytics: true,
    multiStaff: true,
    aiMerchantAssistant: true,
    crmAdvanced: true,
    promotionFullAccess: true,
  },
  {
    code: "ENTERPRISE",
    name: "Enterprise Merchant",
    description: "Custom enterprise merchant plan for larger operators.",
    planType: SubscriptionPlanType.ENTERPRISE,
    priceCents: 0,
    currency: "USD",
    productLimit: null,
    monthlyOrderLimit: null,
    liveCommerce: true,
    advancedAnalytics: true,
    multiStaff: true,
    aiMerchantAssistant: true,
    crmAdvanced: true,
    promotionFullAccess: true,
  },
] as const;

export const founderBenefits = {
  founderBadge: true,
  proAccess: true,
  priorityPlacement: true,
  earlyFeatureAccess: true,
};
