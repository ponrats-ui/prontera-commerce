import { ForbiddenException } from "@nestjs/common";
import { ProductStatus } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { ProductsService } from "./products.service";

const user: AuthenticatedUser = {
  id: "user-1",
  email: "owner@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

const product = {
  id: "product-1",
  shopId: "shop-1",
  categoryId: "category-1",
  sku: "SKU-1",
  slug: "traveler-jacket",
  name: "Traveler Jacket",
  status: ProductStatus.DRAFT,
  shop: { id: "shop-1", currencyCode: "USD", preferredCurrency: "USD" },
};

function createPrismaMock() {
  return {
    product: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    category: {
      findFirst: jest.fn().mockResolvedValue({ id: "category-1" }),
    },
    locale: {
      findFirst: jest.fn().mockResolvedValue({ code: "en-US" }),
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
        product: {
          update: jest.fn().mockResolvedValue({ ...product, name: "Updated" }),
        },
        productTranslation: {
          updateMany: jest.fn(),
          create: jest.fn(),
        },
      }),
    ),
  };
}

describe("ProductsService", () => {
  it("creates a product with localized content", async () => {
    const prisma = createPrismaMock();
    prisma.product.findFirst.mockResolvedValue(null);
    prisma.product.create.mockResolvedValue(product);
    const permissions = {
      canManageCatalog: jest.fn().mockResolvedValue(true),
      canReadCatalog: jest.fn(),
    };
    const service = new ProductsService(prisma as never, permissions as never);

    await expect(
      service.createProduct(user, "shop-1", {
        sku: "SKU-1",
        slug: "traveler-jacket",
        categoryId: "category-1",
        translations: [{ locale: "en-US", name: "Traveler Jacket" }],
      }),
    ).resolves.toEqual(product);

    expect(prisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sku: "SKU-1",
          slug: "traveler-jacket",
          status: ProductStatus.DRAFT,
        }),
      }),
    );
  });

  it("blocks product updates without owner or manager access", async () => {
    const prisma = createPrismaMock();
    prisma.product.findFirst.mockResolvedValue(product);
    const permissions = {
      canManageCatalog: jest.fn().mockResolvedValue(false),
      canReadCatalog: jest.fn(),
    };
    const service = new ProductsService(prisma as never, permissions as never);

    await expect(
      service.updateProduct(user, "product-1", {
        status: ProductStatus.ACTIVE,
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
