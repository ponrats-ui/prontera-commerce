import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ShopStaffRole, ShopStatus, StaffStatus } from "@prisma/client";
import request from "supertest";
import type { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PrismaService } from "../database/prisma.service";
import { ShopsModule } from "./shops.module";

const ownerUser: AuthenticatedUser = {
  id: "owner-1",
  email: "owner@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

const staffUser: AuthenticatedUser = {
  id: "staff-1",
  email: "staff@example.com",
  roles: ["merchant"],
  sessionId: "session-2",
};

const baseShop = {
  id: "shop-1",
  ownerId: ownerUser.id,
  name: "Prontera Outfitters",
  slug: "prontera-outfitters",
  description: null,
  logoUrl: null,
  bannerUrl: null,
  contactEmail: null,
  contactPhone: null,
  countryCode: "US",
  localeCode: "en-US",
  currencyCode: "USD",
  preferredLocale: "en-US",
  preferredCurrency: "USD",
  timeZone: "America/New_York",
  status: ShopStatus.ACTIVE,
  isPublic: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  owner: { id: ownerUser.id, email: ownerUser.email, name: "Owner" },
  staff: [
    {
      id: "staff-owner",
      shopId: "shop-1",
      userId: ownerUser.id,
      role: ShopStaffRole.OWNER,
      status: StaffStatus.ACTIVE,
      user: { id: ownerUser.id, email: ownerUser.email, name: "Owner" },
    },
  ],
};

function createPrismaMock(getCurrentUser: () => AuthenticatedUser) {
  const createdShop = {
    ...baseShop,
    id: "created-shop",
    name: "New Shop",
    slug: "new-shop",
  };

  return {
    shop: {
      findFirst: jest.fn(async (args) => {
        if (args.where?.slug) {
          return null;
        }

        if (args.select?.ownerId) {
          const currentUser = getCurrentUser();
          return {
            ownerId: ownerUser.id,
            staff:
              currentUser.id === ownerUser.id
                ? [{ role: ShopStaffRole.OWNER }]
                : [{ role: ShopStaffRole.STAFF }],
          };
        }

        if (args.select?.id) {
          return { id: "shop-1" };
        }

        return baseShop;
      }),
      findMany: jest.fn(async () => [baseShop]),
      update: jest.fn(async (args) => ({
        ...baseShop,
        ...args.data,
      })),
    },
    shopStaff: {
      findFirst: jest.fn(),
      findMany: jest.fn(async () => baseShop.staff),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(async () => 1),
    },
    shopInvitation: {
      create: jest.fn(),
      findMany: jest.fn(async () => []),
    },
    user: {
      findFirst: jest.fn(),
    },
    country: {
      findFirst: jest.fn(async () => ({ code: "US" })),
    },
    locale: {
      findFirst: jest.fn(async () => ({ code: "en-US" })),
    },
    currency: {
      findFirst: jest.fn(async () => ({ code: "USD" })),
    },
    $transaction: jest.fn((callback) =>
      callback({
        shop: {
          create: jest.fn(() => createdShop),
        },
      }),
    ),
  };
}

describe("ShopsController (integration)", () => {
  let app: INestApplication;
  let currentUser = ownerUser;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    currentUser = ownerUser;
    prisma = createPrismaMock(() => currentUser);

    const moduleRef = await Test.createTestingModule({
      imports: [ShopsModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => { getRequest: () => { user: AuthenticatedUser } };
        }) => {
          context.switchToHttp().getRequest().user = currentUser;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("creates a shop for the authenticated user", async () => {
    const response = await request(app.getHttpServer())
      .post("/shops")
      .set("Authorization", "Bearer test-token")
      .send({
        name: "New Shop",
        slug: "new-shop",
        countryCode: "US",
        preferredLocale: "en-US",
        preferredCurrency: "USD",
        timeZone: "America/New_York",
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: "created-shop",
        slug: "new-shop",
      }),
    );
  });

  it("returns shops for the authenticated user", async () => {
    const response = await request(app.getHttpServer())
      .get("/shops/me")
      .set("Authorization", "Bearer test-token")
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(expect.objectContaining({ id: "shop-1" }));
  });

  it("updates a shop when the user can manage it", async () => {
    const response = await request(app.getHttpServer())
      .patch("/shops/shop-1")
      .set("Authorization", "Bearer test-token")
      .send({ name: "Updated Shop" })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({ name: "Updated Shop" }),
    );
  });

  it("rejects unauthorized shop updates", async () => {
    currentUser = staffUser;

    await request(app.getHttpServer())
      .patch("/shops/shop-1")
      .set("Authorization", "Bearer test-token")
      .send({ name: "Blocked Update" })
      .expect(403);
  });
});
