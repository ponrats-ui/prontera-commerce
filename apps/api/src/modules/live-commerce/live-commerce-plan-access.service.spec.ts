import { SubscriptionStatus } from "@prisma/client";
import { LiveCommercePlanAccessService } from "./live-commerce-plan-access.service";

function createPrismaMock(planCode: string | null) {
  return {
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
  it.each(["PRO", "BUSINESS", "ENTERPRISE"])(
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
});
