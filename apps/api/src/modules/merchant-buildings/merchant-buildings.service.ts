import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  BuildingType,
  LiveChannelStatus,
  Prisma,
  ProductStatus,
  PromotionStatus,
  ShopStatus,
  StorefrontTheme,
} from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import { ShopPermissionsService } from "../shops/shop-permissions.service";
import type {
  AdminBuildingUpdateDto,
  BuildingSettingsDto,
} from "./dto/merchant-building.dto";

const buildingInclude = {
  district: true,
  shop: {
    include: {
      founderMerchantProgram: true,
      liveChannels: {
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
      promotionCampaigns: {
        where: { status: PromotionStatus.ACTIVE, deletedAt: null },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 1,
      },
      products: {
        where: { status: ProductStatus.ACTIVE, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 4,
      },
    },
  },
} satisfies Prisma.MerchantBuildingInclude;

type BuildingWithSignals = Prisma.MerchantBuildingGetPayload<{
  include: typeof buildingInclude;
}>;

@Injectable()
export class MerchantBuildingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shopPermissions: ShopPermissionsService,
  ) {}

  async listPublished() {
    const buildings = await this.prisma.merchantBuilding.findMany({
      where: {
        isPublished: true,
        shop: { status: ShopStatus.ACTIVE, deletedAt: null },
      },
      include: buildingInclude,
      orderBy: [
        { isLive: "desc" },
        { isFounder: "desc" },
        { updatedAt: "desc" },
      ],
    });

    return buildings.map((building) => this.serialize(building));
  }

  async adminList() {
    const buildings = await this.prisma.merchantBuilding.findMany({
      include: buildingInclude,
      orderBy: [{ updatedAt: "desc" }],
    });

    return buildings.map((building) => this.serialize(building));
  }

  async metrics() {
    const [publishedBuildings, founderBuildings, officialStores, liveStores] =
      await Promise.all([
        this.prisma.merchantBuilding.count({ where: { isPublished: true } }),
        this.prisma.merchantBuilding.count({ where: { isFounder: true } }),
        this.prisma.merchantBuilding.count({
          where: { isOfficialStore: true },
        }),
        this.prisma.merchantBuilding.count({ where: { isLive: true } }),
      ]);

    return {
      publishedBuildings,
      founderBuildings,
      officialStores,
      liveStores,
      futureHooks: [
        "Rooftop Billboard",
        "District Sponsorship",
        "Advertising Zones",
        "Seasonal Decorations",
      ],
    };
  }

  async getMerchantProfile(id: string) {
    const building = await this.prisma.merchantBuilding.findFirst({
      where: {
        isPublished: true,
        shop: {
          status: ShopStatus.ACTIVE,
          deletedAt: null,
          OR: [{ id }, { slug: id }],
        },
      },
      include: buildingInclude,
    });

    if (!building) throw new NotFoundException("Merchant building not found.");
    return this.serialize(building);
  }

  async getMyBuilding(user: AuthenticatedUser, shopId?: string) {
    const shop = await this.resolveShop(user, shopId);
    const building = await this.prisma.merchantBuilding.findFirst({
      where: { shopId: shop.id },
      include: buildingInclude,
    });

    if (!building) throw new NotFoundException("Merchant building not found.");
    return this.serialize(building);
  }

  async updateMyBuilding(user: AuthenticatedUser, dto: BuildingSettingsDto) {
    if (!dto.shopId) {
      throw new BadRequestException("shopId is required.");
    }

    await this.assertCanManage(user.id, dto.shopId);
    const building = await this.prisma.merchantBuilding.findFirst({
      where: { shopId: dto.shopId },
      select: { id: true },
    });

    if (!building) throw new NotFoundException("Merchant building not found.");

    const updated = await this.prisma.merchantBuilding.update({
      where: { id: building.id },
      data: this.buildSettingsData(dto),
      include: buildingInclude,
    });

    if (dto.logoUrl || dto.bannerUrl) {
      await this.prisma.shop.update({
        where: { id: dto.shopId },
        data: {
          ...(dto.logoUrl ? { logoUrl: dto.logoUrl } : {}),
          ...(dto.bannerUrl ? { bannerUrl: dto.bannerUrl } : {}),
        },
      });
    }

    return this.serialize(updated);
  }

  async adminUpdate(id: string, dto: AdminBuildingUpdateDto) {
    const building = await this.prisma.merchantBuilding.findFirst({
      where: { id },
      select: { id: true, shopId: true },
    });

    if (!building) throw new NotFoundException("Merchant building not found.");

    const updated = await this.prisma.merchantBuilding.update({
      where: { id },
      data: {
        ...this.buildSettingsData(dto),
        ...(dto.buildingType ? { buildingType: dto.buildingType } : {}),
        ...(dto.buildingLevel ? { buildingLevel: dto.buildingLevel } : {}),
        ...(typeof dto.isOfficialStore === "boolean"
          ? {
              isOfficialStore: dto.isOfficialStore,
              buildingType: dto.isOfficialStore
                ? BuildingType.OFFICIAL
                : dto.buildingType,
            }
          : {}),
        ...(typeof dto.isPublished === "boolean"
          ? { isPublished: dto.isPublished }
          : {}),
      },
      include: buildingInclude,
    });

    return this.serialize(updated);
  }

  private buildSettingsData(dto: BuildingSettingsDto | AdminBuildingUpdateDto) {
    return {
      ...(dto.storefrontTheme ? { storefrontTheme: dto.storefrontTheme } : {}),
      ...(dto.logoUrl ? { logoUrl: dto.logoUrl } : {}),
      ...(dto.signText ? { signText: dto.signText } : {}),
      ...(dto.bannerUrl ? { bannerUrl: dto.bannerUrl } : {}),
    } satisfies Prisma.MerchantBuildingUpdateInput;
  }

  private async resolveShop(user: AuthenticatedUser, shopId?: string) {
    const shop = shopId
      ? await this.prisma.shop.findFirst({
          where: { id: shopId, deletedAt: null },
          select: { id: true },
        })
      : await this.prisma.shop.findFirst({
          where: {
            deletedAt: null,
            OR: [
              { ownerId: user.id },
              {
                staff: {
                  some: { userId: user.id, status: "ACTIVE", deletedAt: null },
                },
              },
            ],
          },
          select: { id: true },
          orderBy: { createdAt: "desc" },
        });

    if (!shop) throw new NotFoundException("Shop not found.");
    await this.assertCanManage(user.id, shop.id);
    return shop;
  }

  private async assertCanManage(userId: string, shopId: string) {
    if (!(await this.shopPermissions.canManageShop(userId, shopId))) {
      throw new ForbiddenException("You cannot manage this building.");
    }
  }

  private serialize(building: BuildingWithSignals) {
    const now = new Date();
    const liveChannel = building.shop.liveChannels.find(
      (channel) => channel.status === LiveChannelStatus.LIVE,
    );
    const founderProgram = building.shop.founderMerchantProgram;
    const isFounder =
      building.isFounder ||
      Boolean(
        founderProgram?.isFounderMerchant &&
        (!founderProgram.founderExpiresAt ||
          founderProgram.founderExpiresAt >= now),
      );
    const promotion = building.shop.promotionCampaigns.find(
      (campaign) =>
        (campaign.startsAt == null || campaign.startsAt <= now) &&
        (campaign.endsAt == null || campaign.endsAt >= now),
    );

    return {
      id: building.id,
      shopId: building.shopId,
      districtId: building.districtId,
      shopName: building.shop.name,
      shopSlug: building.shop.slug,
      description: building.shop.description,
      buildingType: building.isOfficialStore
        ? BuildingType.OFFICIAL
        : building.buildingType,
      storefrontTheme: building.storefrontTheme,
      buildingLevel: building.buildingLevel,
      logoUrl: building.logoUrl ?? building.shop.logoUrl,
      signText: building.signText ?? building.shop.name,
      bannerUrl: building.bannerUrl ?? building.shop.bannerUrl,
      isFounder,
      isOfficialStore: building.isOfficialStore,
      isLive: Boolean(liveChannel) || building.isLive,
      liveLabel: liveChannel ? "LIVE" : null,
      founderBadge: isFounder ? "Founder Merchant" : null,
      officialStoreBadge: building.isOfficialStore ? "Official Store" : null,
      promotionBanner: promotion?.name ?? null,
      district: building.district,
      xCoordinate: building.xCoordinate,
      yCoordinate: building.yCoordinate,
      isPublished: building.isPublished,
      featuredProducts: building.shop.products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
      })),
      visualHooks: {
        founderDecoration: isFounder,
        founderHighlightFrame: isFounder,
        rooftopBillboard: null,
        districtSponsorship: null,
        advertisingZone: null,
        seasonalDecoration: null,
      },
      createdAt: building.createdAt,
      updatedAt: building.updatedAt,
    };
  }
}
