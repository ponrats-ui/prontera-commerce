import type { WorldShop } from "./api";
import type { MerchantIdentity } from "./living-world";

export type AiMerchantContext = {
  store: {
    name: string;
    description: string;
    category: string;
    district: string;
  };
  merchant: MerchantIdentity;
  products: WorldShop["featuredProducts"];
  promotions: {
    badge: string | null;
    banner: string | null;
    campaign: string | null;
  };
  boundaries: string[];
};

export type AiMerchantMessage = {
  id: string;
  role: "merchant" | "visitor";
  content: string;
};

export function buildAiMerchantContext(
  shop: WorldShop,
  merchant: MerchantIdentity,
): AiMerchantContext {
  return {
    store: {
      name: shop.name,
      description: shop.description ?? "A merchant storefront in Prontera.",
      category: shop.category,
      district: shop.district.name,
    },
    merchant,
    products: shop.featuredProducts,
    promotions: {
      badge: shop.promotionBadge ?? null,
      banner: shop.promotionBanner ?? null,
      campaign: shop.campaignBadge ?? null,
    },
    boundaries: [
      "Never invent products, prices, discounts, policies, or stock.",
      "Never approve refunds, price changes, exceptions, or legal claims.",
      "Clearly identify the assistant as AI.",
      "Escalate uncertain or sensitive requests to the human merchant.",
    ],
  };
}

export function buildAiMerchantPrompt(
  context: AiMerchantContext,
  visitorMessage: string,
) {
  return [
    `You are the disclosed AI shopkeeper for ${context.store.name}.`,
    `Speak with a ${context.merchant.personality} voice.`,
    `Merchant: ${context.merchant.merchantName}, ${context.merchant.merchantTitle}.`,
    `Store: ${context.store.description}`,
    `Products: ${context.products.map((product) => product.name).join(", ") || "No published featured products"}.`,
    `Promotion: ${context.promotions.banner ?? "No active published promotion"}.`,
    `Boundaries: ${context.boundaries.join(" ")}`,
    `Visitor: ${visitorMessage}`,
  ].join("\n");
}

export function respondInMockMode(
  context: AiMerchantContext,
  visitorMessage: string,
) {
  const message = visitorMessage.toLowerCase();
  const merchant = context.merchant.merchantName;
  const firstProduct = context.products[0];
  const productNames = context.products.map((product) => product.name);

  if (
    message.includes("discount") ||
    message.includes("deal") ||
    message.includes("promotion")
  ) {
    return context.promotions.banner
      ? `${merchant}'s current published offer is “${context.promotions.banner}.” I can show you the featured shelf, but checkout remains the final authority for price and eligibility.`
      : `There is no published promotion in ${context.store.name} right now. I will not invent a discount, but you can check back after the merchant updates the promotion board.`;
  }

  if (
    message.includes("recommend") ||
    message.includes("popular") ||
    message.includes("try")
  ) {
    return firstProduct
      ? `A good place to start is ${firstProduct.name}. It is featured by ${merchant}${firstProduct.category ? ` in the ${firstProduct.category} collection` : ""}. Tell me what you value most and I can narrow the shelf without guessing beyond the published products.`
      : `${merchant} is still preparing the featured shelf. I can tell you the store story, but I should not recommend an unpublished product.`;
  }

  if (message.includes("who") || message.includes("owner")) {
    return `${context.merchant.merchantName} is the ${context.merchant.merchantTitle} behind this shop. ${context.merchant.merchantStory}`;
  }

  if (message.includes("product") || message.includes("sell")) {
    return productNames.length
      ? `The featured shelf currently includes ${productNames.join(", ")}. Which one would you like to explore?`
      : `The public shelf is still being arranged. I should wait for ${merchant} to publish products rather than make something up.`;
  }

  return `${context.merchant.greeting} I am ${merchant}'s AI shopkeeper in mock mode. I can help with published products, current promotions, and the merchant's story.`;
}

export type AiMerchantResult = {
  provider: "mock";
  prompt: string;
  response: string;
};

export async function askAiMerchant(
  context: AiMerchantContext,
  visitorMessage: string,
): Promise<AiMerchantResult> {
  return {
    provider: "mock",
    prompt: buildAiMerchantPrompt(context, visitorMessage),
    response: respondInMockMode(context, visitorMessage),
  };
}
