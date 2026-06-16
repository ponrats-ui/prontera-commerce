import { Injectable } from "@nestjs/common";
import {
  PlanStatus,
  SubscriptionPlanType,
  SubscriptionStatus,
} from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

const LIVE_COMMERCE_PLAN_CODES = new Set(["PRO", "BUSINESS", "ENTERPRISE"]);
const LIVE_COMMERCE_PLAN_TYPES = new Set<SubscriptionPlanType>([
  SubscriptionPlanType.PRO,
  SubscriptionPlanType.ENTERPRISE,
]);

@Injectable()
export class LiveCommercePlanAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async canUseLiveCommerce(shopId: string): Promise<boolean> {
    const founderProgram = await this.prisma.founderMerchantProgram.findFirst({
      where: {
        shopId,
        isFounderMerchant: true,
        deletedAt: null,
        OR: [
          { founderExpiresAt: null },
          { founderExpiresAt: { gt: new Date() } },
        ],
      },
    });

    if (founderProgram) return true;

    const merchantSubscription =
      await this.prisma.merchantSubscription.findFirst({
        where: {
          shopId,
          deletedAt: null,
          status: {
            in: [SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE],
          },
          plan: {
            status: PlanStatus.ACTIVE,
            deletedAt: null,
          },
        },
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      });

    if (merchantSubscription) {
      return (
        merchantSubscription.status === SubscriptionStatus.TRIAL ||
        LIVE_COMMERCE_PLAN_TYPES.has(merchantSubscription.plan.planType)
      );
    }

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
