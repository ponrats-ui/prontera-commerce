import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  InventoryAdjustmentReason,
  InventoryMovementType,
  ShopStaffRole,
  WarehouseStatus,
} from "@prisma/client";
import request from "supertest";
import type { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PrismaService } from "../database/prisma.service";
import { InventoryModule } from "./inventory.module";

const shopId = "11111111-1111-4111-8111-111111111111";
const warehouseId = "22222222-2222-4222-8222-222222222222";
const itemId = "33333333-3333-4333-8333-333333333333";
const variantId = "44444444-4444-4444-8444-444444444444";

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

const warehouse = {
  id: warehouseId,
  shopId,
  name: "Bangkok Main",
  code: "BKK-MAIN",
  address: null,
  countryCode: "TH",
  timeZone: "Asia/Bangkok",
  status: WarehouseStatus.ACTIVE,
};

const item = {
  id: itemId,
  warehouseId,
  productVariantId: variantId,
  sku: "SKU-1",
  quantityOnHand: 10,
  quantityReserved: 1,
  reorderPoint: 3,
  reorderQuantity: 10,
  warehouse: {
    id: warehouseId,
    shopId,
    code: "BKK-MAIN",
    name: "Bangkok Main",
  },
  productVariant: { id: variantId, sku: "SKU-1", name: "Variant" },
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
    country: {
      findFirst: jest.fn(async () => ({ code: "TH" })),
    },
    warehouse: {
      findFirst: jest.fn(async (args) => {
        if (args.where?.code) return null;
        return warehouse;
      }),
      findMany: jest.fn(async () => [warehouse]),
      create: jest.fn(async () => warehouse),
      update: jest.fn(async (args) => ({ ...warehouse, ...args.data })),
    },
    productVariant: {
      findFirst: jest.fn(async () => ({ id: variantId })),
    },
    inventoryItem: {
      findFirst: jest.fn(async (args) => {
        if (args.where?.warehouseId && args.where?.productVariantId)
          return null;
        return item;
      }),
      findMany: jest.fn(async () => [item]),
    },
    inventoryMovement: {
      findMany: jest.fn(async () => [{ id: "movement-1" }]),
      findFirst: jest.fn(async () => ({
        id: "movement-1",
        inventoryItem: item,
      })),
    },
    inventoryAdjustment: {
      findMany: jest.fn(async () => [{ id: "adjustment-1" }]),
    },
    inventoryReservation: {
      findMany: jest.fn(async () => [{ id: "reservation-1" }]),
    },
    inventoryAlert: {
      findMany: jest.fn(async () => []),
    },
    $transaction: jest.fn((callback) =>
      callback({
        inventoryItem: {
          create: jest.fn(async () => item),
          update: jest.fn(async () => ({ ...item, quantityOnHand: 12 })),
        },
        inventoryMovement: {
          create: jest.fn(async () => ({ id: "movement-1" })),
        },
        inventoryAdjustment: {
          create: jest.fn(async () => ({ id: "adjustment-1" })),
        },
        inventoryReservation: {
          create: jest.fn(async () => ({ id: "reservation-1" })),
        },
        inventoryAlert: {
          create: jest.fn(),
        },
      }),
    ),
  };
}

describe("InventoryController (integration)", () => {
  let app: INestApplication;
  let currentUser = ownerUser;

  beforeEach(async () => {
    currentUser = ownerUser;
    const prisma = createPrismaMock(() => currentUser);
    const moduleRef = await Test.createTestingModule({
      imports: [InventoryModule],
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

  it("creates a warehouse", async () => {
    await request(app.getHttpServer())
      .post(`/shops/${shopId}/warehouses`)
      .send({
        name: "Bangkok Main",
        code: "BKK-MAIN",
        countryCode: "TH",
        timezone: "Asia/Bangkok",
      })
      .expect(201);
  });

  it("creates an inventory item", async () => {
    await request(app.getHttpServer())
      .post("/inventory/items")
      .send({
        warehouseId,
        productVariantId: variantId,
        sku: "SKU-1",
        quantityOnHand: 10,
      })
      .expect(201);
  });

  it("creates inventory movement, adjustment, and reservation", async () => {
    await request(app.getHttpServer())
      .post("/inventory/movements")
      .send({
        inventoryItemId: itemId,
        movementType: InventoryMovementType.INBOUND,
        quantity: 2,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post("/inventory/adjustments")
      .send({
        inventoryItemId: itemId,
        reason: InventoryAdjustmentReason.COUNT_CORRECTION,
        afterQuantity: 12,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post("/inventory/reservations")
      .send({
        inventoryItemId: itemId,
        quantity: 1,
        expiresAt: "2026-07-14T00:00:00.000Z",
      })
      .expect(201);
  });

  it("rejects unauthorized warehouse management", async () => {
    currentUser = staffUser;

    await request(app.getHttpServer())
      .post(`/shops/${shopId}/warehouses`)
      .send({
        name: "Bangkok Main",
        code: "BKK-MAIN",
        countryCode: "TH",
        timezone: "Asia/Bangkok",
      })
      .expect(403);
  });
});
