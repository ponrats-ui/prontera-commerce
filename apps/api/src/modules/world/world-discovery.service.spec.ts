import {
  LiveChannelProvider,
  LiveChannelStatus,
  MerchantBuildingStyle,
  ProductStatus,
  PromotionStatus,
  PromotionType,
  ShopStatus,
  StorefrontTheme,
  SubscriptionPlanType,
  SubscriptionStatus,
  WorldEntityStatus,
} from "@prisma/client";
import { WorldDiscoveryService } from "./world-discovery.service";

const now = new Date("2026-06-16T00:00:00.000Z");

function createLocation(overrides: Record<string, unknown> = {}) {
  return { ...baseLocation(), ...overrides };
}

function baseLocation(): any {
  return {
    id: "location-1",
    shopId: "shop-1",
    cityId: "city-1",
    districtId: "district-1",
    buildingStyle: MerchantBuildingStyle.CLASSIC_SHOP,
    storefrontTheme: StorefrontTheme.WARM_MARKET,
    featured: false,
    founderPlacement: false,
    createdAt: now,
    updatedAt: now,
    city: {
      id: "city-1",
      regionId: "region-1",
      name: "Merchant City",
      slug: "merchant-city",
      description: null,
      mapImageUrl: null,
      status: WorldEntityStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      region: {
        id: "region-1",
        name: "Central Trade Region",
        slug: "central-trade-region",
        description: null,
        status: WorldEntityStatus.ACTIVE,
        displayOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
    },
    district: {
      id: "district-1",
      zoneId: "zone-1",
      code: "FOUNDER_DISTRICT",
      name: "Founder District",
      description: null,
      category: "FOUNDERS",
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    shop: {
      id: "shop-1",
      ownerId: "user-1",
      name: "Velora Coffee",
      slug: "velora-coffee",
      description: "Original merchant storefront",
      logoUrl: null,
      bannerUrl: null,
      contactEmail: null,
      contactPhone: null,
      status: ShopStatus.ACTIVE,
      isPublic: true,
      countryCode: "US",
      localeCode: "en-US",
      currencyCode: "USD",
      preferredLocale: null,
      preferredCurrency: null,
      timeZone: "UTC",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      products: [
        {
          id: "product-1",
          shopId: "shop-1",
          categoryId: "category-1",
          sku: "COFFEE-1",
          name: "Founder Roast",
          slug: "founder-roast",
          description: null,
          status: ProductStatus.ACTIVE,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          category: { id: "category-1", name: "Coffee", slug: "coffee" },
          variants: [
            {
              id: "variant-1",
              productId: "product-1",
              sku: "COFFEE-1-BAG",
              name: "Bag",
              priceCents: 1800,
              compareAtPriceCents: null,
              status: "ACTIVE",
              currency: "USD",
              inventoryCount: 10,
              isDefault: true,
              createdAt: now,
              updatedAt: now,
              deletedAt: null,
            },
          ],
          images: [],
        },
      ],
      liveChannels: [],
      promotionCampaigns: [],
      merchantSubscriptions: [
        {
          id: "subscription-1",
          shopId: "shop-1",
          planId: "plan-1",
          status: SubscriptionStatus.ACTIVE,
          trialStartAt: now,
          trialEndAt: now,
          currentPeriodStart: now,
          currentPeriodEnd: null,
          cancelledAt: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          plan: {
            id: "plan-1",
            code: "PRO",
            name: "Pro",
            description: null,
            planType: SubscriptionPlanType.PRO,
            status: "ACTIVE",
            priceCents: 2900,
            currency: "USD",
            productLimit: null,
            monthlyOrderLimit: null,
            liveCommerce: true,
            advancedAnalytics: true,
            multiStaff: true,
            aiMerchantAssistant: false,
            crmAdvanced: true,
            promotionFullAccess: true,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          },
        },
      ],
      founderMerchantProgram: null,
    },
  };
}

function createPrismaMock(locations = [createLocation()]) {
  return {
    worldRegion: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    worldCity: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    worldDistrict: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    worldDistrictLocation: {
      create: jest.fn(),
    },
    merchantWorldLocation: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue(locations),
    },
  };
}

describe("WorldDiscoveryService", () => {
  it("serializes store placement with products and subscription tier", async () => {
    const prisma = createPrismaMock();
    const service = new WorldDiscoveryService(prisma as never);

    const shops = await service.listShops();

    expect(shops[0]!).toEqual(
      expect.objectContaining({
        slug: "velora-coffee",
        city: expect.objectContaining({ slug: "merchant-city" }),
        district: expect.objectContaining({ slug: "founder-district" }),
        subscriptionTier: SubscriptionPlanType.PRO,
        featuredProducts: [
          expect.objectContaining({ name: "Founder Roast", priceCents: 1800 }),
        ],
      }),
    );
  });

  it("ranks live merchants before inactive storefronts", async () => {
    const liveLocation = createLocation({
      id: "location-live",
      shop: {
        ...baseLocation().shop,
        id: "shop-live",
        name: "Live Store",
        slug: "live-store",
        liveChannels: [
          {
            id: "live-1",
            shopId: "shop-live",
            provider: LiveChannelProvider.YOUTUBE,
            title: "Live Sale",
            description: null,
            videoUrl: "https://example.com/live",
            embedUrl: "https://example.com/embed",
            thumbnailUrl: null,
            status: LiveChannelStatus.LIVE,
            startsAt: now,
            endsAt: null,
            createdById: null,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          },
        ],
      },
    });
    const quietLocation = createLocation({
      id: "location-quiet",
      shop: {
        ...baseLocation().shop,
        id: "shop-quiet",
        name: "Quiet Store",
        slug: "quiet-store",
      },
    });
    const prisma = createPrismaMock([quietLocation, liveLocation]);
    const service = new WorldDiscoveryService(prisma as never);

    const shops = await service.listShops();

    expect(shops[0]!.slug).toBe("live-store");
    expect(shops[0]!.liveNow).toBe(true);
  });

  it("filters founder merchants", async () => {
    const founderLocation = createLocation({
      founderPlacement: true,
      shop: {
        ...baseLocation().shop,
        founderMerchantProgram: {
          id: "founder-1",
          shopId: "shop-1",
          isFounderMerchant: true,
          founderGrantedAt: now,
          founderExpiresAt: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      },
    });
    const regularLocation = createLocation({
      id: "location-regular",
      shop: {
        ...baseLocation().shop,
        id: "shop-regular",
        slug: "regular-shop",
        founderMerchantProgram: null,
      },
    });
    const prisma = createPrismaMock([regularLocation, founderLocation]);
    const service = new WorldDiscoveryService(prisma as never);

    const shops = await service.listFounders();

    expect(shops).toHaveLength(1);
    expect(shops[0]!.isFounderMerchant).toBe(true);
    expect(shops[0]!.founderBadge).toBe("Founder Merchant");
  });

  it("shows promotion discovery badges for active campaigns", async () => {
    const location = createLocation({
      shop: {
        ...baseLocation().shop,
        promotionCampaigns: [
          {
            id: "campaign-1",
            shopId: "shop-1",
            name: "Market Day Deal",
            description: null,
            promotionType: PromotionType.BUY_X_GET_Y,
            status: PromotionStatus.ACTIVE,
            startsAt: null,
            endsAt: null,
            priority: 10,
            stackable: false,
            createdById: null,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          },
        ],
      },
    });
    const prisma = createPrismaMock([location]);
    const service = new WorldDiscoveryService(prisma as never);

    const shops = await service.listShops();

    expect(shops[0]!.promotionBadge).toBe("Flash Sale");
    expect(shops[0]!.campaignBadge).toBe("Market Day Deal");
  });
});
