import { TravelRecommendationService } from "./travel-recommendation.service";

describe("TravelRecommendationService", () => {
  const service = new TravelRecommendationService();

  it("maps keyboard searches to AI District", () => {
    expect(service.recommend("keyboard")).toEqual([
      expect.objectContaining({
        label: "AI District",
        districtCode: "AI_DISTRICT",
      }),
    ]);
  });

  it("maps fashion searches to Fashion Street", () => {
    expect(service.recommend("fashion")).toEqual([
      expect.objectContaining({
        label: "Fashion Street",
        districtCode: "FASHION_STREET",
      }),
    ]);
  });

  it("maps wholesale searches to Morroc Wholesale Zone", () => {
    expect(service.recommend("wholesale")).toEqual([
      expect.objectContaining({
        label: "Morroc Wholesale Zone",
        zoneCode: "MORROC",
      }),
    ]);
  });

  it("returns no recommendations for empty searches", () => {
    expect(service.recommend("")).toEqual([]);
  });
});
