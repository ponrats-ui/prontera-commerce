import {
  FounderApplicationStatus,
  FounderCampaignEventType,
  SubscriptionStatus,
} from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { FoundersService } from "./founders.service";

const admin: AuthenticatedUser = {
  id: "admin-1",
  email: "admin@example.com",
  roles: ["admin"],
  sessionId: "session-1",
};

const application = {
  id: "application-1",
  merchantName: "COM",
  businessName: "Velora PC",
  businessType: "Computer Store",
  category: "IT Equipment",
  website: null,
  facebookPage: null,
  email: "merchant@example.com",
  phone: "+66812345678",
  motivation: "I want to help build the first merchant civilization.",
  status: FounderApplicationStatus.PENDING,
  reviewedBy: null,
  reviewNotes: null,
  submittedAt: new Date("2026-06-17T00:00:00.000Z"),
  reviewedAt: null,
};

function createTxMock() {
  return {
    shop: {
      findFirst: jest.fn().mockResolvedValue({
        id: "shop-1",
        name: "Velora PC",
        slug: "velora-pc",
      }),
    },
    founderApplication: {
      update: jest.fn().mockResolvedValue({
        ...application,
        status: FounderApplicationStatus.APPROVED,
        reviewedBy: admin.id,
      }),
    },
    founderMerchantProgram: {
      upsert: jest.fn().mockResolvedValue({
        id: "founder-1",
        shopId: "shop-1",
        isFounderMerchant: true,
      }),
    },
    subscriptionPlan: {
      upsert: jest.fn(),
      findFirst: jest.fn().mockResolvedValue({
        id: "pro-plan",
        planType: "PRO",
      }),
    },
    merchantSubscription: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        id: "subscription-1",
        status: SubscriptionStatus.TRIAL,
      }),
      update: jest.fn(),
    },
    merchantWorldLocation: {
      updateMany: jest.fn(),
    },
    merchantBuilding: {
      updateMany: jest.fn(),
    },
  };
}

function createPrismaMock() {
  const tx = createTxMock();
  return {
    founderApplication: {
      create: jest.fn().mockResolvedValue(application),
      findFirst: jest.fn().mockResolvedValue(application),
      findMany: jest.fn().mockResolvedValue([application]),
      count: jest.fn().mockResolvedValue(1),
      update: jest.fn().mockResolvedValue({
        ...application,
        status: FounderApplicationStatus.REJECTED,
      }),
    },
    founderMerchantProgram: {
      count: jest.fn().mockResolvedValue(1),
    },
    founderWaitlistEntry: {
      create: jest.fn().mockResolvedValue({
        id: "waitlist-1",
        email: "merchant@example.com",
      }),
      count: jest.fn().mockResolvedValue(1),
    },
    founderReferral: {
      upsert: jest.fn().mockResolvedValue({
        id: "referral-1",
        referralCode: "FOUNDER-COM",
      }),
      count: jest.fn().mockResolvedValue(1),
    },
    founderCampaignEvent: {
      create: jest.fn().mockResolvedValue({
        id: "event-1",
        eventType: FounderCampaignEventType.APPLICATION_SUBMITTED,
      }),
      count: jest.fn().mockResolvedValue(1),
    },
    shop: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    $transaction: jest.fn((callback) => callback(tx)),
    tx,
  };
}

describe("FoundersService", () => {
  it("submits Founder Merchant applications", async () => {
    const prisma = createPrismaMock();
    const service = new FoundersService(prisma as never);

    const result = await service.apply({
      merchantName: "COM",
      businessName: "Velora PC",
      businessType: "Computer Store",
      category: "IT Equipment",
      email: "merchant@example.com",
      phone: "+66812345678",
      motivation: "I want to help build the first merchant civilization.",
    });

    expect(result.application.status).toBe(FounderApplicationStatus.PENDING);
    expect(prisma.founderApplication.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          businessName: "Velora PC",
          email: "merchant@example.com",
        }),
      }),
    );
  });

  it("approves applications and activates Founder benefits", async () => {
    const prisma = createPrismaMock();
    const service = new FoundersService(prisma as never);

    const result = await service.approve(admin, application.id, {
      shopId: "shop-1",
      reviewNotes: "Strong fit.",
    });

    expect(result.founderProgram?.isFounderMerchant).toBe(true);
    expect(prisma.tx.founderMerchantProgram.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          shopId: "shop-1",
          isFounderMerchant: true,
          grantedById: admin.id,
        }),
      }),
    );
    expect(prisma.tx.merchantSubscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          shopId: "shop-1",
          planId: "pro-plan",
          status: SubscriptionStatus.TRIAL,
        }),
      }),
    );
    expect(prisma.tx.merchantWorldLocation.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { shopId: "shop-1" },
        data: expect.objectContaining({ founderPlacement: true }),
      }),
    );
  });

  it("captures waitlist and referral activity", async () => {
    const prisma = createPrismaMock();
    const service = new FoundersService(prisma as never);

    const waitlist = await service.joinWaitlist({
      merchantName: "COM",
      businessName: "Velora PC",
      email: "merchant@example.com",
      category: "Computer Store",
      source: "facebook",
    });
    const referral = await service.refer({
      referrerEmail: "founder@example.com",
      referredEmail: "friend@example.com",
    });

    expect(waitlist.entry.id).toBe("waitlist-1");
    expect(referral.referral.referralCode).toBe("FOUNDER-COM");
    expect(prisma.founderCampaignEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          eventType: FounderCampaignEventType.REFERRAL_CAPTURED,
        }),
      }),
    );
  });

  it("returns Founder program metrics", async () => {
    const prisma = createPrismaMock();
    const service = new FoundersService(prisma as never);

    const metrics = await service.metrics();

    expect(metrics.goal).toBe(100);
    expect(metrics.approvedFounders).toBe(1);
    expect(metrics.waitlistCount).toBe(1);
    expect(metrics.referralCount).toBe(1);
    expect(metrics.founderConversionRate).toBe(100);
  });
});
