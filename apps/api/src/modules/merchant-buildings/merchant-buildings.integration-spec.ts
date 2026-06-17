import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { BuildingType, StorefrontTheme } from "@prisma/client";
import request from "supertest";
import type { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PrismaService } from "../database/prisma.service";
import { ShopPermissionsService } from "../shops/shop-permissions.service";
import { MerchantBuildingsModule } from "./merchant-buildings.module";

const user: AuthenticatedUser = {
  id: "admin-1",
  email: "admin@example.com",
  roles: ["admin"],
  sessionId: "session-1",
};

const building = {
  id: "11111111-1111-4111-8111-111111111111",
  shopId: "22222222-2222-4222-8222-222222222222",
  districtId: "33333333-3333-4333-8333-333333333333",
  buildingType: BuildingType.SMALL,
  storefrontTheme: StorefrontTheme.CLASSIC,
  buildingLevel: 1,
  logoUrl: null,
  signText: "Velora PC",
  bannerUrl: null,
  isFounder: true,
  isOfficialStore: false,
  isLive: false,
  xCoordinate: 12,
  yCoordinate: 20,
  isPublished: true,
  createdAt: new Date("2026-06-17T00:00:00.000Z"),
  updatedAt: new Date("2026-06-17T00:00:00.000Z"),
  district: {
    id: "33333333-3333-4333-8333-333333333333",
    code: "TECH_BAZAAR",
    name: "Tech Bazaar",
    category: "TECH",
  },
  shop: {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Velora PC",
    slug: "velora-pc",
    description: "Computer shop",
    logoUrl: null,
    bannerUrl: null,
    founderMerchantProgram: {
      isFounderMerchant: true,
      founderExpiresAt: null,
    },
    liveChannels: [],
    promotionCampaigns: [],
    products: [],
  },
};

function createPrismaMock() {
  return {
    merchantBuilding: {
      findMany: jest.fn().mockResolvedValue([building]),
      findFirst: jest.fn().mockResolvedValue(building),
      update: jest.fn().mockResolvedValue({
        ...building,
        isOfficialStore: true,
        buildingType: BuildingType.OFFICIAL,
      }),
      count: jest.fn().mockResolvedValue(1),
    },
    shop: {
      findFirst: jest.fn().mockResolvedValue({ id: building.shopId }),
      update: jest.fn(),
    },
  };
}

describe("MerchantBuildingsController integration", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MerchantBuildingsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(createPrismaMock())
      .overrideProvider(ShopPermissionsService)
      .useValue({ canManageShop: jest.fn().mockResolvedValue(true) })
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

  it("lists published merchant buildings", async () => {
    const response = await request(app.getHttpServer())
      .get("/buildings")
      .expect(200);

    expect(response.body[0].signText).toBe("Velora PC");
  });

  it("serves public merchant profiles", async () => {
    const response = await request(app.getHttpServer())
      .get("/merchant/velora-pc")
      .expect(200);

    expect(response.body.founderBadge).toBe("Founder Merchant");
  });

  it("assigns official store status", async () => {
    const response = await request(app.getHttpServer())
      .patch(`/admin/buildings/${building.id}`)
      .send({ isOfficialStore: true })
      .expect(200);

    expect(response.body.buildingType).toBe(BuildingType.OFFICIAL);
  });
});
