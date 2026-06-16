import { SubscriptionPlanType, SubscriptionStatus } from "@prisma/client";
import { LiveCommercePlanAccessService } from "./live-commerce-plan-access.service";

function createPrismaMock(planCode: string | null, founder = false) {
  return {
    founderMerchantProgram: {
      findFirst: jest
        .fn()
        .mockResolvedValue(founder ? { id: "founder-1" } : null),
    },
    merchantSubscription: {
      findFirst: jest.fn().mockResolvedValue(
        planCode
          ? {
              status: SubscriptionStatus.ACTIVE,
              plan: {
                code: planCode,
                planType:
                  planCode === "STARTER"
                    ? SubscriptionPlanType.STARTER
                    : SubscriptionPlanType.PRO,
              },
            }
          : null,
      ),
    },
    subscription: {
      findFirst: jest.fn().mockResolvedValue(
        planCode
          ? {
              status: SubscriptionStatus.ACTIVE,
              plan: { code: planCode },
            }
          : null,
      ),
    },
  };
}

describe("LiveCommercePlanAccessService", () => {
  it.each(["PRO", "ENTERPRISE"])(
    "allows %s shops to use Live Commerce",
    async (planCode) => {
      const prisma = createPrismaMock(planCode);
      const service = new LiveCommercePlanAccessService(prisma as never);

      await expect(service.canUseLiveCommerce("shop-1")).resolves.toBe(true);
    },
  );

  it.each(["STARTER", null])(
    "blocks %s shops from using Live Commerce",
    async (planCode) => {
      const prisma = createPrismaMock(planCode);
      const service = new LiveCommercePlanAccessService(prisma as never);

      await expect(service.canUseLiveCommerce("shop-1")).resolves.toBe(false);
    },
  );

  it("allows active Founder Merchants to use Live Commerce", async () => {
    const prisma = createPrismaMock("STARTER", true);
    const service = new LiveCommercePlanAccessService(prisma as never);

    await expect(service.canUseLiveCommerce("shop-1")).resolves.toBe(true);
  });
});
