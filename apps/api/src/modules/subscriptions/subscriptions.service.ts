import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  PlanStatus,
  Prisma,
  SubscriptionPlanType,
  SubscriptionStatus,
} from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import { ShopPermissionsService } from "../shops/shop-permissions.service";
import type {
  GrantFounderMerchantDto,
  UpgradeSubscriptionDto,
} from "./dto/subscription.dto";
import {
  founderBenefits,
  subscriptionPlanDefinitions,
  trialDurationDays,
} from "./subscription-plan-definitions";

const planOrder = {
  [SubscriptionPlanType.STARTER]: 1,
  [SubscriptionPlanType.PRO]: 2,
  [SubscriptionPlanType.ENTERPRISE]: 3,
};

type PrismaExecutor = PrismaService | Prisma.TransactionClient;

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shopPermissions: ShopPermissionsService,
  ) {}

  async listPlans() {
    await this.ensureDefaultPlans(this.prisma);

    return this.prisma.subscriptionPlan.findMany({
      where: { status: PlanStatus.ACTIVE, deletedAt: null },
      orderBy: { priceCents: "asc" },
    });
  }

  async getMySubscription(user: AuthenticatedUser, shopId?: string) {
    const shop = await this.resolveShop(user.id, shopId);
    await this.assertCanRead(user.id, shop.id);
    const subscription = await this.ensureSubscriptionForShop(shop.id);
    const founderProgram = await this.getFounderProgram(shop.id);
    const effectivePlan = this.resolveEffectivePlan(
      subscription,
      founderProgram,
    );

    return {
      shop,
      subscription,
      founderProgram,
      isFounderMerchant: this.isFounderProgramActive(founderProgram),
      effectivePlan,
      trialDaysRemaining: this.getTrialDaysRemaining(subscription.trialEndAt),
      trialDurationDays,
      starterLimits: {
        productLimit: 20,
        monthlyOrderLimit: 50,
        liveCommerce: false,
        advancedAnalytics: false,
        multiStaff: false,
        aiMerchantAssistant: false,
      },
      founderBenefits,
    };
  }

  async upgrade(user: AuthenticatedUser, dto: UpgradeSubscriptionDto) {
    await this.assertCanManage(user.id, dto.shopId);
    const planType = dto.planType ?? SubscriptionPlanType.PRO;

    if (planType === SubscriptionPlanType.STARTER) {
      throw new BadRequestException("Use cancel to return to Starter.");
    }

    const plan = await this.getPlanByType(planType);
    const current = await this.ensureSubscriptionForShop(dto.shopId);
    const now = new Date();

    const subscription = await this.prisma.merchantSubscription.update({
      where: { id: current.id },
      data: {
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd: this.addDays(now, 30),
        upgradedAt: now,
        cancelledAt: null,
        gracePeriodEndAt: null,
      },
      include: { plan: true },
    });

    return {
      subscription,
      effectivePlan: subscription.plan,
      founderProgram: await this.getFounderProgram(dto.shopId),
    };
  }

  async cancel(user: AuthenticatedUser, shopId: string) {
    await this.assertCanManage(user.id, shopId);
    const starter = await this.getPlanByType(SubscriptionPlanType.STARTER);
    const current = await this.ensureSubscriptionForShop(shopId);
    const now = new Date();

    const subscription = await this.prisma.merchantSubscription.update({
      where: { id: current.id },
      data: {
        planId: starter.id,
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: now,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        gracePeriodEndAt: null,
      },
      include: { plan: true },
    });

    return {
      subscription,
      effectivePlan: starter,
      founderProgram: await this.getFounderProgram(shopId),
    };
  }

  async getFounder(user: AuthenticatedUser, shopId?: string) {
    const shop = await this.resolveShop(user.id, shopId);
    await this.assertCanRead(user.id, shop.id);
    const founderProgram = await this.getFounderProgram(shop.id);

    return {
      shop,
      founderProgram,
      isFounderMerchant: this.isFounderProgramActive(founderProgram),
      founderBenefits,
    };
  }

  async grantFounder(user: AuthenticatedUser, dto: GrantFounderMerchantDto) {
    const now = new Date();
    const shop = await this.prisma.shop.findFirst({
      where: { id: dto.shopId, deletedAt: null },
      select: { id: true },
    });

    if (!shop) throw new NotFoundException("Shop not found.");

    return this.prisma.founderMerchantProgram.upsert({
      where: { shopId: dto.shopId },
      create: {
        shopId: dto.shopId,
        isFounderMerchant: true,
        founderGrantedAt: now,
        founderExpiresAt: dto.founderExpiresAt ?? null,
        grantedById: user.id,
        benefits: founderBenefits,
      },
      update: {
        isFounderMerchant: true,
        founderGrantedAt: now,
        founderExpiresAt: dto.founderExpiresAt ?? null,
        grantedById: user.id,
        benefits: founderBenefits,
        deletedAt: null,
      },
    });
  }

  async createTrialForShop(
    tx: Prisma.TransactionClient,
    shopId: string,
    now = new Date(),
  ) {
    await this.ensureDefaultPlans(tx);
    const pro = await tx.subscriptionPlan.findFirst({
      where: { planType: SubscriptionPlanType.PRO, deletedAt: null },
    });

    if (!pro) throw new NotFoundException("Pro subscription plan not found.");

    return tx.merchantSubscription.create({
      data: {
        shopId,
        planId: pro.id,
        status: SubscriptionStatus.TRIAL,
        trialStartAt: now,
        trialEndAt: this.addDays(now, trialDurationDays),
        currentPeriodStart: now,
        currentPeriodEnd: this.addDays(now, trialDurationDays),
      },
      include: { plan: true },
    });
  }

  async ensureSubscriptionForShop(shopId: string) {
    const existing = await this.prisma.merchantSubscription.findFirst({
      where: { shopId, deletedAt: null },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    if (!existing) {
      await this.ensureDefaultPlans(this.prisma);
      const created = await this.prisma.$transaction((tx) =>
        this.createTrialForShop(tx, shopId),
      );
      return created;
    }

    return this.applyTrialExpiration(existing);
  }

  isFounderProgramActive(
    program: {
      isFounderMerchant: boolean;
      founderExpiresAt: Date | null;
    } | null,
  ) {
    return Boolean(
      program?.isFounderMerchant &&
      (program.founderExpiresAt === null ||
        program.founderExpiresAt > new Date()),
    );
  }

  async ensureDefaultPlans(prisma: PrismaExecutor) {
    for (const plan of subscriptionPlanDefinitions) {
      await prisma.subscriptionPlan.upsert({
        where: { code: plan.code },
        create: {
          ...plan,
          productLimit: plan.productLimit,
          monthlyOrderLimit: plan.monthlyOrderLimit,
        },
        update: {
          ...plan,
          status: PlanStatus.ACTIVE,
          deletedAt: null,
        },
      });
    }
  }

  private async applyTrialExpiration(
    subscription: Prisma.MerchantSubscriptionGetPayload<{
      include: { plan: true };
    }>,
  ) {
    if (
      subscription.status !== SubscriptionStatus.TRIAL ||
      !subscription.trialEndAt ||
      subscription.trialEndAt >= new Date()
    ) {
      return subscription;
    }

    const starter = await this.getPlanByType(SubscriptionPlanType.STARTER);

    return this.prisma.merchantSubscription.update({
      where: { id: subscription.id },
      data: {
        planId: starter.id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: null,
        currentPeriodEnd: null,
      },
      include: { plan: true },
    });
  }

  private resolveEffectivePlan(
    subscription: Prisma.MerchantSubscriptionGetPayload<{
      include: { plan: true };
    }>,
    founderProgram: Awaited<
      ReturnType<SubscriptionsService["getFounderProgram"]>
    >,
  ) {
    if (this.isFounderProgramActive(founderProgram)) {
      return {
        ...subscription.plan,
        code: "FOUNDER_PRO",
        name: "Founder Merchant",
        planType: SubscriptionPlanType.PRO,
        liveCommerce: true,
        advancedAnalytics: true,
        multiStaff: true,
        aiMerchantAssistant: true,
        crmAdvanced: true,
        promotionFullAccess: true,
      };
    }

    return subscription.plan;
  }

  private async getPlanByType(planType: SubscriptionPlanType) {
    await this.ensureDefaultPlans(this.prisma);
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: { planType, deletedAt: null, status: PlanStatus.ACTIVE },
      orderBy: { priceCents: "asc" },
    });

    if (!plan) throw new NotFoundException("Subscription plan not found.");
    return plan;
  }

  private async getFounderProgram(shopId: string) {
    return this.prisma.founderMerchantProgram.findFirst({
      where: { shopId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  private getTrialDaysRemaining(trialEndAt: Date | null) {
    if (!trialEndAt) return 0;
    const diff = trialEndAt.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  }

  private async resolveShop(userId: string, shopId?: string) {
    const shop = shopId
      ? await this.prisma.shop.findFirst({
          where: { id: shopId, deletedAt: null },
          select: { id: true, name: true, slug: true },
        })
      : await this.prisma.shop.findFirst({
          where: {
            deletedAt: null,
            OR: [
              { ownerId: userId },
              {
                staff: {
                  some: {
                    userId,
                    deletedAt: null,
                    status: "ACTIVE",
                  },
                },
              },
            ],
          },
          select: { id: true, name: true, slug: true },
          orderBy: { createdAt: "desc" },
        });

    if (!shop) throw new NotFoundException("Shop not found.");
    return shop;
  }

  private async assertCanRead(userId: string, shopId: string) {
    if (!(await this.shopPermissions.isShopStaff(userId, shopId))) {
      throw new ForbiddenException("You cannot read this subscription.");
    }
  }

  private async assertCanManage(userId: string, shopId: string) {
    if (!(await this.shopPermissions.canManageShop(userId, shopId))) {
      throw new ForbiddenException("You cannot manage this subscription.");
    }
  }

  private addDays(date: Date, days: number) {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  isAtLeastPlan(
    planType: SubscriptionPlanType,
    minimumPlanType: SubscriptionPlanType,
  ) {
    return planOrder[planType] >= planOrder[minimumPlanType];
  }
}
