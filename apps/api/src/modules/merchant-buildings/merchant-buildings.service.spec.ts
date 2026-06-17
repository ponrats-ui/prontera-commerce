import { BuildingType, StorefrontTheme } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { MerchantBuildingsService } from "./merchant-buildings.service";

const user: AuthenticatedUser = {
  id: "user-1",
  email: "merchant@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

const building = {
  id: "building-1",
  shopId: "shop-1",
  districtId: "district-1",
  buildingType: BuildingType.SMALL,
  storefrontTheme: StorefrontTheme.CLASSIC,
  buildingLevel: 1,
  logoUrl: null,
  signText: "Velora PC",
  bannerUrl: null,
  isFounder: true,
  isOfficialStore: false,
  isLive: false,
  xCoordinate: 12,
  yCoordinate: 20,
  isPublished: true,
  createdAt: new Date("2026-06-17T00:00:00.000Z"),
  updatedAt: new Date("2026-06-17T00:00:00.000Z"),
  district: {
    id: "district-1",
    zoneId: "zone-1",
    code: "TECH_BAZAAR",
    name: "Tech Bazaar",
    description: null,
    category: "TECH",
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  shop: {
    id: "shop-1",
    name: "Velora PC",
    slug: "velora-pc",
    description: "Computer shop",
    logoUrl: null,
    bannerUrl: null,
    founderMerchantProgram: {
      id: "founder-1",
      isFounderMerchant: true,
      founderExpiresAt: null,
    },
    liveChannels: [],
    promotionCampaigns: [{ id: "promo-1", name: "Launch Discount" }],
    products: [{ id: "product-1", name: "Keyboard", slug: "keyboard" }],
  },
};

function createPrismaMock() {
  return {
    merchantBuilding: {
      findMany: jest.fn().mockResolvedValue([building]),
      findFirst: jest.fn().mockResolvedValue(building),
      update: jest.fn().mockResolvedValue({
        ...building,
        storefrontTheme: StorefrontTheme.TECH,
        isOfficialStore: true,
        buildingType: BuildingType.OFFICIAL,
      }),
      count: jest.fn().mockResolvedValue(1),
    },
    shop: {
      findFirst: jest.fn().mockResolvedValue({ id: "shop-1" }),
      update: jest.fn(),
    },
  };
}

describe("MerchantBuildingsService", () => {
  it("returns building metrics", async () => {
    const service = new MerchantBuildingsService(
      createPrismaMock() as never,
      { canManageShop: jest.fn().mockResolvedValue(true) } as never,
    );

    const metrics = await service.metrics();

    expect(metrics.publishedBuildings).toBe(1);
    expect(metrics.futureHooks).toContain("Rooftop Billboard");
  });

  it("serializes public merchant profiles", async () => {
    const service = new MerchantBuildingsService(
      createPrismaMock() as never,
      { canManageShop: jest.fn().mockResolvedValue(true) } as never,
    );

    const profile = await service.getMerchantProfile("velora-pc");

    expect(profile.signText).toBe("Velora PC");
    expect(profile.founderBadge).toBe("Founder Merchant");
    expect(profile.promotionBanner).toBe("Launch Discount");
  });

  it("updates merchant building settings", async () => {
    const prisma = createPrismaMock();
    const service = new MerchantBuildingsService(
      prisma as never,
      { canManageShop: jest.fn().mockResolvedValue(true) } as never,
    );

    const updated = await service.updateMyBuilding(user, {
      shopId: "shop-1",
      storefrontTheme: StorefrontTheme.TECH,
      signText: "Velora Tech",
    });

    expect(updated.storefrontTheme).toBe(StorefrontTheme.TECH);
    expect(prisma.merchantBuilding.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ signText: "Velora Tech" }),
      }),
    );
  });
});
