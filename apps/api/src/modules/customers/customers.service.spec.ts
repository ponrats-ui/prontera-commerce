import { ForbiddenException } from "@nestjs/common";
import { CustomerSource, CustomerStatus } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CustomersService } from "./customers.service";

const user: AuthenticatedUser = {
  id: "user-1",
  email: "owner@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

function createPrismaMock() {
  const tx = {
    customer: {
      create: jest.fn().mockResolvedValue({
        id: "customer-1",
        shopId: "shop-1",
        source: CustomerSource.MANUAL,
      }),
      update: jest.fn().mockResolvedValue({ id: "customer-1" }),
    },
    customerActivity: {
      create: jest.fn(),
    },
  };

  return {
    customer: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
    },
    customerGroup: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    customerTag: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    customerNote: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    customerLoyaltyAccount: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    customerGroupMember: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    customerTagAssignment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    customerActivity: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(tx)),
    tx,
  };
}

describe("CustomersService", () => {
  it("creates a customer with normalized contact and loyalty foundation", async () => {
    const prisma = createPrismaMock();
    prisma.customer.findFirst.mockResolvedValue(null);
    const permissions = {
      canWriteCustomers: jest.fn().mockResolvedValue(true),
      canReadCustomers: jest.fn(),
      canManageCustomers: jest.fn(),
    };
    const service = new CustomersService(prisma as never, permissions as never);

    await expect(
      service.createCustomer(user, "shop-1", {
        firstName: "Ada",
        lastName: "Merchant",
        email: "ADA@EXAMPLE.COM",
        phone: "+1 (555) 123-4567",
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        id: "customer-1",
      }),
    );

    expect(prisma.tx.customer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          displayName: "Ada Merchant",
          normalizedEmail: "ada@example.com",
          normalizedPhone: "+15551234567",
          status: CustomerStatus.ACTIVE,
          loyaltyAccount: { create: {} },
        }),
      }),
    );
  });

  it("blocks customer creation without write access", async () => {
    const permissions = {
      canWriteCustomers: jest.fn().mockResolvedValue(false),
      canReadCustomers: jest.fn(),
      canManageCustomers: jest.fn(),
    };
    const service = new CustomersService(
      createPrismaMock() as never,
      permissions as never,
    );

    await expect(
      service.createCustomer(user, "shop-1", { displayName: "Blocked" }),
    ).rejects.toThrow(ForbiddenException);
  });
});
