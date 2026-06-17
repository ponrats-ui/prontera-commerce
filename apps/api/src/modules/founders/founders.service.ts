import { Injectable, NotFoundException } from "@nestjs/common";
import {
  FounderCampaignEventType,
  FounderApplicationStatus,
  PlanStatus,
  Prisma,
  StorefrontTheme,
  SubscriptionPlanType,
  SubscriptionStatus,
} from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import {
  founderBenefits,
  subscriptionPlanDefinitions,
  trialDurationDays,
} from "../subscriptions/subscription-plan-definitions";
import type {
  CreateFounderApplicationDto,
  FounderCampaignEventDto,
  FounderReferralDto,
  FounderWaitlistDto,
  ReviewFounderApplicationDto,
} from "./dto/founder-application.dto";

const founderGoal = 100;
const publicCounterGoal = 25;

@Injectable()
export class FoundersService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(dto: CreateFounderApplicationDto) {
    const application = await this.prisma.founderApplication.create({
      data: {
        merchantName: dto.merchantName,
        businessName: dto.businessName,
        businessType: dto.businessType,
        category: dto.category,
        website: dto.website ?? null,
        facebookPage: dto.facebookPage ?? null,
        email: dto.email,
        phone: dto.phone,
        motivation: dto.motivation,
        status: FounderApplicationStatus.PENDING,
      },
    });

    return {
      message: "Founder Merchant application submitted.",
      application,
      campaignEvent: await this.track({
        eventType: FounderCampaignEventType.APPLICATION_SUBMITTED,
        source: "application",
        campaign: "founder-launch",
      }),
      founderCounter: await this.metrics(),
    };
  }

  async joinWaitlist(dto: FounderWaitlistDto) {
    const entry = await this.prisma.founderWaitlistEntry.create({
      data: {
        merchantName: dto.merchantName,
        businessName: dto.businessName,
        email: dto.email,
        category: dto.category,
        source: dto.source ?? null,
        referralCode: dto.referralCode ?? null,
      },
    });

    const event: FounderCampaignEventDto = {
      eventType: FounderCampaignEventType.WAITLIST_JOINED,
      source: dto.source ?? "waitlist",
      campaign: "founder-launch",
    };
    if (dto.referralCode) event.referralCode = dto.referralCode;
    await this.track(event);

    return {
      message: "Founder waitlist joined.",
      entry,
      founderCounter: await this.metrics(),
    };
  }

  async refer(dto: FounderReferralDto) {
    const referralCode =
      dto.referralCode ?? this.createReferralCode(dto.referrerEmail);
    const referral = await this.prisma.founderReferral.upsert({
      where: {
        referrerEmail_referredEmail: {
          referrerEmail: dto.referrerEmail,
          referredEmail: dto.referredEmail,
        },
      },
      create: {
        referrerEmail: dto.referrerEmail,
        referredEmail: dto.referredEmail,
        referralCode,
      },
      update: {
        referralCode,
      },
    });

    await this.track({
      eventType: FounderCampaignEventType.REFERRAL_CAPTURED,
      source: "referral",
      campaign: "founder-launch",
      referralCode,
    });

    return {
      message: "Founder referral captured.",
      referral,
    };
  }

  async track(dto: FounderCampaignEventDto) {
    return this.prisma.founderCampaignEvent.create({
      data: {
        eventType: dto.eventType,
        source: dto.source ?? null,
        campaign: dto.campaign ?? "founder-launch",
        referralCode: dto.referralCode ?? null,
      },
    });
  }

  async listApplications(status?: keyof typeof FounderApplicationStatus) {
    return this.prisma.founderApplication.findMany({
      where: status ? { status } : {},
      include: {
        reviewer: { select: { id: true, email: true, name: true } },
      },
      orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
    });
  }

  async getMyFounderStatus(user: AuthenticatedUser) {
    const applications = await this.prisma.founderApplication.findMany({
      where: { email: user.email.toLowerCase() },
      orderBy: { submittedAt: "desc" },
    });

    const shops = await this.prisma.shop.findMany({
      where: {
        deletedAt: null,
        OR: [
          { ownerId: user.id },
          {
            staff: {
              some: {
                userId: user.id,
                status: "ACTIVE",
                deletedAt: null,
              },
            },
          },
        ],
      },
      include: {
        founderMerchantProgram: true,
        worldLocations: {
          include: { city: true, district: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const founderShop = shops.find((shop) =>
      this.isFounderProgramActive(shop.founderMerchantProgram),
    );

    return {
      founderStatus: founderShop
        ? "APPROVED"
        : (applications[0]?.status ?? null),
      application: applications[0] ?? null,
      applications,
      founderShop: founderShop ?? null,
      benefits: this.benefits(),
      progress: await this.metrics(),
    };
  }

  async metrics() {
    const [
      applications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      approvedFounders,
      activeFounders,
      waitlistCount,
      referralCount,
      campaignEvents,
      landingViews,
      applyClicks,
    ] = await Promise.all([
      this.prisma.founderApplication.count(),
      this.prisma.founderApplication.count({
        where: { status: FounderApplicationStatus.PENDING },
      }),
      this.prisma.founderApplication.count({
        where: { status: FounderApplicationStatus.APPROVED },
      }),
      this.prisma.founderApplication.count({
        where: { status: FounderApplicationStatus.REJECTED },
      }),
      this.prisma.founderMerchantProgram.count({
        where: { isFounderMerchant: true, deletedAt: null },
      }),
      this.prisma.founderMerchantProgram.count({
        where: {
          isFounderMerchant: true,
          deletedAt: null,
          shop: { status: "ACTIVE", deletedAt: null },
        },
      }),
      this.prisma.founderWaitlistEntry.count(),
      this.prisma.founderReferral.count(),
      this.prisma.founderCampaignEvent.count(),
      this.prisma.founderCampaignEvent.count({
        where: { eventType: FounderCampaignEventType.LANDING_VIEW },
      }),
      this.prisma.founderCampaignEvent.count({
        where: { eventType: FounderCampaignEventType.APPLY_CLICK },
      }),
    ]);

    return {
      goal: founderGoal,
      publicGoal: publicCounterGoal,
      publicLabel: `${approvedFounders} Founders Joined`,
      exampleLabel: "17 Founders Joined",
      applications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      approvedFounders,
      activeFounders,
      waitlistCount,
      referralCount,
      campaignEvents,
      landingViews,
      applyClicks,
      founderConversionRate:
        applications === 0
          ? 0
          : Number(((approvedFounders / applications) * 100).toFixed(2)),
      progressLabel: `${approvedFounders} / ${founderGoal}`,
      funnel: {
        landingViews,
        applyClicks,
        applications,
        waitlistCount,
        referralCount,
      },
      successStories: [
        {
          title: "Computer Shop Founder",
          status: "Placeholder",
          summary:
            "Future story about a local computer shop joining Tech Bazaar.",
        },
        {
          title: "Coffee Shop Founder",
          status: "Placeholder",
          summary:
            "Future story about a cafe building community presence in Prontera.",
        },
        {
          title: "Handmade Creator Founder",
          status: "Placeholder",
          summary:
            "Future story about an artisan using Prontera for identity and discovery.",
        },
      ],
    };
  }

  async approve(
    user: AuthenticatedUser,
    id: string,
    dto: ReviewFounderApplicationDto,
  ) {
    const application = await this.getApplication(id);
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const shop = dto.shopId
        ? await tx.shop.findFirst({
            where: { id: dto.shopId, deletedAt: null },
            select: { id: true, name: true, slug: true },
          })
        : await this.resolveShopForApplication(tx, application);

      const reviewedApplication = await tx.founderApplication.update({
        where: { id },
        data: {
          status: FounderApplicationStatus.APPROVED,
          reviewedBy: user.id,
          reviewedAt: now,
          reviewNotes: dto.reviewNotes ?? null,
        },
        include: {
          reviewer: { select: { id: true, email: true, name: true } },
        },
      });

      if (!shop) {
        return {
          application: reviewedApplication,
          shop: null,
          founderProgram: null,
          subscription: null,
          message:
            "Application approved. Founder benefits will activate when a matching shop is available.",
        };
      }

      const founderProgram = await tx.founderMerchantProgram.upsert({
        where: { shopId: shop.id },
        create: {
          shopId: shop.id,
          isFounderMerchant: true,
          founderGrantedAt: now,
          grantedById: user.id,
          benefits: this.benefits(),
        },
        update: {
          isFounderMerchant: true,
          founderGrantedAt: now,
          grantedById: user.id,
          benefits: this.benefits(),
          deletedAt: null,
        },
      });

      const subscription = await this.activateFounderTrial(tx, shop.id, now);

      await tx.merchantWorldLocation.updateMany({
        where: { shopId: shop.id },
        data: {
          founderPlacement: true,
          storefrontTheme: StorefrontTheme.FOUNDER_GOLD,
        },
      });

      await tx.merchantBuilding.updateMany({
        where: { shopId: shop.id },
        data: {
          storefrontTheme: StorefrontTheme.FOUNDER_GOLD,
          isPublished: true,
        },
      });

      return {
        application: reviewedApplication,
        shop,
        founderProgram,
        subscription,
        message: "Founder Merchant approved and benefits activated.",
      };
    });
  }

  async reject(
    user: AuthenticatedUser,
    id: string,
    dto: ReviewFounderApplicationDto,
  ) {
    await this.getApplication(id);

    const application = await this.prisma.founderApplication.update({
      where: { id },
      data: {
        status: FounderApplicationStatus.REJECTED,
        reviewedBy: user.id,
        reviewedAt: new Date(),
        reviewNotes: dto.reviewNotes ?? null,
      },
      include: {
        reviewer: { select: { id: true, email: true, name: true } },
      },
    });

    return {
      application,
      message: "Founder Merchant application rejected.",
    };
  }

  private async getApplication(id: string) {
    const application = await this.prisma.founderApplication.findFirst({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException("Founder application not found.");
    }

    return application;
  }

  private async resolveShopForApplication(
    tx: Prisma.TransactionClient,
    application: Awaited<ReturnType<FoundersService["getApplication"]>>,
  ) {
    return tx.shop.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { contactEmail: application.email },
          { name: { equals: application.businessName, mode: "insensitive" } },
          { owner: { email: application.email } },
        ],
      },
      select: { id: true, name: true, slug: true },
      orderBy: { createdAt: "desc" },
    });
  }

  private async activateFounderTrial(
    tx: Prisma.TransactionClient,
    shopId: string,
    now: Date,
  ) {
    for (const plan of subscriptionPlanDefinitions) {
      await tx.subscriptionPlan.upsert({
        where: { code: plan.code },
        create: plan,
        update: { ...plan, status: PlanStatus.ACTIVE, deletedAt: null },
      });
    }

    const proPlan = await tx.subscriptionPlan.findFirst({
      where: {
        planType: SubscriptionPlanType.PRO,
        status: PlanStatus.ACTIVE,
        deletedAt: null,
      },
    });

    if (!proPlan)
      throw new NotFoundException("Pro subscription plan not found.");

    const existing = await tx.merchantSubscription.findFirst({
      where: { shopId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    const data = {
      planId: proPlan.id,
      status: SubscriptionStatus.TRIAL,
      trialStartAt: now,
      trialEndAt: this.addDays(now, trialDurationDays),
      currentPeriodStart: now,
      currentPeriodEnd: this.addDays(now, trialDurationDays),
      cancelledAt: null,
      gracePeriodEndAt: null,
    };

    if (existing) {
      return tx.merchantSubscription.update({
        where: { id: existing.id },
        data,
        include: { plan: true },
      });
    }

    return tx.merchantSubscription.create({
      data: {
        shopId,
        ...data,
      },
      include: { plan: true },
    });
  }

  private benefits() {
    return {
      ...founderBenefits,
      oneMonthProFree: true,
      founderBadge: true,
      founderDistrictPlacement: true,
      founderRecognition: true,
      priorityDiscovery: true,
    };
  }

  private isFounderProgramActive(
    program: {
      isFounderMerchant: boolean;
      founderExpiresAt: Date | null;
      deletedAt: Date | null;
    } | null,
  ) {
    return Boolean(
      program?.isFounderMerchant &&
      program.deletedAt === null &&
      (program.founderExpiresAt === null ||
        program.founderExpiresAt > new Date()),
    );
  }

  private addDays(date: Date, days: number) {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private createReferralCode(email: string) {
    const prefix = email
      .split("@")[0]
      ?.replace(/[^a-z0-9]/gi, "")
      .slice(0, 8);
    return `FOUNDER-${(prefix || "MERCHANT").toUpperCase()}`;
  }
}
