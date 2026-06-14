import { ForbiddenException } from "@nestjs/common";
import { WarehouseStatus } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { WarehousesService } from "./warehouses.service";

const user: AuthenticatedUser = {
  id: "user-1",
  email: "owner@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

function createPrismaMock() {
  return {
    warehouse: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    country: {
      findFirst: jest.fn().mockResolvedValue({ code: "TH" }),
    },
  };
}

describe("WarehousesService", () => {
  it("creates a warehouse for a manageable shop", async () => {
    const prisma = createPrismaMock();
    prisma.warehouse.findFirst.mockResolvedValue(null);
    prisma.warehouse.create.mockResolvedValue({ id: "warehouse-1" });
    const permissions = {
      canManageInventory: jest.fn().mockResolvedValue(true),
      canReadInventory: jest.fn(),
    };
    const service = new WarehousesService(
      prisma as never,
      permissions as never,
    );

    await expect(
      service.createWarehouse(user, "shop-1", {
        name: "Bangkok Main",
        code: "BKK-MAIN",
        countryCode: "TH",
        timezone: "Asia/Bangkok",
      }),
    ).resolves.toEqual({ id: "warehouse-1" });

    expect(prisma.warehouse.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          code: "BKK-MAIN",
          status: WarehouseStatus.ACTIVE,
        }),
      }),
    );
  });

  it("blocks warehouse creation without manager access", async () => {
    const permissions = {
      canManageInventory: jest.fn().mockResolvedValue(false),
      canReadInventory: jest.fn(),
    };
    const service = new WarehousesService(
      createPrismaMock() as never,
      permissions as never,
    );

    await expect(
      service.createWarehouse(user, "shop-1", {
        name: "Bangkok Main",
        code: "BKK-MAIN",
        countryCode: "TH",
        timezone: "Asia/Bangkok",
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
