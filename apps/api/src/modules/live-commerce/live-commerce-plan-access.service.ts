import { Injectable } from "@nestjs/common";
import { PlanStatus, SubscriptionStatus } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

const LIVE_COMMERCE_PLAN_CODES = new Set(["PRO", "BUSINESS", "ENTERPRISE"]);

@Injectable()
export class LiveCommercePlanAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async canUseLiveCommerce(shopId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        shopId,
        deletedAt: null,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
        },
        plan: {
          status: PlanStatus.ACTIVE,
          deletedAt: null,
        },
      },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    const planCode = subscription?.plan.code.toUpperCase() ?? "STARTER";

    return LIVE_COMMERCE_PLAN_CODES.has(planCode);
  }
}

export const liveCommercePlanCodes = {
  minimum: "PRO",
  enabled: [...LIVE_COMMERCE_PLAN_CODES],
};
