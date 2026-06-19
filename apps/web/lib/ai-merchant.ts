import type { WorldShop } from "./api";
import type { MerchantIdentity } from "./living-world";

export type AiMerchantContext = {
  store: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    city: string;
    district: string;
    region: string;
    liveNow: boolean;
    reputation: number;
  };
  merchant: MerchantIdentity;
  products: WorldShop["featuredProducts"];
  promotions: {
    badge: string | null;
    banner: string | null;
    campaign: string | null;
  };
  visitor: {
    question: string;
  };
  boundaries: string[];
};

export type AiMerchantMessage = {
  id: string;
  role: "merchant" | "visitor";
  content: string;
};

export type AiShopkeeperProvider = "mock" | "openai";

export type AiMerchantResult = {
  provider: AiShopkeeperProvider;
  mode: "fallback" | "live";
  prompt: string;
  response: string;
};

export function buildAiMerchantContext(
  shop: WorldShop,
  merchant: MerchantIdentity,
  visitorQuestion = "",
): AiMerchantContext {
  return {
    store: {
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      description: shop.description ?? "A merchant storefront in Prontera.",
      category: shop.category,
      city: shop.city.name,
      district: shop.district.name,
      region: shop.city.region,
      liveNow: shop.liveNow,
      reputation: merchant.merchantReputation,
    },
    merchant,
    products: shop.featuredProducts,
    promotions: {
      badge: shop.promotionBadge ?? null,
      banner: shop.promotionBanner ?? null,
      campaign: shop.campaignBadge ?? null,
    },
    visitor: {
      question: visitorQuestion,
    },
    boundaries: [
      "You are a disclosed AI shopkeeper, not the human merchant.",
      "Use only published shop, merchant, product, promotion, and world context.",
      "Never invent products, prices, discounts, stock, shipping promises, policies, or guarantees.",
      "Do not approve refunds, price changes, exceptions, medical, legal, financial, or safety claims.",
      "If unsure, invite the visitor to ask the human merchant or check checkout/product details.",
      "Keep answers warm, brief, and conversational like an RPG shopkeeper.",
    ],
  };
}

export function buildAiMerchantPrompt(context: AiMerchantContext) {
  const productLines = context.products.length
    ? context.products
        .map((product) => {
          const price =
            product.priceCents == null
              ? "price not published"
              : `$${(product.priceCents / 100).toFixed(2)}`;
          return `- ${product.name} (${product.category}, ${price})`;
        })
        .join("\n")
    : "- No published featured products.";

  return [
    `Role: Disclosed AI shopkeeper for ${context.store.name}.`,
    `Voice: ${context.merchant.personality}.`,
    `Merchant: ${context.merchant.merchantName}, ${context.merchant.merchantTitle}.`,
    `Merchant story: ${context.merchant.merchantStory}`,
    `Merchant backstory: ${context.merchant.backstory}`,
    `Favorite quote: ${context.merchant.favoriteQuote}`,
    `Store: ${context.store.description}`,
    `Location: ${context.store.district}, ${context.store.city}, ${context.store.region}.`,
    `Category: ${context.store.category}.`,
    `Reputation: ${context.store.reputation.toFixed(1)}.`,
    `Live commerce: ${context.store.liveNow ? "Live now" : "Not live right now"}.`,
    `Products:\n${productLines}`,
    `Promotion badge: ${context.promotions.badge ?? "none"}.`,
    `Promotion board: ${context.promotions.banner ?? "No active published promotion"}.`,
    `Campaign badge: ${context.promotions.campaign ?? "none"}.`,
    `Boundaries:\n${context.boundaries.map((item) => `- ${item}`).join("\n")}`,
    `Visitor question: ${context.visitor.question}`,
  ].join("\n\n");
}

export function respondInMockMode(context: AiMerchantContext) {
  const message = context.visitor.question.toLowerCase();
  const merchant = context.merchant.merchantName;
  const firstProduct = context.products[0];
  const productNames = context.products.map((product) => product.name);
  const priceProducts = context.products.filter(
    (product) => product.priceCents != null,
  );

  if (matches(message, ["discount", "deal", "promotion", "promo", "sale"])) {
    return context.promotions.banner
      ? `Let me check today's merchant board. ${merchant} has posted: "${context.promotions.banner}" Checkout remains the final source for eligibility, but I can help you look at the featured shelf.`
      : `Let me check today's merchant board. I do not see a published promotion for ${context.store.name} right now. The promotion space is ready, so active campaigns can appear here when ${merchant} publishes one.`;
  }

  if (matches(message, ["recommend", "popular", "try", "start", "best"])) {
    if (!firstProduct) {
      return `Welcome traveler. ${merchant} is still arranging the public shelf, so I should not invent a product. I can tell you the shop story or explain what kind of goods this place focuses on.`;
    }
    return `Welcome traveler. For ${context.store.name}, I recommend starting with ${firstProduct.name}. It is featured on the shelf for visitors exploring ${context.store.category.toLowerCase()} goods. If you tell me what you care about most, I can narrow the choice using only published products.`;
  }

  if (matches(message, ["price", "cost", "how much", "expensive", "cheap"])) {
    if (!priceProducts.length) {
      return `I do not see published prices on the featured shelf yet. I should not guess, but the product cards and checkout will be the final source once ${merchant} publishes them.`;
    }
    const prices = priceProducts
      .slice(0, 3)
      .map(
        (product) =>
          `${product.name}: $${((product.priceCents ?? 0) / 100).toFixed(2)}`,
      )
      .join(", ");
    return `Here are the published prices I can see: ${prices}. Checkout remains the final authority for totals, taxes, and eligibility.`;
  }

  if (matches(message, ["story", "about", "owner", "merchant", "who are you"])) {
    return `${context.store.name} is run by ${merchant}, ${context.merchant.merchantTitle}. ${context.merchant.merchantStory} ${context.merchant.favoriteQuote}`;
  }

  if (matches(message, ["live", "broadcast", "stream", "room"])) {
    return context.store.liveNow
      ? `${merchant} is live right now. The live corner is open, so this is a good time to ask about featured products and demonstrations.`
      : `The live room is quiet right now. You can still ask me about the shelf, and ${merchant}'s next live session can appear here when scheduled.`;
  }

  if (matches(message, ["product", "sell", "shelf", "catalog", "goods"])) {
    return productNames.length
      ? `The featured shelf currently includes ${productNames.join(", ")}. I can compare them by category, price if published, or why a visitor might choose one.`
      : `The public shelf is still being prepared. I can talk about ${merchant}'s shop identity, but I should not invent unpublished products.`;
  }

  return `${context.merchant.greeting} I am ${merchant}'s disclosed AI shopkeeper. I can help with recommendations, prices that are published, promotions, live sessions, products, and the story behind this shop.`;
}

export async function askAiMerchant(
  context: AiMerchantContext,
): Promise<AiMerchantResult> {
  const prompt = buildAiMerchantPrompt(context);
  const response = respondInMockMode(context);
  return {
    provider: "mock",
    mode: "fallback",
    prompt,
    response,
  };
}

function matches(message: string, terms: string[]) {
  return terms.some((term) => message.includes(term));
}
