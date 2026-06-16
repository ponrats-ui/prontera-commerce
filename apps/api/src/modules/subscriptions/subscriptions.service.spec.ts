import { SubscriptionPlanType, SubscriptionStatus } from "@prisma/client";
import { SubscriptionsService } from "./subscriptions.service";

const starterPlan = {
  id: "starter-plan",
  code: "STARTER",
  name: "Starter Free Forever",
  planType: SubscriptionPlanType.STARTER,
  liveCommerce: false,
  advancedAnalytics: false,
  multiStaff: false,
  aiMerchantAssistant: false,
  crmAdvanced: false,
  promotionFullAccess: false,
};

const proPlan = {
  ...starterPlan,
  id: "pro-plan",
  code: "PRO",
  name: "Pro Merchant",
  planType: SubscriptionPlanType.PRO,
  liveCommerce: true,
  advancedAnalytics: true,
  multiStaff: true,
  aiMerchantAssistant: true,
  crmAdvanced: true,
  promotionFullAccess: true,
};

function createService(overrides: Record<string, unknown> = {}) {
  const prisma = {
    subscriptionPlan: {
      upsert: jest.fn(),
      findFirst: jest.fn((args) =>
        Promise.resolve(
          args.where?.planType === SubscriptionPlanType.PRO
            ? proPlan
            : starterPlan,
        ),
      ),
      findMany: jest.fn().mockResolvedValue([starterPlan, proPlan]),
    },
    merchantSubscription: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
    },
    founderMerchantProgram: {
      findFirst: jest.fn().mockResolvedValue(null),
      upsert: jest.fn(),
    },
    shop: {
      findFirst: jest.fn().mockResolvedValue({
        id: "shop-1",
        name: "Shop",
        slug: "shop",
        ownerId: "user-1",
        staff: [{ role: "OWNER" }],
      }),
    },
    $transaction: jest.fn((callback) =>
      callback({
        subscriptionPlan: {
          upsert: jest.fn(),
          findFirst: jest.fn().mockResolvedValue(proPlan),
        },
        merchantSubscription: {
          create: jest.fn().mockResolvedValue({
            id: "sub-1",
            shopId: "shop-1",
            status: SubscriptionStatus.TRIAL,
            plan: proPlan,
          }),
        },
      }),
    ),
    ...overrides,
  };

  return {
    prisma,
    service: new SubscriptionsService(
      prisma as never,
      {
        isShopStaff: jest.fn().mockResolvedValue(true),
        canManageShop: jest.fn().mockResolvedValue(true),
      } as never,
    ),
  };
}

describe("SubscriptionsService", () => {
  it("creates a 30-day Pro trial for new shops", async () => {
    const tx = {
      subscriptionPlan: {
        upsert: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(proPlan),
      },
      merchantSubscription: {
        create: jest.fn().mockResolvedValue({ id: "sub-1" }),
      },
    };
    const { service } = createService();
    const now = new Date("2026-06-16T00:00:00.000Z");

    await service.createTrialForShop(tx as never, "shop-1", now);

    expect(tx.merchantSubscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: SubscriptionStatus.TRIAL,
          trialStartAt: now,
          trialEndAt: new Date("2026-07-16T00:00:00.000Z"),
        }),
      }),
    );
  });

  it("downgrades expired trials to Starter", async () => {
    const expired = {
      id: "sub-1",
      shopId: "shop-1",
      status: SubscriptionStatus.TRIAL,
      trialEndAt: new Date("2026-01-01T00:00:00.000Z"),
      plan: proPlan,
    };
    const { prisma, service } = createService({
      merchantSubscription: {
        findFirst: jest.fn().mockResolvedValue(expired),
        update: jest.fn().mockResolvedValue({
          ...expired,
          status: SubscriptionStatus.ACTIVE,
          plan: starterPlan,
        }),
      },
    });

    const result = await service.ensureSubscriptionForShop("shop-1");

    expect(prisma.merchantSubscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          planId: starterPlan.id,
          status: SubscriptionStatus.ACTIVE,
        }),
      }),
    );
    expect(result.plan.planType).toBe(SubscriptionPlanType.STARTER);
  });

  it("grants founder merchant benefits", async () => {
    const { prisma, service } = createService({
      founderMerchantProgram: {
        findFirst: jest.fn(),
        upsert: jest.fn().mockResolvedValue({ id: "founder-1" }),
      },
    });

    await expect(
      service.grantFounder(
        {
          id: "admin-1",
          email: "admin@example.com",
          roles: ["admin"],
          sessionId: "session-1",
        },
        { shopId: "shop-1" },
      ),
    ).resolves.toEqual({ id: "founder-1" });

    expect(prisma.founderMerchantProgram.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          isFounderMerchant: true,
          grantedById: "admin-1",
        }),
      }),
    );
  });
});
