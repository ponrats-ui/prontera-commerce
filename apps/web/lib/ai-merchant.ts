import type { WorldShop } from "./api";
import type { MerchantIdentity } from "./living-world";
import { getMerchantSoul, type MerchantSoul } from "./merchant-soul";

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
  soul: MerchantSoul;
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
  soul = getMerchantSoul(shop),
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
    soul,
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
    `Merchant soul class: ${context.soul.merchantClass}.`,
    `Personality type: ${context.soul.personalityType}.`,
    `Communication style: ${context.soul.communicationStyle}.`,
    `Personal goal: ${context.soul.personalGoal}.`,
    `Favorite product: ${context.soul.favoriteProduct}.`,
    `Catch phrase: ${context.soul.catchPhrase}.`,
    `Reputation level: ${context.soul.reputationLevel}.`,
    `Background story: ${context.soul.backgroundStory}`,
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
  const soul = context.soul;
  const firstProduct = context.products[0];
  const productNames = context.products.map((product) => product.name);
  const priceProducts = context.products.filter(
    (product) => product.priceCents != null,
  );

  if (matches(message, ["discount", "deal", "promotion", "promo", "sale"])) {
    return context.promotions.banner
      ? `${openingForSoul(soul)} Let me check today's merchant board. ${merchant} has posted: "${context.promotions.banner}" Checkout remains the final source for eligibility, but I can help you look at the featured shelf.`
      : `${openingForSoul(soul)} I do not see a published promotion for ${context.store.name} right now. The promotion space is ready, so active campaigns can appear here when ${merchant} publishes one.`;
  }

  if (matches(message, ["recommend", "popular", "try", "start", "best"])) {
    if (!firstProduct) {
      return `${openingForSoul(soul)} ${merchant} is still arranging the public shelf, so I should not invent a product. I can tell you the shop story or explain what kind of goods this place focuses on.`;
    }
    if (
      matches(message, ["coffee", "blend", "beans"]) &&
      !matches(
        `${context.store.category} ${context.store.name} ${soul.merchantClass}`,
        ["coffee", "artisan"],
      )
    ) {
      return `${openingForSoul(soul)} I do not sell coffee here, but I can help with ${context.store.category.toLowerCase()} goods. If you want the closest fit in this building, I would start with ${firstProduct.name}. ${soul.catchPhrase}`;
    }
    return `${openingForSoul(soul)} For ${context.store.name}, I recommend starting with ${soul.favoriteProduct || firstProduct.name}. ${recommendationFlavor(soul, firstProduct.name)} If you tell me what you care about most, I can narrow the choice using only published products.`;
  }

  if (matches(message, ["price", "cost", "how much", "expensive", "cheap"])) {
    if (!priceProducts.length) {
    return `${openingForSoul(soul)} I do not see published prices on the featured shelf yet. I should not guess, but the product cards and checkout will be the final source once ${merchant} publishes them.`;
    }
    const prices = priceProducts
      .slice(0, 3)
      .map(
        (product) =>
          `${product.name}: $${((product.priceCents ?? 0) / 100).toFixed(2)}`,
      )
      .join(", ");
    return `${openingForSoul(soul)} Here are the published prices I can see: ${prices}. Checkout remains the final authority for totals, taxes, and eligibility.`;
  }

  if (matches(message, ["story", "about", "owner", "merchant", "who are you"])) {
    return `${context.store.name} is run by ${merchant}, ${soul.merchantClass}. ${soul.backgroundStory} ${soul.personalGoal} ${soul.catchPhrase}`;
  }

  if (matches(message, ["live", "broadcast", "stream", "room"])) {
    return context.store.liveNow
      ? `${openingForSoul(soul)} ${merchant} is live right now. The live corner is open, so this is a good time to ask about featured products and demonstrations.`
      : `${openingForSoul(soul)} The live room is quiet right now. You can still ask me about the shelf, and ${merchant}'s next live session can appear here when scheduled.`;
  }

  if (matches(message, ["product", "sell", "shelf", "catalog", "goods"])) {
    return productNames.length
      ? `${openingForSoul(soul)} The featured shelf currently includes ${productNames.join(", ")}. ${merchant}'s favorite starting point is ${soul.favoriteProduct}. I can compare them by category, price if published, or why a visitor might choose one.`
      : `${openingForSoul(soul)} The public shelf is still being prepared. I can talk about ${merchant}'s shop identity, but I should not invent unpublished products.`;
  }

  return `${context.merchant.greeting} I am ${merchant}'s disclosed AI shopkeeper. My voice follows ${soul.personalityType.toLowerCase()} ${soul.communicationStyle.toLowerCase()} guidance: ${soul.catchPhrase} I can help with recommendations, published prices, promotions, live sessions, products, and the story behind this shop.`;
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

function openingForSoul(soul: MerchantSoul) {
  const tone = `${soul.personalityType} ${soul.communicationStyle}`.toLowerCase();
  if (tone.includes("practical") || tone.includes("direct"))
    return "Welcome aboard.";
  if (tone.includes("curious") || tone.includes("educational"))
    return "Excellent question.";
  if (tone.includes("helpful")) return "Happy to help, traveler.";
  return "Welcome traveler.";
}

function recommendationFlavor(soul: MerchantSoul, fallbackProduct: string) {
  const product = soul.favoriteProduct || fallbackProduct;
  const tone = `${soul.personalityType} ${soul.communicationStyle}`.toLowerCase();
  if (tone.includes("warm"))
    return `${product} is a gentle place to begin, especially if you like recommendations with a little story behind them.`;
  if (tone.includes("practical") || tone.includes("direct"))
    return `${product} is the sensible first pick because it solves a clear need without asking you to overbuy.`;
  if (tone.includes("curious") || tone.includes("educational"))
    return `${product} is useful because it lets us learn what you prefer before choosing anything more specialized.`;
  return `${product} is featured because it helps visitors understand what this merchant does best.`;
}
