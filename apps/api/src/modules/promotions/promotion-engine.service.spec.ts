import {
  PricingTierStatus,
  PromotionStatus,
  PromotionType,
  VoucherStatus,
} from "@prisma/client";
import { PromotionEngineService } from "./promotion-engine.service";

const now = new Date();

const variant = {
  id: "variant-1",
  priceCents: 1000,
  product: { id: "product-1", categoryId: "category-1" },
};

function createService(prismaOverrides: Record<string, unknown> = {}) {
  const prisma = {
    productVariant: {
      findMany: jest.fn().mockResolvedValue([variant]),
    },
    customer: {
      findFirst: jest.fn().mockResolvedValue({ id: "customer-1" }),
    },
    customerGroupMember: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    promotionCampaign: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    voucher: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    customerPricingTier: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    ...prismaOverrides,
  };

  return {
    prisma,
    service: new PromotionEngineService(
      prisma as never,
      { canReadPromotions: jest.fn(), canManagePromotions: jest.fn() } as never,
    ),
  };
}

describe("PromotionEngineService", () => {
  it("applies the highest campaign discount with best-discount-wins", async () => {
    const campaign10 = {
      id: "campaign-10",
      name: "Ten percent",
      promotionType: PromotionType.PERCENT_DISCOUNT,
      status: PromotionStatus.ACTIVE,
      priority: 1,
      startsAt: null,
      endsAt: null,
      deletedAt: null,
      rules: [{ discountPercent: 10, deletedAt: null }],
    };
    const campaign25 = {
      ...campaign10,
      id: "campaign-25",
      name: "Fixed 25",
      promotionType: PromotionType.FIXED_DISCOUNT,
      priority: 0,
      rules: [{ discountAmount: 500, deletedAt: null }],
    };
    const { service } = createService({
      promotionCampaign: {
        findMany: jest.fn().mockResolvedValue([campaign10, campaign25]),
      },
    });

    const result = await service.evaluateForShop({
      shopId: "shop-1",
      orderItems: [{ productVariantId: "variant-1", quantity: 2 }],
    });

    expect(result.strategy).toBe("BEST_DISCOUNT_WINS");
    expect(result.discountAmount).toBe(500);
    expect(result.finalSubtotal).toBe(1500);
    expect(result.appliedCampaign?.id).toBe("campaign-25");
  });

  it("ignores expired vouchers", async () => {
    const { service } = createService({
      voucher: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    });

    const result = await service.evaluateForShop({
      shopId: "shop-1",
      voucherCode: "OLD",
      orderItems: [{ productVariantId: "variant-1", quantity: 1 }],
    });

    expect(result.appliedVoucher).toBeNull();
    expect(result.discountAmount).toBe(0);
  });

  it("applies customer group pricing tiers", async () => {
    const { service } = createService({
      customerGroupMember: {
        findMany: jest.fn().mockResolvedValue([{ groupId: "vip-group" }]),
      },
      customerPricingTier: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "tier-1",
            name: "VIP",
            discountPercent: 15,
            customerGroupId: "vip-group",
            status: PricingTierStatus.ACTIVE,
          },
        ]),
      },
    });

    const result = await service.evaluateForShop({
      shopId: "shop-1",
      customerId: "customer-1",
      orderItems: [{ productVariantId: "variant-1", quantity: 2 }],
    });

    expect(result.appliedPricingTier?.id).toBe("tier-1");
    expect(result.discountAmount).toBe(300);
  });

  it("applies a valid voucher campaign", async () => {
    const voucher = {
      id: "voucher-1",
      code: "VIP10",
      campaignId: "campaign-1",
      status: VoucherStatus.ACTIVE,
      usageLimit: 10,
      usageCount: 0,
      campaign: {
        id: "campaign-1",
        name: "Voucher Campaign",
        promotionType: PromotionType.PERCENT_DISCOUNT,
        status: PromotionStatus.ACTIVE,
        priority: 1,
        startsAt: now,
        endsAt: null,
        deletedAt: null,
        rules: [{ discountPercent: 10, deletedAt: null }],
      },
    };
    const { service } = createService({
      voucher: {
        findFirst: jest.fn().mockResolvedValue(voucher),
      },
    });

    const result = await service.evaluateForShop({
      shopId: "shop-1",
      voucherCode: "VIP10",
      orderItems: [{ productVariantId: "variant-1", quantity: 2 }],
    });

    expect(result.appliedVoucher?.code).toBe("VIP10");
    expect(result.discountAmount).toBe(200);
  });
});
