import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  CategoryStatus,
  ProductStatus,
  ShopStaffRole,
  StaffStatus,
} from "@prisma/client";
import request from "supertest";
import type { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PrismaService } from "../database/prisma.service";
import { CatalogModule } from "./catalog.module";

const shopId = "11111111-1111-4111-8111-111111111111";
const categoryId = "22222222-2222-4222-8222-222222222222";
const productId = "33333333-3333-4333-8333-333333333333";

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

const category = {
  id: categoryId,
  shopId,
  slug: "adventurer-gear",
  name: "Adventurer Gear",
  status: CategoryStatus.ACTIVE,
  translations: [{ localeCode: "en-US", name: "Adventurer Gear" }],
};

const product = {
  id: productId,
  shopId,
  categoryId,
  sku: "SKU-1",
  slug: "traveler-jacket",
  name: "Traveler Jacket",
  status: ProductStatus.DRAFT,
  shop: { id: shopId, currencyCode: "USD", preferredCurrency: "USD" },
  translations: [{ localeCode: "en-US", name: "Traveler Jacket" }],
  images: [],
  variants: [],
};

function createPrismaMock(getCurrentUser: () => AuthenticatedUser) {
  return {
    shop: {
      findFirst: jest.fn(async () => {
        const currentUser = getCurrentUser();
        return {
          ownerId: ownerUser.id,
          staff: [
            {
              role:
                currentUser.id === ownerUser.id
                  ? ShopStaffRole.OWNER
                  : ShopStaffRole.STAFF,
            },
          ],
        };
      }),
    },
    locale: {
      findFirst: jest.fn(async () => ({ code: "en-US" })),
    },
    category: {
      findFirst: jest.fn(async (args) => {
        if (args.where?.slug) return null;
        return category;
      }),
      findMany: jest.fn(async () => [category]),
      create: jest.fn(async () => category),
      update: jest.fn(async (args) => ({
        ...category,
        ...args.data,
      })),
    },
    categoryTranslation: {
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    product: {
      findFirst: jest.fn(async (args) => {
        if (args.where?.slug || args.where?.sku) return null;
        return product;
      }),
      findMany: jest.fn(async () => [product]),
      create: jest.fn(async () => product),
      update: jest.fn(async (args) => ({
        ...product,
        ...args.data,
      })),
    },
    productTranslation: {
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    productImage: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    productVariant: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) =>
      callback({
        category: {
          update: jest.fn(async (args) => ({
            ...category,
            ...args.data,
          })),
        },
        categoryTranslation: {
          updateMany: jest.fn(),
          create: jest.fn(),
        },
        product: {
          update: jest.fn(async (args) => ({
            ...product,
            ...args.data,
          })),
        },
        productTranslation: {
          updateMany: jest.fn(),
          create: jest.fn(),
        },
      }),
    ),
  };
}

describe("CatalogController (integration)", () => {
  let app: INestApplication;
  let currentUser = ownerUser;

  beforeEach(async () => {
    currentUser = ownerUser;
    const prisma = createPrismaMock(() => currentUser);
    const moduleRef = await Test.createTestingModule({
      imports: [CatalogModule],
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
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
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

  it("creates, lists, updates, and deletes categories", async () => {
    await request(app.getHttpServer())
      .post("/categories")
      .set("Authorization", "Bearer test-token")
      .send({
        shopId,
        slug: "adventurer-gear",
        translations: [{ locale: "en-US", name: "Adventurer Gear" }],
      })
      .expect(201);

    await request(app.getHttpServer())
      .get("/categories")
      .query({ shopId })
      .set("Authorization", "Bearer test-token")
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/categories/${categoryId}`)
      .set("Authorization", "Bearer test-token")
      .send({ status: CategoryStatus.ARCHIVED })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/categories/${categoryId}`)
      .set("Authorization", "Bearer test-token")
      .expect(200);
  });

  it("creates, updates, and deletes products", async () => {
    await request(app.getHttpServer())
      .post(`/shops/${shopId}/products`)
      .set("Authorization", "Bearer test-token")
      .send({
        sku: "SKU-1",
        slug: "traveler-jacket",
        categoryId,
        translations: [{ locale: "en-US", name: "Traveler Jacket" }],
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/products/${productId}`)
      .set("Authorization", "Bearer test-token")
      .send({ status: ProductStatus.ACTIVE })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/products/${productId}`)
      .set("Authorization", "Bearer test-token")
      .expect(200);
  });

  it("rejects unauthorized product updates for staff users", async () => {
    currentUser = staffUser;

    await request(app.getHttpServer())
      .patch(`/products/${productId}`)
      .set("Authorization", "Bearer test-token")
      .send({ status: ProductStatus.ACTIVE })
      .expect(403);
  });
});
