import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  BuildingType,
  MerchantBuildingStyle,
  PlanStatus,
  Prisma,
  ShopStaffRole,
  StaffStatus,
  StorefrontTheme,
  SubscriptionPlanType,
  SubscriptionStatus,
  WorldEntityStatus,
  WorldZoneStatus,
} from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import {
  subscriptionPlanDefinitions,
  trialDurationDays,
} from "../subscriptions/subscription-plan-definitions";
import type {
  PublishMerchantOnboardingDto,
  StartMerchantOnboardingDto,
} from "./dto/merchant-onboarding.dto";

const onboardingDistricts = [
  {
    slug: "tech-bazaar",
    code: "TECH_BAZAAR",
    name: "Tech Bazaar",
    category: "TECH",
    description:
      "Technology merchants, digital service providers, gadgets, and AI-assisted commerce tools.",
    x: 68,
    y: 42,
    theme: StorefrontTheme.TECH,
    buildingType: BuildingType.MEDIUM,
    buildingStyle: MerchantBuildingStyle.TECH_STORE,
  },
  {
    slug: "artisan-valley",
    code: "ARTISAN_VALLEY",
    name: "Artisan Valley",
    category: "ARTISAN",
    description:
      "Handcrafted products, makers, boutique shops, and story-rich merchant identities.",
    x: 34,
    y: 58,
    theme: StorefrontTheme.ARTISAN,
    buildingType: BuildingType.SMALL,
    buildingStyle: MerchantBuildingStyle.CLASSIC_SHOP,
  },
  {
    slug: "harbor-district",
    code: "HARBOR_DISTRICT",
    name: "Harbor District",
    category: "HARBOR",
    description:
      "Trade route merchants, regional goods, imports, exports, and logistics-adjacent commerce.",
    x: 22,
    y: 76,
    theme: StorefrontTheme.HARBOR,
    buildingType: BuildingType.SMALL,
    buildingStyle: MerchantBuildingStyle.MARKET_STALL,
  },
  {
    slug: "wholesale-quarter",
    code: "WHOLESALE_QUARTER",
    name: "Wholesale Quarter",
    category: "WHOLESALE",
    description:
      "Bulk orders, distributor catalogs, procurement, and B2B merchant trade.",
    x: 74,
    y: 72,
    theme: StorefrontTheme.WHOLESALE,
    buildingType: BuildingType.LARGE,
    buildingStyle: MerchantBuildingStyle.PREMIUM_HALL,
  },
] as const;

const shopInclude = {
  owner: { select: { id: true, email: true, name: true } },
  staff: {
    where: { deletedAt: null },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.ShopInclude;

@Injectable()
export class MerchantOnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async start(user: AuthenticatedUser, dto: StartMerchantOnboardingDto) {
    if (dto.merchantName) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { name: dto.merchantName },
      });
    }

    return this.status(user);
  }

  async status(user: AuthenticatedUser) {
    const latestShop = await this.prisma.shop.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { ownerId: user.id },
          {
            staff: {
              some: {
                userId: user.id,
                status: StaffStatus.ACTIVE,
                deletedAt: null,
              },
            },
          },
        ],
      },
      include: {
        merchantBuildings: true,
        worldLocations: {
          include: { city: true, district: true },
        },
        founderMerchantProgram: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      active: !latestShop?.merchantBuildings.some(
        (building) => building.isPublished,
      ),
      shop: latestShop,
      districts: onboardingDistricts,
      founderProgram: this.founderProgramSummary(),
    };
  }

  async publish(user: AuthenticatedUser, dto: PublishMerchantOnboardingDto) {
    const selectedDistrict = onboardingDistricts.find(
      (district) => district.slug === dto.districtSlug,
    );
    if (!selectedDistrict) {
      throw new NotFoundException("Onboarding district not found.");
    }

    const slug = await this.createUniqueShopSlug(dto.shopName);
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const world = await this.ensureOnboardingWorld(tx);
      const district = world.districts.get(selectedDistrict.code);
      if (!district) throw new NotFoundException("World district not found.");

      const coordinates = await this.nextCoordinates(
        tx,
        district.id,
        selectedDistrict,
      );
      const proPlan = await this.ensureSubscriptionPlans(tx);

      const shop = await tx.shop.create({
        data: {
          owner: { connect: { id: user.id } },
          name: dto.shopName,
          slug,
          description: `${dto.category} merchant onboarded into ${selectedDistrict.name}.`,
          logoUrl: dto.logoUrl ?? null,
          bannerUrl: dto.bannerUrl ?? null,
          status: "ACTIVE",
          isPublic: true,
          country: { connect: { code: "US" } },
          locale: { connect: { code: "en-US" } },
          currency: { connect: { code: "USD" } },
          preferredLocaleRef: { connect: { code: "en-US" } },
          preferredCurrencyRef: { connect: { code: "USD" } },
          timeZone: "UTC",
          staff: {
            create: {
              user: { connect: { id: user.id } },
              role: ShopStaffRole.OWNER,
              status: StaffStatus.ACTIVE,
              title: "Owner",
            },
          },
        },
        include: shopInclude,
      });

      await tx.user.update({
        where: { id: user.id },
        data: { name: dto.merchantName },
      });

      await tx.merchantSubscription.create({
        data: {
          shopId: shop.id,
          planId: proPlan.id,
          status: SubscriptionStatus.TRIAL,
          trialStartAt: now,
          trialEndAt: this.addDays(now, trialDurationDays),
          currentPeriodStart: now,
          currentPeriodEnd: this.addDays(now, trialDurationDays),
        },
      });

      const founderProgram = await tx.founderMerchantProgram.create({
        data: {
          shopId: shop.id,
          isFounderMerchant: true,
          founderGrantedAt: now,
          benefits: {
            freeProTrialDays: 30,
            founderBadge: true,
            earlyMerchantRecognition: true,
          },
        },
      });

      const building = await tx.merchantBuilding.create({
        data: {
          shopId: shop.id,
          districtId: district.id,
          buildingType: selectedDistrict.buildingType,
          storefrontTheme: selectedDistrict.theme,
          buildingLevel: 1,
          logoUrl: shop.logoUrl,
          signText: shop.name,
          bannerUrl: shop.bannerUrl,
          isFounder: true,
          isOfficialStore: false,
          isLive: false,
          xCoordinate: coordinates.x,
          yCoordinate: coordinates.y,
          isPublished: true,
        },
      });

      const worldLocation = await tx.merchantWorldLocation.create({
        data: {
          shopId: shop.id,
          cityId: world.city.id,
          districtId: district.id,
          buildingStyle: selectedDistrict.buildingStyle,
          storefrontTheme: selectedDistrict.theme,
          featured: false,
          founderPlacement: true,
        },
        include: {
          city: true,
          district: true,
        },
      });

      return {
        message: "Welcome to Prontera.",
        shop,
        building,
        worldLocation,
        founderProgram,
        links: {
          shop: `/world/shops/${shop.slug}`,
          world: "/world",
          travel: "/world/travel",
        },
      };
    });
  }

  private async createUniqueShopSlug(name: string) {
    const base = toSlug(name);
    for (let index = 0; index < 20; index += 1) {
      const candidate = index === 0 ? base : `${base}-${index + 1}`;
      const existing = await this.prisma.shop.findFirst({
        where: { slug: candidate, deletedAt: null },
        select: { id: true },
      });
      if (!existing) return candidate;
    }

    throw new ConflictException("Unable to create a unique shop slug.");
  }

  private async ensureOnboardingWorld(tx: Prisma.TransactionClient) {
    const zone = await tx.worldZone.upsert({
      where: { code: "MERCHANT_WORLD" },
      create: {
        code: "MERCHANT_WORLD",
        name: "Merchant World",
        description: "Core onboarding zone for new merchant storefronts.",
        status: WorldZoneStatus.ACTIVE,
        sortOrder: 1,
      },
      update: {
        name: "Merchant World",
        status: WorldZoneStatus.ACTIVE,
      },
    });

    const region = await tx.worldRegion.upsert({
      where: { slug: "central-trade-region" },
      create: {
        name: "Central Trade Region",
        slug: "central-trade-region",
        description:
          "The first commerce region for visible merchant discovery.",
        status: WorldEntityStatus.ACTIVE,
        displayOrder: 1,
      },
      update: {
        name: "Central Trade Region",
        status: WorldEntityStatus.ACTIVE,
      },
    });

    const city = await tx.worldCity.upsert({
      where: { slug: "merchant-city" },
      create: {
        regionId: region.id,
        name: "Merchant City",
        slug: "merchant-city",
        description:
          "A central market city for everyday shops and business discovery.",
        status: WorldEntityStatus.ACTIVE,
      },
      update: {
        regionId: region.id,
        name: "Merchant City",
        status: WorldEntityStatus.ACTIVE,
      },
    });

    const districts = new Map<string, { id: string }>();
    for (const [index, district] of onboardingDistricts.entries()) {
      const record = await tx.worldDistrict.upsert({
        where: { zoneId_code: { zoneId: zone.id, code: district.code } },
        create: {
          zoneId: zone.id,
          code: district.code,
          name: district.name,
          description: district.description,
          category: district.category,
          sortOrder: index + 1,
        },
        update: {
          name: district.name,
          description: district.description,
          category: district.category,
          sortOrder: index + 1,
        },
      });

      await tx.worldDistrictLocation.upsert({
        where: {
          districtId_cityId: { districtId: record.id, cityId: city.id },
        },
        create: {
          districtId: record.id,
          cityId: city.id,
          coordinateX: district.x,
          coordinateY: district.y,
          displayOrder: index + 1,
        },
        update: {
          coordinateX: district.x,
          coordinateY: district.y,
          displayOrder: index + 1,
        },
      });

      districts.set(district.code, record);
    }

    return { zone, region, city, districts };
  }

  private async ensureSubscriptionPlans(tx: Prisma.TransactionClient) {
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
    return proPlan;
  }

  private async nextCoordinates(
    tx: Prisma.TransactionClient,
    districtId: string,
    district: (typeof onboardingDistricts)[number],
  ) {
    const count = await tx.merchantBuilding.count({ where: { districtId } });
    const offset = count * 4;

    return {
      x: Math.min(96, district.x + offset),
      y: Math.min(96, district.y + offset),
    };
  }

  private founderProgramSummary() {
    return {
      title: "Founder Merchant Program",
      benefits: [
        "1 month free Pro",
        "Founder Badge",
        "Early Merchant Recognition",
      ],
    };
  }

  private addDays(date: Date, days: number) {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }
}

function toSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "merchant-shop";
}
