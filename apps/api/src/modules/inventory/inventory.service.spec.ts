import { ForbiddenException } from "@nestjs/common";
import {
  InventoryAdjustmentReason,
  InventoryMovementType,
  InventoryReservationStatus,
} from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { InventoryService } from "./inventory.service";

const user: AuthenticatedUser = {
  id: "user-1",
  email: "owner@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

const item = {
  id: "item-1",
  warehouseId: "warehouse-1",
  productVariantId: "variant-1",
  sku: "SKU-1",
  quantityOnHand: 10,
  quantityReserved: 2,
  reorderPoint: 3,
  reorderQuantity: 10,
  warehouse: {
    id: "warehouse-1",
    shopId: "shop-1",
    code: "MAIN",
    name: "Main",
  },
  productVariant: { id: "variant-1", sku: "SKU-1", name: "Variant" },
};

function createPrismaMock() {
  return {
    warehouse: {
      findFirst: jest
        .fn()
        .mockResolvedValue({ id: "warehouse-1", shopId: "shop-1" }),
    },
    productVariant: {
      findFirst: jest.fn().mockResolvedValue({ id: "variant-1" }),
    },
    inventoryItem: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    inventoryMovement: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    inventoryAdjustment: {
      findMany: jest.fn(),
    },
    inventoryReservation: {
      findMany: jest.fn(),
    },
    inventoryAlert: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) =>
      callback({
        inventoryItem: {
          create: jest.fn().mockResolvedValue(item),
          update: jest.fn().mockResolvedValue({
            ...item,
            quantityOnHand: 15,
            quantityReserved: 2,
          }),
        },
        inventoryMovement: {
          create: jest.fn().mockResolvedValue({ id: "movement-1" }),
        },
        inventoryAdjustment: {
          create: jest.fn().mockResolvedValue({ id: "adjustment-1" }),
        },
        inventoryReservation: {
          create: jest.fn().mockResolvedValue({ id: "reservation-1" }),
        },
        inventoryAlert: {
          create: jest.fn(),
        },
      }),
    ),
  };
}

describe("InventoryService", () => {
  it("creates an inventory item and computes available quantity", async () => {
    const prisma = createPrismaMock();
    prisma.inventoryItem.findFirst.mockResolvedValue(null);
    const permissions = {
      canManageInventory: jest.fn().mockResolvedValue(true),
      canCreateMovement: jest.fn(),
      canReadInventory: jest.fn(),
    };
    const service = new InventoryService(prisma as never, permissions as never);

    await expect(
      service.createItem(user, {
        warehouseId: "warehouse-1",
        productVariantId: "variant-1",
        sku: "SKU-1",
        quantityOnHand: 10,
        quantityReserved: 2,
      }),
    ).resolves.toEqual(expect.objectContaining({ quantityAvailable: 8 }));
  });

  it("creates movements only when inventory permissions allow it", async () => {
    const prisma = createPrismaMock();
    prisma.inventoryItem.findFirst.mockResolvedValue(item);
    const permissions = {
      canManageInventory: jest.fn(),
      canCreateMovement: jest.fn().mockResolvedValue(false),
      canReadInventory: jest.fn(),
    };
    const service = new InventoryService(prisma as never, permissions as never);

    await expect(
      service.createMovement(user, {
        inventoryItemId: "item-1",
        movementType: InventoryMovementType.INBOUND,
        quantity: 5,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it("records adjustment audit data", async () => {
    const prisma = createPrismaMock();
    prisma.inventoryItem.findFirst.mockResolvedValue(item);
    const permissions = {
      canManageInventory: jest.fn().mockResolvedValue(true),
      canCreateMovement: jest.fn(),
      canReadInventory: jest.fn(),
    };
    const service = new InventoryService(prisma as never, permissions as never);

    await expect(
      service.createAdjustment(user, {
        inventoryItemId: "item-1",
        reason: InventoryAdjustmentReason.COUNT_CORRECTION,
        afterQuantity: 15,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        adjustment: { id: "adjustment-1" },
      }),
    );
  });

  it("creates reservations for future allocation", async () => {
    const prisma = createPrismaMock();
    prisma.inventoryItem.findFirst.mockResolvedValue(item);
    const permissions = {
      canManageInventory: jest.fn().mockResolvedValue(true),
      canCreateMovement: jest.fn(),
      canReadInventory: jest.fn(),
    };
    const service = new InventoryService(prisma as never, permissions as never);

    await expect(
      service.createReservation(user, {
        inventoryItemId: "item-1",
        quantity: 2,
        expiresAt: new Date("2026-07-14T00:00:00.000Z"),
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        reservation: { id: "reservation-1" },
      }),
    );
    expect(InventoryReservationStatus.ACTIVE).toBe("ACTIVE");
  });
});
