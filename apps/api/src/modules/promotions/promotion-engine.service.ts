import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  PricingTierStatus,
  Prisma,
  PromotionStatus,
  PromotionType,
  VoucherStatus,
} from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import type {
  CreatePricingTierDto,
  CreatePromotionCampaignDto,
  CreateVoucherDto,
  EvaluatePromotionsDto,
  PromotionRuleDto,
  UpdatePricingTierDto,
  UpdatePromotionCampaignDto,
  UpdateVoucherDto,
} from "./dto/promotion.dto";
import { PromotionPermissionsService } from "./promotion-permissions.service";

const campaignInclude = {
  rules: { where: { deletedAt: null } },
  vouchers: { where: { deletedAt: null } },
} satisfies Prisma.PromotionCampaignInclude;

type LoadedItem = {
  productVariantId: string;
  productId: string;
  categoryId: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
};

type CampaignWithRules = Prisma.PromotionCampaignGetPayload<{
  include: { rules: true };
}>;

type VoucherWithCampaign = Prisma.VoucherGetPayload<{
  include: { campaign: { include: { rules: true } } };
}>;

type DiscountCandidate = {
  source: "campaign" | "voucher" | "pricing-tier";
  discountAmount: number;
  campaign?: CampaignWithRules;
  voucher?: VoucherWithCampaign;
  pricingTier?: {
    id: string;
    name: string;
    discountPercent: number;
    customerGroupId: string;
  };
};

@Injectable()
export class PromotionEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: PromotionPermissionsService,
  ) {}

  async createCampaign(
    user: AuthenticatedUser,
    dto: CreatePromotionCampaignDto,
  ) {
    await this.assertCanManage(user.id, dto.shopId);
    await this.assertValidDateWindow(dto.startsAt, dto.endsAt);
    await this.assertRulesBelongToShop(dto.shopId, dto.rules ?? []);

    const data: Prisma.PromotionCampaignUncheckedCreateInput = {
      shopId: dto.shopId,
      name: dto.name,
      description: dto.description ?? null,
      promotionType: dto.promotionType,
      status: dto.status ?? PromotionStatus.DRAFT,
      startsAt: dto.startsAt ?? null,
      endsAt: dto.endsAt ?? null,
      priority: dto.priority ?? 0,
      stackable: dto.stackable ?? false,
      createdById: user.id,
    };

    if (dto.rules?.length) {
      data.rules = {
        create: dto.rules.map((rule) => this.toRuleCreateInput(rule)),
      };
    }

    return this.prisma.promotionCampaign.create({
      data,
      include: campaignInclude,
    });
  }

  async listCampaigns(user: AuthenticatedUser, shopId: string) {
    await this.assertCanRead(user.id, shopId);

    return this.prisma.promotionCampaign.findMany({
      where: { shopId, deletedAt: null },
      include: campaignInclude,
      orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    });
  }

  async getCampaign(user: AuthenticatedUser, id: string) {
    const campaign = await this.getCampaignOrThrow(id);
    await this.assertCanRead(user.id, campaign.shopId);
    return campaign;
  }

  async updateCampaign(
    user: AuthenticatedUser,
    id: string,
    dto: UpdatePromotionCampaignDto,
  ) {
    const campaign = await this.getCampaignOrThrow(id);
    await this.assertCanManage(user.id, campaign.shopId);
    await this.assertValidDateWindow(dto.startsAt, dto.endsAt);

    if (dto.rules !== undefined) {
      await this.assertRulesBelongToShop(campaign.shopId, dto.rules);
    }

    const data: Prisma.PromotionCampaignUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined)
      data.description = dto.description ?? null;
    if (dto.promotionType !== undefined) data.promotionType = dto.promotionType;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.startsAt !== undefined) data.startsAt = dto.startsAt ?? null;
    if (dto.endsAt !== undefined) data.endsAt = dto.endsAt ?? null;
    if (dto.priority !== undefined) data.priority = dto.priority;
    if (dto.stackable !== undefined) data.stackable = dto.stackable;

    return this.prisma.$transaction(async (tx) => {
      if (dto.rules !== undefined) {
        await tx.promotionRule.updateMany({
          where: { campaignId: id, deletedAt: null },
          data: { deletedAt: new Date() },
        });

        if (dto.rules.length) {
          await tx.promotionRule.createMany({
            data: dto.rules.map((rule) => ({
              campaignId: id,
              ...this.toRuleUncheckedInput(rule),
            })),
          });
        }
      }

      return tx.promotionCampaign.update({
        where: { id },
        data,
        include: campaignInclude,
      });
    });
  }

  async deleteCampaign(user: AuthenticatedUser, id: string) {
    const campaign = await this.getCampaignOrThrow(id);
    await this.assertCanManage(user.id, campaign.shopId);

    await this.prisma.promotionCampaign.update({
      where: { id },
      data: { status: PromotionStatus.EXPIRED, deletedAt: new Date() },
    });

    return { success: true };
  }

  async createVoucher(user: AuthenticatedUser, dto: CreateVoucherDto) {
    await this.assertCanManage(user.id, dto.shopId);
    await this.assertValidDateWindow(dto.startsAt, dto.endsAt);
    await this.assertUniqueVoucherCode(dto.shopId, dto.code);

    const campaign = await this.getCampaignOrThrow(dto.campaignId);
    if (campaign.shopId !== dto.shopId) {
      throw new ForbiddenException("Voucher campaign belongs to another shop.");
    }

    return this.prisma.voucher.create({
      data: {
        shopId: dto.shopId,
        campaignId: dto.campaignId,
        code: dto.code,
        description: dto.description ?? null,
        status: dto.status ?? VoucherStatus.DRAFT,
        usageLimit: dto.usageLimit ?? null,
        startsAt: dto.startsAt ?? null,
        endsAt: dto.endsAt ?? null,
      },
      include: { campaign: true },
    });
  }

  async listVouchers(user: AuthenticatedUser, shopId: string) {
    await this.assertCanRead(user.id, shopId);

    return this.prisma.voucher.findMany({
      where: { shopId, deletedAt: null },
      include: { campaign: true },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
  }

  async updateVoucher(
    user: AuthenticatedUser,
    id: string,
    dto: UpdateVoucherDto,
  ) {
    const voucher = await this.getVoucherOrThrow(id);
    await this.assertCanManage(user.id, voucher.shopId);
    await this.assertValidDateWindow(dto.startsAt, dto.endsAt);

    const data: Prisma.VoucherUpdateInput = {};
    if (dto.description !== undefined)
      data.description = dto.description ?? null;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.usageLimit !== undefined) data.usageLimit = dto.usageLimit ?? null;
    if (dto.startsAt !== undefined) data.startsAt = dto.startsAt ?? null;
    if (dto.endsAt !== undefined) data.endsAt = dto.endsAt ?? null;

    return this.prisma.voucher.update({
      where: { id },
      data,
      include: { campaign: true },
    });
  }

  async createPricingTier(user: AuthenticatedUser, dto: CreatePricingTierDto) {
    await this.assertCanManage(user.id, dto.shopId);
    await this.assertCustomerGroupBelongsToShop(
      dto.shopId,
      dto.customerGroupId,
    );

    return this.prisma.customerPricingTier.create({
      data: {
        shopId: dto.shopId,
        customerGroupId: dto.customerGroupId,
        name: dto.name,
        discountPercent: dto.discountPercent,
        status: dto.status ?? PricingTierStatus.ACTIVE,
      },
      include: { customerGroup: true },
    });
  }

  async listPricingTiers(user: AuthenticatedUser, shopId: string) {
    await this.assertCanRead(user.id, shopId);

    return this.prisma.customerPricingTier.findMany({
      where: { shopId, deletedAt: null },
      include: { customerGroup: true },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
  }

  async updatePricingTier(
    user: AuthenticatedUser,
    id: string,
    dto: UpdatePricingTierDto,
  ) {
    const tier = await this.getPricingTierOrThrow(id);
    await this.assertCanManage(user.id, tier.shopId);

    return this.prisma.customerPricingTier.update({
      where: { id },
      data: dto,
      include: { customerGroup: true },
    });
  }

  async evaluate(user: AuthenticatedUser, dto: EvaluatePromotionsDto) {
    await this.assertCanRead(user.id, dto.shopId);
    return this.evaluateForShop(dto);
  }

  async evaluateForShop(dto: EvaluatePromotionsDto) {
    const items = await this.loadItems(dto.shopId, dto.orderItems);
    const subtotal = items.reduce((sum, item) => sum + item.lineSubtotal, 0);
    const customerGroupIds = await this.loadCustomerGroupIds(
      dto.shopId,
      dto.customerId,
    );
    const campaigns = await this.loadActiveCampaigns(dto.shopId);
    const candidates: DiscountCandidate[] = [];

    for (const campaign of campaigns) {
      const discountAmount = this.calculateCampaignDiscount(
        campaign,
        items,
        subtotal,
        customerGroupIds,
      );

      if (discountAmount > 0) {
        candidates.push({ source: "campaign", campaign, discountAmount });
      }
    }

    const voucher = dto.voucherCode
      ? await this.loadApplicableVoucher(dto.shopId, dto.voucherCode)
      : null;

    if (voucher) {
      const discountAmount = this.calculateCampaignDiscount(
        voucher.campaign,
        items,
        subtotal,
        customerGroupIds,
      );

      if (discountAmount > 0) {
        candidates.push({
          source: "voucher",
          campaign: voucher.campaign,
          voucher,
          discountAmount,
        });
      }
    }

    for (const tier of await this.loadPricingTiers(
      dto.shopId,
      customerGroupIds,
    )) {
      const discountAmount = this.percentDiscount(
        subtotal,
        tier.discountPercent,
      );
      if (discountAmount > 0) {
        candidates.push({
          source: "pricing-tier",
          pricingTier: tier,
          discountAmount,
        });
      }
    }

    const winner = this.selectBestDiscount(candidates);
    const discountAmount = Math.min(winner?.discountAmount ?? 0, subtotal);

    return {
      strategy: "BEST_DISCOUNT_WINS",
      subtotal,
      eligiblePromotions: candidates.map((candidate) =>
        this.serializeCandidate(candidate),
      ),
      appliedPromotion: winner ? this.serializeCandidate(winner) : null,
      appliedCampaign: winner?.campaign
        ? this.serializeCampaign(winner.campaign)
        : null,
      appliedVoucher: winner?.voucher
        ? this.serializeVoucher(winner.voucher)
        : null,
      appliedPricingTier: winner?.pricingTier ?? null,
      discountAmount,
      finalSubtotal: Math.max(0, subtotal - discountAmount),
    };
  }

  private calculateCampaignDiscount(
    campaign: CampaignWithRules,
    items: LoadedItem[],
    subtotal: number,
    customerGroupIds: Set<string>,
  ) {
    if (!this.isCampaignApplicable(campaign)) return 0;

    const discounts = campaign.rules
      .filter((rule) => rule.deletedAt === null)
      .map((rule) =>
        this.calculateRuleDiscount(
          campaign.promotionType,
          rule,
          items,
          subtotal,
          customerGroupIds,
        ),
      );

    return Math.max(0, ...discounts);
  }

  private calculateRuleDiscount(
    promotionType: PromotionType,
    rule: CampaignWithRules["rules"][number],
    items: LoadedItem[],
    subtotal: number,
    customerGroupIds: Set<string>,
  ) {
    const eligibleItems = this.filterItemsForRule(rule, items);
    const eligibleSubtotal = eligibleItems.reduce(
      (sum, item) => sum + item.lineSubtotal,
      0,
    );
    const eligibleQuantity = eligibleItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    if (rule.minimumOrderAmount != null && subtotal < rule.minimumOrderAmount) {
      return 0;
    }

    if (
      rule.minimumQuantity != null &&
      eligibleQuantity < rule.minimumQuantity
    ) {
      return 0;
    }

    if (
      rule.targetCustomerGroupId != null &&
      !customerGroupIds.has(rule.targetCustomerGroupId)
    ) {
      return 0;
    }

    if (eligibleSubtotal <= 0) return 0;

    if (
      promotionType === PromotionType.PERCENT_DISCOUNT ||
      promotionType === PromotionType.CUSTOMER_GROUP_DISCOUNT
    ) {
      return this.percentDiscount(eligibleSubtotal, rule.discountPercent ?? 0);
    }

    if (promotionType === PromotionType.FIXED_DISCOUNT) {
      return Math.min(rule.discountAmount ?? 0, eligibleSubtotal);
    }

    if (promotionType === PromotionType.BUY_X_GET_Y) {
      return this.buyXGetYDiscount(rule, eligibleItems);
    }

    return 0;
  }

  private buyXGetYDiscount(
    rule: CampaignWithRules["rules"][number],
    items: LoadedItem[],
  ) {
    const buyQuantity = rule.buyQuantity ?? 0;
    const getQuantity = rule.getQuantity ?? 0;
    if (buyQuantity <= 0 || getQuantity <= 0) return 0;

    const unitPrices = items.flatMap((item) =>
      Array.from({ length: item.quantity }, () => item.unitPrice),
    );
    const bundleSize = buyQuantity + getQuantity;
    const freeUnits = Math.floor(unitPrices.length / bundleSize) * getQuantity;
    return unitPrices
      .sort((a, b) => a - b)
      .slice(0, freeUnits)
      .reduce((sum, price) => sum + price, 0);
  }

  private filterItemsForRule(
    rule: CampaignWithRules["rules"][number],
    items: LoadedItem[],
  ) {
    return items.filter((item) => {
      if (rule.targetProductId && item.productId !== rule.targetProductId) {
        return false;
      }
      if (rule.targetCategoryId && item.categoryId !== rule.targetCategoryId) {
        return false;
      }
      return true;
    });
  }

  private selectBestDiscount(candidates: DiscountCandidate[]) {
    return candidates.slice().sort((left, right) => {
      if (right.discountAmount !== left.discountAmount) {
        return right.discountAmount - left.discountAmount;
      }

      return (right.campaign?.priority ?? 0) - (left.campaign?.priority ?? 0);
    })[0];
  }

  private percentDiscount(amount: number, percent: number) {
    if (percent <= 0) return 0;
    return Math.floor((amount * percent) / 100);
  }

  private async loadItems(
    shopId: string,
    orderItems: EvaluatePromotionsDto["orderItems"],
  ): Promise<LoadedItem[]> {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        id: { in: orderItems.map((item) => item.productVariantId) },
        deletedAt: null,
        product: { shopId, deletedAt: null },
      },
      include: { product: { select: { id: true, categoryId: true } } },
    });

    if (variants.length !== orderItems.length) {
      throw new BadRequestException(
        "One or more product variants are invalid.",
      );
    }

    const variantMap = new Map(
      variants.map((variant) => [variant.id, variant]),
    );

    return orderItems.map((item) => {
      const variant = variantMap.get(item.productVariantId);
      if (!variant) throw new BadRequestException("Invalid product variant.");

      return {
        productVariantId: variant.id,
        productId: variant.product.id,
        categoryId: variant.product.categoryId,
        quantity: item.quantity,
        unitPrice: variant.priceCents,
        lineSubtotal: variant.priceCents * item.quantity,
      };
    });
  }

  private async loadCustomerGroupIds(shopId: string, customerId?: string) {
    if (!customerId) return new Set<string>();

    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, shopId, deletedAt: null },
      select: { id: true },
    });

    if (!customer)
      throw new BadRequestException("Customer does not belong to shop.");

    const memberships = await this.prisma.customerGroupMember.findMany({
      where: {
        customerId,
        deletedAt: null,
        group: { shopId, status: "ACTIVE", deletedAt: null },
      },
      select: { groupId: true },
    });

    return new Set(memberships.map((membership) => membership.groupId));
  }

  private async loadActiveCampaigns(shopId: string) {
    const now = new Date();
    return this.prisma.promotionCampaign.findMany({
      where: {
        shopId,
        status: PromotionStatus.ACTIVE,
        deletedAt: null,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      include: { rules: true },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
  }

  private async loadApplicableVoucher(shopId: string, code: string) {
    const now = new Date();
    const voucher = await this.prisma.voucher.findFirst({
      where: {
        shopId,
        code,
        status: VoucherStatus.ACTIVE,
        deletedAt: null,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      include: { campaign: { include: { rules: true } } },
    });

    if (!voucher) return null;
    if (
      voucher.usageLimit !== null &&
      voucher.usageCount >= voucher.usageLimit
    ) {
      return null;
    }
    if (!this.isCampaignApplicable(voucher.campaign)) return null;
    return voucher;
  }

  private async loadPricingTiers(
    shopId: string,
    customerGroupIds: Set<string>,
  ) {
    if (!customerGroupIds.size) return [];

    return this.prisma.customerPricingTier.findMany({
      where: {
        shopId,
        customerGroupId: { in: Array.from(customerGroupIds) },
        status: PricingTierStatus.ACTIVE,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        discountPercent: true,
        customerGroupId: true,
      },
      orderBy: { discountPercent: "desc" },
    });
  }

  private isCampaignApplicable(campaign: {
    status: PromotionStatus;
    startsAt: Date | null;
    endsAt: Date | null;
    deletedAt: Date | null;
  }) {
    const now = new Date();
    return (
      campaign.deletedAt === null &&
      campaign.status === PromotionStatus.ACTIVE &&
      (campaign.startsAt === null || campaign.startsAt <= now) &&
      (campaign.endsAt === null || campaign.endsAt >= now)
    );
  }

  private async getCampaignOrThrow(id: string) {
    const campaign = await this.prisma.promotionCampaign.findFirst({
      where: { id, deletedAt: null },
      include: campaignInclude,
    });

    if (!campaign) throw new NotFoundException("Promotion campaign not found.");
    return campaign;
  }

  private async getVoucherOrThrow(id: string) {
    const voucher = await this.prisma.voucher.findFirst({
      where: { id, deletedAt: null },
    });

    if (!voucher) throw new NotFoundException("Voucher not found.");
    return voucher;
  }

  private async getPricingTierOrThrow(id: string) {
    const tier = await this.prisma.customerPricingTier.findFirst({
      where: { id, deletedAt: null },
    });

    if (!tier) throw new NotFoundException("Pricing tier not found.");
    return tier;
  }

  private async assertCanRead(userId: string, shopId: string) {
    if (!(await this.permissions.canReadPromotions(userId, shopId))) {
      throw new ForbiddenException("You cannot read promotions for this shop.");
    }
  }

  private async assertCanManage(userId: string, shopId: string) {
    if (!(await this.permissions.canManagePromotions(userId, shopId))) {
      throw new ForbiddenException(
        "You cannot manage promotions for this shop.",
      );
    }
  }

  private async assertUniqueVoucherCode(
    shopId: string,
    code: string,
    exceptId?: string,
  ) {
    const existing = await this.prisma.voucher.findFirst({
      where: {
        shopId,
        code,
        deletedAt: null,
        ...(exceptId ? { NOT: { id: exceptId } } : {}),
      },
      select: { id: true },
    });

    if (existing) throw new ConflictException("Voucher code already exists.");
  }

  private async assertRulesBelongToShop(
    shopId: string,
    rules: PromotionRuleDto[],
  ) {
    for (const rule of rules) {
      if (rule.targetProductId) {
        await this.assertProductBelongsToShop(shopId, rule.targetProductId);
      }
      if (rule.targetCategoryId) {
        await this.assertCategoryBelongsToShop(shopId, rule.targetCategoryId);
      }
      if (rule.targetCustomerGroupId) {
        await this.assertCustomerGroupBelongsToShop(
          shopId,
          rule.targetCustomerGroupId,
        );
      }
    }
  }

  private async assertProductBelongsToShop(shopId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, shopId, deletedAt: null },
      select: { id: true },
    });
    if (!product) throw new BadRequestException("Product must belong to shop.");
  }

  private async assertCategoryBelongsToShop(
    shopId: string,
    categoryId: string,
  ) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, shopId, deletedAt: null },
      select: { id: true },
    });
    if (!category)
      throw new BadRequestException("Category must belong to shop.");
  }

  private async assertCustomerGroupBelongsToShop(
    shopId: string,
    groupId: string,
  ) {
    const group = await this.prisma.customerGroup.findFirst({
      where: { id: groupId, shopId, deletedAt: null },
      select: { id: true },
    });
    if (!group) {
      throw new BadRequestException("Customer group must belong to shop.");
    }
  }

  private async assertValidDateWindow(startsAt?: Date, endsAt?: Date) {
    if (startsAt && endsAt && startsAt > endsAt) {
      throw new BadRequestException(
        "Promotion start date must be before end date.",
      );
    }
  }

  private toRuleCreateInput(rule: PromotionRuleDto) {
    return {
      minimumOrderAmount: rule.minimumOrderAmount ?? null,
      minimumQuantity: rule.minimumQuantity ?? null,
      discountPercent: rule.discountPercent ?? null,
      discountAmount: rule.discountAmount ?? null,
      buyQuantity: rule.buyQuantity ?? null,
      getQuantity: rule.getQuantity ?? null,
      targetProductId: rule.targetProductId ?? null,
      targetCategoryId: rule.targetCategoryId ?? null,
      targetCustomerGroupId: rule.targetCustomerGroupId ?? null,
    };
  }

  private toRuleUncheckedInput(rule: PromotionRuleDto) {
    return this.toRuleCreateInput(rule);
  }

  private serializeCandidate(candidate: DiscountCandidate) {
    return {
      source: candidate.source,
      discountAmount: candidate.discountAmount,
      campaign: candidate.campaign
        ? this.serializeCampaign(candidate.campaign)
        : null,
      voucher: candidate.voucher
        ? this.serializeVoucher(candidate.voucher)
        : null,
      pricingTier: candidate.pricingTier ?? null,
    };
  }

  private serializeCampaign(campaign: CampaignWithRules) {
    return {
      id: campaign.id,
      name: campaign.name,
      promotionType: campaign.promotionType,
      priority: campaign.priority,
    };
  }

  private serializeVoucher(voucher: VoucherWithCampaign) {
    return {
      id: voucher.id,
      code: voucher.code,
      campaignId: voucher.campaignId,
    };
  }
}
