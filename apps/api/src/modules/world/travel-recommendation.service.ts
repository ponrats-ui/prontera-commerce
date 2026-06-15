import { Injectable } from "@nestjs/common";

export type TravelRecommendation = {
  label: string;
  destinationType: "ZONE" | "DISTRICT";
  zoneCode?: string;
  districtCode?: string;
  reason: string;
};

const keywordRecommendations: Array<{
  keywords: string[];
  recommendation: TravelRecommendation;
}> = [
  {
    keywords: ["keyboard", "computer", "electronics", "gadget", "device"],
    recommendation: {
      label: "AI District",
      destinationType: "DISTRICT",
      zoneCode: "JUNO",
      districtCode: "AI_DISTRICT",
      reason: "Technology and smart commerce keywords map to AI District.",
    },
  },
  {
    keywords: ["fashion", "clothes", "style", "apparel", "outfit"],
    recommendation: {
      label: "Fashion Street",
      destinationType: "DISTRICT",
      zoneCode: "PRONTERA",
      districtCode: "FASHION_STREET",
      reason: "Fashion keywords map to Fashion Street.",
    },
  },
  {
    keywords: ["wholesale", "bulk", "supplier", "b2b"],
    recommendation: {
      label: "Morroc Wholesale Zone",
      destinationType: "DISTRICT",
      zoneCode: "MORROC",
      districtCode: "WHOLESALE_MARKET",
      reason: "Bulk buying keywords map to Morroc Wholesale Zone.",
    },
  },
];

@Injectable()
export class TravelRecommendationService {
  recommend(searchTerm?: string): TravelRecommendation[] {
    const normalized = searchTerm?.trim().toLowerCase();

    if (!normalized) {
      return [];
    }

    return keywordRecommendations
      .filter((item) =>
        item.keywords.some((keyword) => normalized.includes(keyword)),
      )
      .map((item) => item.recommendation);
  }
}
