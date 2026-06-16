import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  ShopStaffRole,
  SubscriptionPlanType,
  SubscriptionStatus,
} from "@prisma/client";
import request from "supertest";
import type { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PrismaService } from "../database/prisma.service";
import { SubscriptionsModule } from "./subscriptions.module";

const shopId = "11111111-1111-4111-8111-111111111111";
const starterPlan = {
  id: "starter-plan",
  code: "STARTER",
  name: "Starter Free Forever",
  planType: SubscriptionPlanType.STARTER,
  priceCents: 0,
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
  priceCents: 2900,
  liveCommerce: true,
  advancedAnalytics: true,
  multiStaff: true,
  aiMerchantAssistant: true,
  crmAdvanced: true,
  promotionFullAccess: true,
};

const user: AuthenticatedUser = {
  id: "owner-1",
  email: "owner@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

function createPrismaMock() {
  const subscription = {
    id: "sub-1",
    shopId,
    status: SubscriptionStatus.TRIAL,
    trialStartAt: new Date("2026-06-16T00:00:00.000Z"),
    trialEndAt: new Date("2026-07-16T00:00:00.000Z"),
    plan: proPlan,
  };

  return {
    shop: {
      findFirst: jest.fn((args) => {
        if (args.select?.ownerId) {
          return Promise.resolve({
            ownerId: user.id,
            staff: [{ role: ShopStaffRole.OWNER }],
          });
        }

        return Promise.resolve({
          id: shopId,
          name: "Prontera Outfitters",
          slug: "prontera-outfitters",
        });
      }),
    },
    subscriptionPlan: {
      upsert: jest.fn(),
      findMany: jest.fn().mockResolvedValue([starterPlan, proPlan]),
      findFirst: jest.fn((args) =>
        Promise.resolve(
          args.where?.planType === SubscriptionPlanType.STARTER
            ? starterPlan
            : proPlan,
        ),
      ),
    },
    merchantSubscription: {
      findFirst: jest.fn().mockResolvedValue(subscription),
      update: jest.fn((args) =>
        Promise.resolve({
          ...subscription,
          ...args.data,
          plan: args.data.planId === starterPlan.id ? starterPlan : proPlan,
        }),
      ),
    },
    founderMerchantProgram: {
      findFirst: jest.fn().mockResolvedValue(null),
      upsert: jest.fn((args) =>
        Promise.resolve({
          id: "founder-1",
          ...args.create,
        }),
      ),
    },
  };
}

describe("SubscriptionsController (integration)", () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const moduleRef = await Test.createTestingModule({
      imports: [SubscriptionsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => { getRequest: () => { user: AuthenticatedUser } };
        }) => {
          context.switchToHttp().getRequest().user = user;
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("lists merchant subscription plans", async () => {
    const response = await request(app.getHttpServer())
      .get("/subscriptions/plans")
      .expect(200);

    expect(response.body).toHaveLength(2);
  });

  it("returns current merchant subscription overview", async () => {
    const response = await request(app.getHttpServer())
      .get(`/subscriptions/me?shopId=${shopId}`)
      .expect(200);

    expect(response.body.subscription.status).toBe(SubscriptionStatus.TRIAL);
    expect(response.body.effectivePlan.code).toBe("PRO");
  });

  it("upgrades to Pro", async () => {
    const response = await request(app.getHttpServer())
      .post("/subscriptions/upgrade")
      .send({ shopId, planType: "PRO" })
      .expect(201);

    expect(response.body.subscription.status).toBe(SubscriptionStatus.ACTIVE);
  });

  it("cancels to Starter", async () => {
    const response = await request(app.getHttpServer())
      .post("/subscriptions/cancel")
      .send({ shopId })
      .expect(201);

    expect(response.body.subscription.status).toBe(
      SubscriptionStatus.CANCELLED,
    );
    expect(response.body.effectivePlan.code).toBe("STARTER");
  });

  it("grants Founder Merchant program access", async () => {
    const response = await request(app.getHttpServer())
      .post("/admin/subscriptions/founders")
      .send({ shopId })
      .expect(201);

    expect(response.body.isFounderMerchant).toBe(true);
  });
});
