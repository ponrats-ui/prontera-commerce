import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  PricingTierStatus,
  PromotionStatus,
  PromotionType,
  ShopStaffRole,
  VoucherStatus,
} from "@prisma/client";
import request from "supertest";
import type { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PrismaService } from "../database/prisma.service";
import { PromotionsModule } from "./promotions.module";

const shopId = "11111111-1111-4111-8111-111111111111";
const campaignId = "22222222-2222-4222-8222-222222222222";
const voucherId = "33333333-3333-4333-8333-333333333333";
const tierId = "44444444-4444-4444-8444-444444444444";
const customerGroupId = "55555555-5555-4555-8555-555555555555";
const productVariantId = "77777777-7777-4777-8777-777777777777";

const user: AuthenticatedUser = {
  id: "owner-1",
  email: "owner@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

function createPrismaMock() {
  const campaign = {
    id: campaignId,
    shopId,
    name: "VIP Campaign",
    promotionType: PromotionType.PERCENT_DISCOUNT,
    status: PromotionStatus.ACTIVE,
    priority: 10,
    startsAt: null,
    endsAt: null,
    deletedAt: null,
    rules: [{ discountPercent: 10, deletedAt: null }],
    vouchers: [],
  };

  return {
    shop: {
      findFirst: jest.fn().mockResolvedValue({
        ownerId: user.id,
        staff: [{ role: ShopStaffRole.OWNER }],
      }),
    },
    productVariant: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: productVariantId,
          priceCents: 1000,
          product: { id: "product-1", categoryId: "category-1" },
        },
      ]),
    },
    customer: {
      findFirst: jest.fn().mockResolvedValue({ id: "customer-1" }),
    },
    customerGroup: {
      findFirst: jest.fn().mockResolvedValue({ id: customerGroupId }),
    },
    customerGroupMember: {
      findMany: jest.fn().mockResolvedValue([{ groupId: customerGroupId }]),
    },
    promotionCampaign: {
      create: jest.fn((args) => Promise.resolve({ ...campaign, ...args.data })),
      findMany: jest.fn().mockResolvedValue([campaign]),
      findFirst: jest.fn().mockResolvedValue(campaign),
      update: jest.fn((args) => Promise.resolve({ ...campaign, ...args.data })),
    },
    promotionRule: {
      updateMany: jest.fn(),
      createMany: jest.fn(),
    },
    voucher: {
      create: jest.fn((args) =>
        Promise.resolve({
          id: voucherId,
          shopId,
          code: args.data.code,
          status: args.data.status,
          campaign,
        }),
      ),
      findFirst: jest.fn((args) => {
        if (args.where?.code === "VIP10") {
          return Promise.resolve({
            id: voucherId,
            shopId,
            code: "VIP10",
            campaignId,
            status: VoucherStatus.ACTIVE,
            usageLimit: 10,
            usageCount: 0,
            startsAt: null,
            endsAt: null,
            deletedAt: null,
            campaign,
          });
        }
        return Promise.resolve(null);
      }),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
    },
    customerPricingTier: {
      create: jest.fn((args) =>
        Promise.resolve({
          id: tierId,
          ...args.data,
          customerGroup: { id: customerGroupId, name: "VIP" },
        }),
      ),
      findMany: jest.fn().mockResolvedValue([
        {
          id: tierId,
          name: "VIP Pricing",
          discountPercent: 15,
          customerGroupId,
          status: PricingTierStatus.ACTIVE,
        },
      ]),
      findFirst: jest.fn().mockResolvedValue({
        id: tierId,
        shopId,
        customerGroupId,
      }),
      update: jest.fn((args) => Promise.resolve({ id: tierId, ...args.data })),
    },
    product: {
      findFirst: jest.fn().mockResolvedValue({ id: "product-1" }),
    },
    category: {
      findFirst: jest.fn().mockResolvedValue({ id: "category-1" }),
    },
    $transaction: jest.fn((callback) =>
      callback({
        promotionRule: { updateMany: jest.fn(), createMany: jest.fn() },
        promotionCampaign: {
          update: jest.fn((args) =>
            Promise.resolve({ ...campaign, ...args.data }),
          ),
        },
      }),
    ),
  };
}

describe("PromotionsController (integration)", () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const moduleRef = await Test.createTestingModule({
      imports: [PromotionsModule],
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

  it("creates a campaign", async () => {
    const response = await request(app.getHttpServer())
      .post("/promotions/campaigns")
      .send({
        shopId,
        name: "VIP Campaign",
        promotionType: "PERCENT_DISCOUNT",
        status: "ACTIVE",
        rules: [{ discountPercent: 10 }],
      })
      .expect(201);

    expect(response.body.name).toBe("VIP Campaign");
  });

  it("creates a voucher", async () => {
    const response = await request(app.getHttpServer())
      .post("/promotions/vouchers")
      .send({
        shopId,
        campaignId,
        code: "save10",
        status: "ACTIVE",
      })
      .expect(201);

    expect(response.body.code).toBe("SAVE10");
  });

  it("creates VIP pricing", async () => {
    const response = await request(app.getHttpServer())
      .post("/promotions/pricing-tiers")
      .send({
        shopId,
        customerGroupId,
        name: "VIP Pricing",
        discountPercent: 15,
      })
      .expect(201);

    expect(response.body.discountPercent).toBe(15);
  });

  it("evaluates best-discount-wins with VIP discount", async () => {
    const response = await request(app.getHttpServer())
      .post("/promotions/evaluate")
      .send({
        shopId,
        customerId: "66666666-6666-4666-8666-666666666666",
        orderItems: [{ productVariantId, quantity: 2 }],
        voucherCode: "VIP10",
      })
      .expect(201);

    expect(response.body.discountAmount).toBe(300);
    expect(response.body.appliedPricingTier.id).toBe(tierId);
  });
});
