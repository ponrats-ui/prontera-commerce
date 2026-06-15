import { CartStatus, InventoryMovementType, OrderStatus } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CheckoutService } from "./checkout.service";
import { OrdersService } from "./orders.service";

const user: AuthenticatedUser = {
  id: "user-1",
  email: "cashier@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

const cart = {
  id: "cart-1",
  userId: "user-1",
  shopId: "shop-1",
  status: CartStatus.ACTIVE,
  items: [
    {
      id: "cart-item-1",
      productId: "product-1",
      productVariantId: "variant-1",
      quantity: 2,
      unitPrice: 1000,
      currency: "USD",
      product: { id: "product-1", name: "Product" },
      productVariant: {
        id: "variant-1",
        sku: "SKU-1",
        name: "Variant",
        priceCents: 1000,
        currency: "USD",
      },
      inventoryItem: null,
      reservation: null,
    },
  ],
};

describe("CheckoutService", () => {
  it("creates reservations and a pending order during checkout", async () => {
    const tx = {
      inventoryItem: {
        findFirst: jest.fn().mockResolvedValue({
          id: "item-1",
          quantityOnHand: 10,
          quantityReserved: 0,
        }),
        update: jest.fn(),
      },
      inventoryReservation: {
        create: jest.fn().mockResolvedValue({ id: "reservation-1" }),
      },
      inventoryMovement: { create: jest.fn() },
      cartItem: { update: jest.fn() },
      order: { create: jest.fn().mockResolvedValue({ id: "order-1" }) },
      cart: { update: jest.fn() },
    };
    const prisma = {
      cart: { findFirst: jest.fn().mockResolvedValue(cart) },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const service = new CheckoutService(
      prisma as never,
      { canCreateTransaction: jest.fn().mockResolvedValue(true) } as never,
      {
        generateOrderNumber: jest.fn().mockReturnValue("ORD-1"),
      } as unknown as OrdersService,
    );

    await expect(service.checkout(user, { shopId: "shop-1" })).resolves.toEqual(
      expect.objectContaining({
        order: { id: "order-1" },
      }),
    );

    expect(tx.inventoryMovement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          movementType: InventoryMovementType.RESERVATION,
        }),
      }),
    );
  });

  it("confirms checkout orders and marks them confirmed", async () => {
    const checkoutCart = {
      ...cart,
      status: CartStatus.CHECKOUT,
      items: [
        {
          ...cart.items[0],
          inventoryItemId: "item-1",
          reservationId: "reservation-1",
          inventoryItem: {
            id: "item-1",
            quantityOnHand: 10,
            quantityReserved: 2,
          },
        },
      ],
    };
    const tx = {
      inventoryMovement: { create: jest.fn() },
      inventoryReservation: { update: jest.fn() },
      inventoryItem: { update: jest.fn() },
      paymentRecord: { updateMany: jest.fn() },
      cart: { update: jest.fn() },
      order: {
        update: jest.fn().mockResolvedValue({ status: OrderStatus.CONFIRMED }),
      },
    };
    const prisma = {
      order: {
        findFirst: jest.fn().mockResolvedValue({
          id: "order-1",
          shopId: "shop-1",
          customerId: "user-1",
          status: OrderStatus.PENDING,
          orderNumber: "ORD-1",
        }),
      },
      cart: { findFirst: jest.fn().mockResolvedValue(checkoutCart) },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const service = new CheckoutService(
      prisma as never,
      { canCreateTransaction: jest.fn().mockResolvedValue(true) } as never,
      {} as OrdersService,
    );

    await expect(
      service.confirm(user, { orderId: "order-1" }),
    ).resolves.toEqual({ status: OrderStatus.CONFIRMED });
  });
});
