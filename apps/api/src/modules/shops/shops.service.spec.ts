import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { ShopStaffRole, ShopStatus, StaffStatus } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { ShopPermissionsService } from "./shop-permissions.service";
import { ShopsService } from "./shops.service";

const user: AuthenticatedUser = {
  id: "user-1",
  email: "owner@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

const shop = {
  id: "shop-1",
  ownerId: user.id,
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
};

function createPrismaMock() {
  const tx = {
    shop: {
      create: jest.fn().mockResolvedValue({
        ...shop,
        owner: { id: user.id, email: user.email, name: "Owner" },
        staff: [
          {
            id: "staff-owner",
            userId: user.id,
            role: ShopStaffRole.OWNER,
            status: StaffStatus.ACTIVE,
          },
        ],
      }),
    },
  };

  return {
    shop: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    shopStaff: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    shopInvitation: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    country: {
      findFirst: jest.fn().mockResolvedValue({ code: "US" }),
    },
    locale: {
      findFirst: jest.fn().mockResolvedValue({ code: "en-US" }),
    },
    currency: {
      findFirst: jest.fn().mockResolvedValue({ code: "USD" }),
    },
    $transaction: jest.fn((callback) => callback(tx)),
    tx,
  };
}

function createService(prisma = createPrismaMock()) {
  const permissions = new ShopPermissionsService(prisma as never);
  return {
    prisma,
    service: new ShopsService(prisma as never, permissions),
  };
}

describe("ShopsService", () => {
  it("creates a shop and an owner staff record", async () => {
    const { prisma, service } = createService();
    prisma.shop.findFirst.mockResolvedValue(null);

    const response = await service.createShop(user, {
      name: "Prontera Outfitters",
      slug: "prontera-outfitters",
      countryCode: "US",
      preferredLocale: "en-US",
      preferredCurrency: "USD",
      timeZone: "America/New_York",
    });

    expect(response.id).toBe("shop-1");
    expect(prisma.tx.shop.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "prontera-outfitters",
          staff: {
            create: expect.objectContaining({
              role: ShopStaffRole.OWNER,
              status: StaffStatus.ACTIVE,
            }),
          },
        }),
      }),
    );
  });

  it("rejects invalid global shop settings", async () => {
    const { prisma, service } = createService();
    prisma.country.findFirst.mockResolvedValue(null);

    await expect(
      service.createShop(user, {
        name: "Prontera Outfitters",
        slug: "prontera-outfitters",
        countryCode: "ZZ",
        preferredLocale: "en-US",
        preferredCurrency: "USD",
        timeZone: "America/New_York",
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("returns shops where the user is owner or active staff", async () => {
    const { prisma, service } = createService();
    prisma.shop.findMany.mockResolvedValue([shop]);

    await expect(service.getMyShops(user)).resolves.toEqual([shop]);
    expect(prisma.shop.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.any(Array),
        }),
      }),
    );
  });

  it("requires owner or manager access before updating a shop", async () => {
    const { prisma, service } = createService();
    prisma.shop.findFirst.mockResolvedValue({
      ownerId: "other-user",
      staff: [{ role: ShopStaffRole.STAFF }],
    });

    await expect(
      service.updateShop(user, "shop-1", { name: "New Name" }),
    ).rejects.toThrow(ForbiddenException);
  });
});
