import { Injectable, NotFoundException } from "@nestjs/common";
import {
  LiveChannelStatus,
  MerchantBuildingStyle,
  Prisma,
  ProductStatus,
  PromotionStatus,
  ShopStatus,
  StorefrontTheme,
  SubscriptionPlanType,
  SubscriptionStatus,
  WorldEntityStatus,
} from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import type {
  CreateMerchantWorldLocationDto,
  CreateWorldCityDto,
  CreateWorldDistrictLocationDto,
  CreateWorldRegionDto,
  WorldSearchQueryDto,
} from "./dto/world.dto";

const shopDiscoveryInclude = {
  shop: {
    include: {
      products: {
        where: { status: ProductStatus.ACTIVE, deletedAt: null },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: {
            where: { deletedAt: null },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
          images: {
            where: { deletedAt: null },
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      liveChannels: {
        where: { deletedAt: null },
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
      promotionCampaigns: {
        where: {
          status: PromotionStatus.ACTIVE,
          deletedAt: null,
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 2,
      },
      merchantSubscriptions: {
        include: { plan: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      founderMerchantProgram: true,
      merchantBuildings: {
        include: { district: true },
        take: 1,
      },
    },
  },
  city: { include: { region: true } },
  district: true,
} satisfies Prisma.MerchantWorldLocationInclude;

const discoverableSubscriptionStatuses = new Set<SubscriptionStatus>([
  SubscriptionStatus.TRIAL,
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.GRACE_PERIOD,
]);

type MerchantLocationWithSignals = Prisma.MerchantWorldLocationGetPayload<{
  include: typeof shopDiscoveryInclude;
}>;

@Injectable()
export class WorldDiscoveryService {
  constructor(private readonly prisma: PrismaService) {}

  createRegion(dto: CreateWorldRegionDto) {
    return this.prisma.worldRegion.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description ?? null,
        status: dto.status ?? WorldEntityStatus.ACTIVE,
        displayOrder: dto.displayOrder ?? 0,
      },
    });
  }

  createCity(dto: CreateWorldCityDto) {
    return this.prisma.worldCity.create({
      data: {
        regionId: dto.regionId,
        name: dto.name,
        slug: dto.slug,
        description: dto.description ?? null,
        mapImageUrl: dto.mapImageUrl ?? null,
        status: dto.status ?? WorldEntityStatus.ACTIVE,
      },
      include: { region: true },
    });
  }

  createDistrictLocation(dto: CreateWorldDistrictLocationDto) {
    return this.prisma.worldDistrictLocation.create({
      data: {
        districtId: dto.districtId,
        cityId: dto.cityId,
        coordinateX: dto.coordinateX,
        coordinateY: dto.coordinateY,
        displayOrder: dto.displayOrder ?? 0,
      },
      include: { city: true, district: true },
    });
  }

  createMerchantLocation(dto: CreateMerchantWorldLocationDto) {
    return this.prisma.merchantWorldLocation.create({
      data: {
        shopId: dto.shopId,
        cityId: dto.cityId,
        districtId: dto.districtId,
        buildingStyle: dto.buildingStyle ?? MerchantBuildingStyle.CLASSIC_SHOP,
        storefrontTheme: dto.storefrontTheme ?? StorefrontTheme.WARM_MARKET,
      },
      include: shopDiscoveryInclude,
    });
  }

  listRegions() {
    return this.prisma.worldRegion.findMany({
      where: { status: WorldEntityStatus.ACTIVE },
      include: {
        cities: {
          where: { status: WorldEntityStatus.ACTIVE },
          orderBy: { name: "asc" },
        },
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
  }

  listCities() {
    return this.prisma.worldCity.findMany({
      where: { status: WorldEntityStatus.ACTIVE },
      include: {
        region: true,
        districtLocations: {
          include: { district: true },
          orderBy: [{ displayOrder: "asc" }],
        },
      },
      orderBy: [{ region: { displayOrder: "asc" } }, { name: "asc" }],
    });
  }

  async getCityBySlug(slug: string) {
    const city = await this.prisma.worldCity.findFirst({
      where: { slug, status: WorldEntityStatus.ACTIVE },
      include: {
        region: true,
        districtLocations: {
          include: { district: true },
          orderBy: [{ displayOrder: "asc" }],
        },
      },
    });

    if (!city) throw new NotFoundException("World city not found.");

    const shops = await this.listShops({ citySlug: slug });
    return { ...city, shops };
  }

  listDistricts() {
    return this.prisma.worldDistrict.findMany({
      include: {
        cityLocations: {
          include: { city: { include: { region: true } } },
          orderBy: [{ displayOrder: "asc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  async getDistrictBySlug(slug: string) {
    const districts = await this.listDistricts();
    const district = districts.find(
      (item) => toSlug(item.code) === slug || toSlug(item.name) === slug,
    );

    if (!district) throw new NotFoundException("World district not found.");

    const shops = await this.listShops({ districtSlug: slug });
    return { ...district, slug: toSlug(district.code), shops };
  }

  async listShops(query: WorldSearchQueryDto = {}) {
    const now = new Date();
    const locations = await this.prisma.merchantWorldLocation.findMany({
      where: this.buildShopWhere(query),
      include: shopDiscoveryInclude,
    });

    return locations
      .map((location) => this.serializeShop(location, now))
      .filter((shop) => {
        if (query.districtSlug && shop.district.slug !== query.districtSlug) {
          return false;
        }
        if (asBoolean(query.liveNow) && !shop.liveNow) return false;
        if (asBoolean(query.founders) && !shop.isFounderMerchant) return false;
        if (asBoolean(query.featured) && !shop.featured) return false;
        return true;
      })
      .sort((left, right) => right.rankingScore - left.rankingScore);
  }

  listLive(query: WorldSearchQueryDto = {}) {
    return this.listShops({ ...query, liveNow: "true" });
  }

  listFounders(query: WorldSearchQueryDto = {}) {
    return this.listShops({ ...query, founders: "true" });
  }

  async getShopBySlug(slug: string) {
    const shops = await this.listShops({ search: slug });
    const shop = shops.find((item) => item.slug === slug);
    if (!shop) throw new NotFoundException("World storefront not found.");
    return shop;
  }

  async getMap(query: WorldSearchQueryDto = {}) {
    const [regions, cities, districts, shops] = await Promise.all([
      this.listRegions(),
      this.listCities(),
      this.listDistricts(),
      this.listShops(query),
    ]);

    return {
      regions,
      cities,
      districts: districts.map((district) => ({
        ...district,
        slug: toSlug(district.code),
      })),
      shops,
      totals: {
        regions: regions.length,
        cities: cities.length,
        districts: districts.length,
        shops: shops.length,
        live: shops.filter((shop) => shop.liveNow).length,
        founders: shops.filter((shop) => shop.isFounderMerchant).length,
      },
    };
  }

  private buildShopWhere(query: WorldSearchQueryDto) {
    const search = query.search?.trim();

    return {
      shop: {
        status: ShopStatus.ACTIVE,
        isPublic: true,
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { slug: { equals: search, mode: "insensitive" as const } },
                { name: { contains: search, mode: "insensitive" as const } },
                {
                  description: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              ],
            }
          : {}),
      },
      ...(query.citySlug ? { city: { slug: query.citySlug } } : {}),
      ...(query.category
        ? {
            OR: [
              { district: { category: query.category } },
              {
                shop: {
                  products: {
                    some: {
                      status: ProductStatus.ACTIVE,
                      deletedAt: null,
                      category: { slug: query.category },
                    },
                  },
                },
              },
            ],
          }
        : {}),
    } satisfies Prisma.MerchantWorldLocationWhereInput;
  }

  private serializeShop(location: MerchantLocationWithSignals, now: Date) {
    const shop = location.shop;
    const liveChannel = shop.liveChannels.find(
      (channel) => channel.status === LiveChannelStatus.LIVE,
    );
    const founderProgram = shop.founderMerchantProgram;
    const isFounderMerchant =
      founderProgram?.isFounderMerchant === true &&
      (!founderProgram.founderExpiresAt ||
        founderProgram.founderExpiresAt >= now);
    const activePromotion = shop.promotionCampaigns.find(
      (campaign) =>
        (campaign.startsAt == null || campaign.startsAt <= now) &&
        (campaign.endsAt == null || campaign.endsAt >= now),
    );
    const subscription = shop.merchantSubscriptions.find((item) =>
      discoverableSubscriptionStatuses.has(item.status),
    );
    const subscriptionTier =
      subscription?.plan.planType ?? SubscriptionPlanType.STARTER;
    const featuredProducts = shop.products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category.name,
      priceCents: product.variants[0]?.priceCents ?? null,
      imageUrl: product.images[0]?.imageUrl ?? null,
    }));
    const building = shop.merchantBuildings?.[0] ?? null;
    const rankingScore = this.calculateRankingScore({
      liveNow: Boolean(liveChannel),
      isFounderMerchant,
      featured: location.featured,
      founderPlacement: location.founderPlacement,
      hasPromotion: Boolean(activePromotion),
      subscriptionTier,
    });

    return {
      id: shop.id,
      ownerId: shop.ownerId,
      name: shop.name,
      slug: shop.slug,
      description: shop.description,
      category: location.district.category,
      city: {
        id: location.city.id,
        name: location.city.name,
        slug: location.city.slug,
        region: location.city.region.name,
      },
      district: {
        id: location.district.id,
        name: location.district.name,
        slug: toSlug(location.district.code),
        category: location.district.category,
      },
      buildingStyle: location.buildingStyle,
      buildingType: building?.buildingType ?? "SMALL",
      buildingLevel: building?.buildingLevel ?? 1,
      storefrontTheme: building?.storefrontTheme ?? location.storefrontTheme,
      signText: building?.signText ?? shop.name,
      logoUrl: building?.logoUrl ?? shop.logoUrl,
      bannerUrl: building?.bannerUrl ?? shop.bannerUrl,
      featured: location.featured,
      founderPlacement: location.founderPlacement,
      liveNow: Boolean(liveChannel),
      liveBadge: liveChannel ? "LIVE" : null,
      isFounderMerchant,
      isOfficialStore: building?.isOfficialStore ?? false,
      officialStoreBadge: building?.isOfficialStore ? "Official Store" : null,
      founderBadge: isFounderMerchant ? "Founder Merchant" : null,
      promotionBadge: activePromotion
        ? this.promotionBadge(activePromotion.promotionType)
        : null,
      promotionBanner: activePromotion?.name ?? null,
      campaignBadge: activePromotion?.name ?? null,
      subscriptionTier,
      featuredProducts,
      rankingScore,
    };
  }

  private calculateRankingScore(input: {
    liveNow: boolean;
    isFounderMerchant: boolean;
    featured: boolean;
    founderPlacement: boolean;
    hasPromotion: boolean;
    subscriptionTier: SubscriptionPlanType;
  }) {
    let score = 0;
    if (input.liveNow) score += 1000;
    if (input.isFounderMerchant) score += 500;
    if (input.founderPlacement) score += 250;
    if (input.featured) score += 150;
    if (input.hasPromotion) score += 75;
    if (input.subscriptionTier === SubscriptionPlanType.PRO) score += 50;
    if (input.subscriptionTier === SubscriptionPlanType.ENTERPRISE) score += 80;
    return score;
  }

  private promotionBadge(promotionType: string) {
    if (promotionType === "PERCENT_DISCOUNT") return "Discount";
    if (promotionType === "FIXED_DISCOUNT") return "Campaign";
    if (promotionType === "BUY_X_GET_Y") return "Flash Sale";
    return "Voucher";
  }
}

function asBoolean(value?: string) {
  return value === "true" || value === "1";
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
