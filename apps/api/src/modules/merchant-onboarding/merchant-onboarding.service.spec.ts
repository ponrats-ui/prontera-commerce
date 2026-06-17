import {
  MerchantBuildingStyle,
  MerchantBuildingType,
  StaffStatus,
  StorefrontTheme,
  SubscriptionPlanType,
  WorldEntityStatus,
  WorldZoneStatus,
} from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { MerchantOnboardingService } from "./merchant-onboarding.service";

const user: AuthenticatedUser = {
  id: "user-1",
  email: "merchant@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

const now = new Date("2026-06-17T00:00:00.000Z");

function createTxMock() {
  return {
    worldZone: {
      upsert: jest.fn().mockResolvedValue({
        id: "zone-1",
        code: "MERCHANT_WORLD",
        status: WorldZoneStatus.ACTIVE,
      }),
    },
    worldRegion: {
      upsert: jest.fn().mockResolvedValue({
        id: "region-1",
        slug: "central-trade-region",
        status: WorldEntityStatus.ACTIVE,
      }),
    },
    worldCity: {
      upsert: jest.fn().mockResolvedValue({
        id: "city-1",
        slug: "merchant-city",
        status: WorldEntityStatus.ACTIVE,
      }),
    },
    worldDistrict: {
      upsert: jest
        .fn()
        .mockImplementation(({ create }: { create: { code: string } }) =>
          Promise.resolve({
            id: `district-${create.code.toLowerCase()}`,
            code: create.code,
          }),
        ),
    },
    worldDistrictLocation: {
      upsert: jest.fn(),
    },
    subscriptionPlan: {
      upsert: jest.fn(),
      findFirst: jest.fn().mockResolvedValue({
        id: "pro-plan",
        planType: SubscriptionPlanType.PRO,
      }),
    },
    shop: {
      create: jest.fn().mockResolvedValue({
        id: "shop-1",
        name: "Velora Coffee",
        slug: "velora-coffee",
        staff: [{ status: StaffStatus.ACTIVE }],
      }),
    },
    user: {
      update: jest.fn(),
    },
    merchantSubscription: {
      create: jest.fn(),
    },
    founderMerchantProgram: {
      create: jest.fn().mockResolvedValue({
        id: "founder-1",
        isFounderMerchant: true,
      }),
    },
    merchantBuilding: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue({
        id: "building-1",
        buildingType: MerchantBuildingType.TECH_STORE,
        storefrontTheme: StorefrontTheme.TECH_BAZAAR,
        isPublished: true,
      }),
    },
    merchantWorldLocation: {
      create: jest.fn().mockResolvedValue({
        id: "location-1",
        buildingStyle: MerchantBuildingStyle.TECH_STORE,
        storefrontTheme: StorefrontTheme.TECH_BAZAAR,
      }),
    },
  };
}

function createPrismaMock() {
  const tx = createTxMock();
  return {
    shop: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    user: {
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(tx)),
    tx,
  };
}

describe("MerchantOnboardingService", () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(now);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("publishes a new merchant into the world", async () => {
    const prisma = createPrismaMock();
    const service = new MerchantOnboardingService(prisma as never);

    const result = await service.publish(user, {
      merchantName: "COM",
      shopName: "Velora Coffee",
      category: "Coffee",
      districtSlug: "tech-bazaar",
    });

    expect(result.message).toBe("Welcome to Prontera.");
    expect(result.links.shop).toBe("/world/shops/velora-coffee");
    expect(prisma.tx.shop.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Velora Coffee",
          slug: "velora-coffee",
        }),
      }),
    );
    expect(prisma.tx.merchantSubscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          shopId: "shop-1",
          planId: "pro-plan",
          status: "TRIAL",
        }),
      }),
    );
    expect(prisma.tx.founderMerchantProgram.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          shopId: "shop-1",
          isFounderMerchant: true,
        }),
      }),
    );
    expect(prisma.tx.merchantBuilding.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          districtId: "district-tech_bazaar",
          buildingType: MerchantBuildingType.TECH_STORE,
          isPublished: true,
        }),
      }),
    );
    expect(prisma.tx.merchantWorldLocation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          shopId: "shop-1",
          cityId: "city-1",
          founderPlacement: true,
        }),
      }),
    );
  });

  it("returns onboarding status with available districts", async () => {
    const prisma = createPrismaMock();
    prisma.shop.findFirst.mockResolvedValue(null);
    const service = new MerchantOnboardingService(prisma as never);

    const status = await service.status(user);

    expect(status.active).toBe(true);
    expect(status.districts).toHaveLength(4);
    expect(status.founderProgram.benefits).toContain("1 month free Pro");
  });
});
