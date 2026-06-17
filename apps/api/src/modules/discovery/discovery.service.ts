import { Injectable } from "@nestjs/common";
import { MerchantDiscoveryEventType, Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { WorldDiscoveryService } from "../world/world-discovery.service";
import type {
  DiscoveryQueryDto,
  TrackDiscoveryEventDto,
} from "./dto/discovery.dto";

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly worldDiscoveryService: WorldDiscoveryService,
  ) {}

  async overview(query: DiscoveryQueryDto = {}) {
    const [merchants, categories, metrics] = await Promise.all([
      this.listMerchants(query),
      this.categories(query),
      this.metrics(),
    ]);

    return {
      merchants,
      categories,
      metrics,
      ranking: this.rankingFoundation(),
    };
  }

  listMerchants(query: DiscoveryQueryDto = {}) {
    return this.worldDiscoveryService.listShops(query);
  }

  listFounders(query: DiscoveryQueryDto = {}) {
    return this.worldDiscoveryService.listFounders(query);
  }

  async listOfficial(query: DiscoveryQueryDto = {}) {
    const merchants = await this.listMerchants(query);
    return merchants.filter((merchant) => merchant.isOfficialStore);
  }

  async listFeatured(query: DiscoveryQueryDto = {}) {
    const merchants = await this.listMerchants(query);
    return merchants.filter((merchant) => merchant.featured);
  }

  async categories(query: DiscoveryQueryDto = {}) {
    const merchants = await this.listMerchants(query);
    const categories = new Map<
      string,
      { category: string; merchantCount: number; liveCount: number }
    >();

    for (const merchant of merchants) {
      const current = categories.get(merchant.category) ?? {
        category: merchant.category,
        merchantCount: 0,
        liveCount: 0,
      };
      current.merchantCount += 1;
      if (merchant.liveNow) current.liveCount += 1;
      categories.set(merchant.category, current);
    }

    return Array.from(categories.values()).sort(
      (left, right) =>
        right.merchantCount - left.merchantCount ||
        left.category.localeCompare(right.category),
    );
  }

  async metrics() {
    const [merchants, discoveryViews, searches, clicks] = await Promise.all([
      this.listMerchants(),
      this.prisma.merchantDiscoveryEvent.count({
        where: { eventType: MerchantDiscoveryEventType.DISCOVERY_VIEW },
      }),
      this.prisma.merchantDiscoveryEvent.count({
        where: { eventType: MerchantDiscoveryEventType.MERCHANT_SEARCH },
      }),
      this.prisma.merchantDiscoveryEvent.count({
        where: { eventType: MerchantDiscoveryEventType.MERCHANT_CLICK },
      }),
    ]);

    return {
      totalMerchants: merchants.length,
      founderMerchants: merchants.filter(
        (merchant) => merchant.isFounderMerchant,
      ).length,
      officialStores: merchants.filter((merchant) => merchant.isOfficialStore)
        .length,
      featuredMerchants: merchants.filter((merchant) => merchant.featured)
        .length,
      liveMerchants: merchants.filter((merchant) => merchant.liveNow).length,
      categoryCount: new Set(merchants.map((merchant) => merchant.category))
        .size,
      discoveryViews,
      searches,
      merchantClicks: clicks,
    };
  }

  track(dto: TrackDiscoveryEventDto) {
    return this.prisma.merchantDiscoveryEvent.create({
      data: {
        eventType: dto.eventType,
        shopId: dto.shopId ?? null,
        searchTerm: dto.searchTerm ?? null,
        category: dto.category ?? null,
        source: dto.source ?? null,
        ...(dto.metadata
          ? { metadata: dto.metadata as Prisma.InputJsonObject }
          : {}),
      },
    });
  }

  private rankingFoundation() {
    return {
      strategy: "MERCHANT_SIGNAL_SCORE",
      signals: [
        { signal: "Live Commerce", points: 1000 },
        { signal: "Founder Merchant", points: 500 },
        { signal: "Founder Placement", points: 250 },
        { signal: "Featured Merchant", points: 150 },
        { signal: "Active Promotion", points: 75 },
        { signal: "Enterprise Subscription", points: 80 },
        { signal: "Pro Subscription", points: 50 },
      ],
    };
  }
}
