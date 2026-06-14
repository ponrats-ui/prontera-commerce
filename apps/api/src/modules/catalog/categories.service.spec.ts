import { ForbiddenException } from "@nestjs/common";
import { CategoryStatus } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CategoriesService } from "./categories.service";

const user: AuthenticatedUser = {
  id: "user-1",
  email: "owner@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

function createPrismaMock() {
  return {
    category: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    categoryTranslation: {
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    locale: {
      findFirst: jest.fn().mockResolvedValue({ code: "en-US" }),
    },
    $transaction: jest.fn((callback) =>
      callback({
        category: {
          update: jest.fn().mockResolvedValue({ id: "category-1" }),
        },
        categoryTranslation: {
          updateMany: jest.fn(),
          create: jest.fn(),
        },
      }),
    ),
  };
}

describe("CategoriesService", () => {
  it("creates a localized category for a manageable shop", async () => {
    const prisma = createPrismaMock();
    prisma.category.findFirst.mockResolvedValue(null);
    prisma.category.create.mockResolvedValue({ id: "category-1" });
    const permissions = {
      canManageCatalog: jest.fn().mockResolvedValue(true),
      canReadCatalog: jest.fn(),
    };
    const service = new CategoriesService(
      prisma as never,
      permissions as never,
    );

    await expect(
      service.createCategory(user, {
        shopId: "11111111-1111-4111-8111-111111111111",
        slug: "adventurer-gear",
        translations: [{ locale: "en-US", name: "Adventurer Gear" }],
      }),
    ).resolves.toEqual({ id: "category-1" });

    expect(prisma.category.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "adventurer-gear",
          status: CategoryStatus.ACTIVE,
        }),
      }),
    );
  });

  it("blocks category creation without owner or manager access", async () => {
    const permissions = {
      canManageCatalog: jest.fn().mockResolvedValue(false),
      canReadCatalog: jest.fn(),
    };
    const service = new CategoriesService(
      createPrismaMock() as never,
      permissions as never,
    );

    await expect(
      service.createCategory(user, {
        shopId: "11111111-1111-4111-8111-111111111111",
        slug: "adventurer-gear",
        translations: [{ locale: "en-US", name: "Adventurer Gear" }],
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
