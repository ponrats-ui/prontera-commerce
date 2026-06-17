import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { MerchantDiscoveryEventType } from "@prisma/client";
import request from "supertest";
import { PrismaService } from "../database/prisma.service";
import { WorldDiscoveryService } from "../world/world-discovery.service";
import { DiscoveryModule } from "./discovery.module";

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
];

function createPrismaMock() {
  return {
    merchantDiscoveryEvent: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue({ id: "event-1" }),
    },
  };
}

describe("DiscoveryController (integration)", () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const moduleRef = await Test.createTestingModule({
      imports: [DiscoveryModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(WorldDiscoveryService)
      .useValue({
        listShops: jest.fn().mockResolvedValue(merchants),
        listFounders: jest
          .fn()
          .mockResolvedValue(
            merchants.filter((merchant) => merchant.isFounderMerchant),
          ),
      })
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

  it("returns merchant discovery overview", async () => {
    const response = await request(app.getHttpServer())
      .get("/discover")
      .expect(200);

    expect(response.body.merchants).toHaveLength(2);
    expect(response.body.categories).toEqual([
      expect.objectContaining({ category: "FOOD" }),
      expect.objectContaining({ category: "TECH" }),
    ]);
    expect(response.body.ranking.strategy).toBe("MERCHANT_SIGNAL_SCORE");
  });

  it("lists founders and official stores", async () => {
    const founders = await request(app.getHttpServer())
      .get("/discover/founders")
      .expect(200);
    const official = await request(app.getHttpServer())
      .get("/discover/official")
      .expect(200);

    expect(founders.body[0].slug).toBe("founder-coffee");
    expect(official.body[0].slug).toBe("official-tech");
  });

  it("tracks discovery events", async () => {
    await request(app.getHttpServer())
      .post("/discover/events")
      .send({
        eventType: MerchantDiscoveryEventType.MERCHANT_SEARCH,
        searchTerm: "coffee",
        source: "discover-home",
      })
      .expect(201);

    expect(prisma.merchantDiscoveryEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventType: MerchantDiscoveryEventType.MERCHANT_SEARCH,
        searchTerm: "coffee",
      }),
    });
  });
});
