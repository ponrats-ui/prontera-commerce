import { MerchantDiscoveryEventType } from "@prisma/client";
import { DiscoveryService } from "./discovery.service";

const merchants = [
  {
    id: "shop-founder",
    name: "Founder Coffee",
    slug: "founder-coffee",
    category: "FOOD",
    liveNow: true,
    featured: true,
    isFounderMerchant: true,
    isOfficialStore: false,
    rankingScore: 1650,
  },
  {
    id: "shop-official",
    name: "Official Tech",
    slug: "official-tech",
    category: "TECH",
    liveNow: false,
    featured: false,
    isFounderMerchant: false,
    isOfficialStore: true,
    rankingScore: 80,
  },
  {
    id: "shop-maker",
    name: "Maker Studio",
    slug: "maker-studio",
    category: "FOOD",
    liveNow: false,
    featured: false,
    isFounderMerchant: false,
    isOfficialStore: false,
    rankingScore: 0,
  },
];

function createService() {
  const prisma = {
    merchantDiscoveryEvent: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue({ id: "event-1" }),
    },
  };
  const worldDiscoveryService = {
    listShops: jest.fn().mockResolvedValue(merchants),
    listFounders: jest
      .fn()
      .mockResolvedValue(
        merchants.filter((merchant) => merchant.isFounderMerchant),
      ),
  };

  return {
    prisma,
    worldDiscoveryService,
    service: new DiscoveryService(
      prisma as never,
      worldDiscoveryService as never,
    ),
  };
}

describe("DiscoveryService", () => {
  it("lists merchant discovery categories with live counts", async () => {
    const { service } = createService();

    const categories = await service.categories();

    expect(categories).toEqual([
      { category: "FOOD", merchantCount: 2, liveCount: 1 },
      { category: "TECH", merchantCount: 1, liveCount: 0 },
    ]);
  });

  it("filters official and featured merchants", async () => {
    const { service } = createService();

    await expect(service.listOfficial()).resolves.toEqual([
      expect.objectContaining({ slug: "official-tech" }),
    ]);
    await expect(service.listFeatured()).resolves.toEqual([
      expect.objectContaining({ slug: "founder-coffee" }),
    ]);
  });

  it("returns discovery metrics from merchant signals and events", async () => {
    const { prisma, service } = createService();
    prisma.merchantDiscoveryEvent.count
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3);

    const metrics = await service.metrics();

    expect(metrics).toEqual(
      expect.objectContaining({
        totalMerchants: 3,
        founderMerchants: 1,
        officialStores: 1,
        featuredMerchants: 1,
        liveMerchants: 1,
        categoryCount: 2,
        discoveryViews: 12,
        searches: 5,
        merchantClicks: 3,
      }),
    );
  });

  it("tracks merchant discovery events", async () => {
    const { prisma, service } = createService();

    await service.track({
      eventType: MerchantDiscoveryEventType.MERCHANT_SEARCH,
      searchTerm: "coffee",
      source: "discover-home",
    });

    expect(prisma.merchantDiscoveryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventType: MerchantDiscoveryEventType.MERCHANT_SEARCH,
        searchTerm: "coffee",
        source: "discover-home",
      }),
    });
  });
});
