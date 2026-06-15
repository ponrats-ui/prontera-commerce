import { ForbiddenException } from "@nestjs/common";
import { OrderStatus, PaymentMethod } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { OrdersService } from "./orders.service";

const user: AuthenticatedUser = {
  id: "user-1",
  email: "cashier@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

const variant = {
  id: "variant-1",
  sku: "SKU-1",
  name: "Variant",
  priceCents: 1000,
  currency: "USD",
  product: { id: "product-1", name: "Product", shopId: "shop-1" },
};

describe("OrdersService", () => {
  it("creates an order with item snapshots and manual payment record", async () => {
    const prisma = {
      productVariant: { findMany: jest.fn().mockResolvedValue([variant]) },
      order: { create: jest.fn().mockResolvedValue({ id: "order-1" }) },
    };
    const permissions = {
      canCreateTransaction: jest.fn().mockResolvedValue(true),
      canReadTransactions: jest.fn(),
    };
    const service = new OrdersService(prisma as never, permissions as never);

    await expect(
      service.createOrder(user, {
        shopId: "shop-1",
        status: OrderStatus.PENDING,
        items: [{ productVariantId: "variant-1", quantity: 2 }],
        payment: { method: PaymentMethod.CASH },
      }),
    ).resolves.toEqual({ id: "order-1" });

    expect(prisma.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: 2000,
          total: 2000,
          currency: "USD",
        }),
      }),
    );
  });

  it("blocks order creation without transaction permission", async () => {
    const service = new OrdersService(
      {} as never,
      {
        canCreateTransaction: jest.fn().mockResolvedValue(false),
      } as never,
    );

    await expect(
      service.createOrder(user, {
        shopId: "shop-1",
        items: [{ productVariantId: "variant-1", quantity: 1 }],
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
