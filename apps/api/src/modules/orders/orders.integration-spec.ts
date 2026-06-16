import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  CartStatus,
  InventoryMovementType,
  OrderStatus,
  PaymentMethod,
  POSSessionStatus,
  ShopStaffRole,
} from "@prisma/client";
import request from "supertest";
import type { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PrismaService } from "../database/prisma.service";
import { OrdersModule } from "./orders.module";

const shopId = "11111111-1111-4111-8111-111111111111";
const productId = "22222222-2222-4222-8222-222222222222";
const variantId = "33333333-3333-4333-8333-333333333333";
const cartId = "44444444-4444-4444-8444-444444444444";
const orderId = "55555555-5555-4555-8555-555555555555";
const itemId = "66666666-6666-4666-8666-666666666666";
const posSessionId = "77777777-7777-4777-8777-777777777777";

const user: AuthenticatedUser = {
  id: "user-1",
  email: "cashier@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

const variant = {
  id: variantId,
  sku: "SKU-1",
  name: "Variant",
  priceCents: 1000,
  currency: "USD",
  product: { id: productId, name: "Product", shopId, categoryId: "category-1" },
};

const cart = {
  id: cartId,
  userId: user.id,
  shopId,
  status: CartStatus.ACTIVE,
  items: [
    {
      id: "cart-item-1",
      cartId,
      productId,
      productVariantId: variantId,
      quantity: 2,
      unitPrice: 1000,
      currency: "USD",
      inventoryItemId: itemId,
      reservationId: "reservation-1",
      product: { id: productId, name: "Product" },
      productVariant: variant,
      inventoryItem: { id: itemId, quantityOnHand: 10, quantityReserved: 2 },
      reservation: { id: "reservation-1" },
    },
  ],
};

function createPrismaMock() {
  const tx = {
    inventoryItem: {
      findFirst: jest.fn().mockResolvedValue({
        id: itemId,
        quantityOnHand: 10,
        quantityReserved: 0,
      }),
      update: jest.fn().mockResolvedValue({ id: itemId }),
    },
    inventoryReservation: {
      create: jest.fn().mockResolvedValue({ id: "reservation-1" }),
      update: jest.fn(),
    },
    inventoryMovement: {
      create: jest.fn().mockResolvedValue({ id: "movement-1" }),
    },
    cartItem: { update: jest.fn() },
    order: {
      create: jest.fn().mockResolvedValue({ id: orderId }),
      update: jest
        .fn()
        .mockResolvedValue({ id: orderId, status: OrderStatus.CONFIRMED }),
    },
    cart: { update: jest.fn() },
    paymentRecord: { updateMany: jest.fn() },
    voucher: { update: jest.fn() },
    pOSShift: { updateMany: jest.fn() },
    pOSSession: {
      update: jest.fn().mockResolvedValue({
        id: posSessionId,
        status: POSSessionStatus.CLOSED,
      }),
    },
  };

  return {
    shop: {
      findFirst: jest.fn().mockResolvedValue({
        ownerId: user.id,
        staff: [{ role: ShopStaffRole.CASHIER }],
      }),
    },
    productVariant: {
      findFirst: jest.fn().mockResolvedValue(variant),
      findMany: jest.fn().mockResolvedValue([variant]),
    },
    cart: {
      findFirst: jest.fn((args) => {
        if (args.include) return Promise.resolve(cart);
        return Promise.resolve({ id: cartId });
      }),
      create: jest.fn().mockResolvedValue({ id: cartId }),
      update: jest.fn().mockResolvedValue({ id: cartId }),
    },
    cartItem: {
      create: jest.fn().mockResolvedValue({ id: "cart-item-1" }),
      findFirst: jest
        .fn()
        .mockResolvedValue({ ...cart.items[0], cart: { shopId } }),
      update: jest.fn().mockResolvedValue({ id: "cart-item-1" }),
    },
    order: {
      create: jest.fn().mockResolvedValue({ id: orderId }),
      findFirst: jest.fn().mockResolvedValue({
        id: orderId,
        shopId,
        customerId: user.id,
        status: OrderStatus.PENDING,
        orderNumber: "ORD-1",
      }),
      findMany: jest.fn().mockResolvedValue([{ id: orderId }]),
    },
    customer: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    customerGroupMember: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    promotionCampaign: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    voucher: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    customerPricingTier: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    pOSSession: {
      findFirst: jest.fn((args) => {
        if (args.where?.id) {
          return Promise.resolve({
            id: posSessionId,
            shopId,
            status: POSSessionStatus.OPEN,
          });
        }
        return Promise.resolve(null);
      }),
      create: jest.fn().mockResolvedValue({ id: posSessionId }),
    },
    $transaction: jest.fn((callback) => callback(tx)),
    tx,
  };
}

describe("Orders and checkout controllers (integration)", () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const moduleRef = await Test.createTestingModule({
      imports: [OrdersModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
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

  it("creates an order", async () => {
    await request(app.getHttpServer())
      .post("/orders")
      .send({
        shopId,
        items: [{ productVariantId: variantId, quantity: 1 }],
        payment: { method: PaymentMethod.CASH },
      })
      .expect(201);
  });

  it("checks out, confirms inventory reduction, and cancels checkout", async () => {
    await request(app.getHttpServer())
      .post("/cart/items")
      .send({ shopId, productVariantId: variantId, quantity: 2 })
      .expect(201);

    await request(app.getHttpServer())
      .post("/checkout")
      .send({ shopId, paymentMethod: PaymentMethod.MANUAL })
      .expect(201);

    await request(app.getHttpServer())
      .post("/checkout/confirm")
      .send({ orderId })
      .expect(201);

    expect(prisma.tx.inventoryMovement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          movementType: InventoryMovementType.OUTBOUND,
        }),
      }),
    );

    prisma.tx.order.update.mockResolvedValueOnce({
      id: orderId,
      status: OrderStatus.CANCELLED,
    });

    await request(app.getHttpServer())
      .post("/checkout/cancel")
      .send({ orderId })
      .expect(201);
  });

  it("opens and closes POS sessions", async () => {
    await request(app.getHttpServer())
      .post("/pos/open")
      .send({ shopId, openingCash: 1000 })
      .expect(201);

    await request(app.getHttpServer())
      .post("/pos/close")
      .send({ sessionId: posSessionId, closingCash: 1200 })
      .expect(201);
  });
});
