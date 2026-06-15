import { ForbiddenException } from "@nestjs/common";
import { CustomerLoyaltyTier } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CustomersService } from "./customers.service";

const user: AuthenticatedUser = {
  id: "user-1",
  email: "manager@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

function createPrismaMock() {
  return {
    customer: {
      findFirst: jest
        .fn()
        .mockResolvedValue({ id: "customer-1", shopId: "shop-1" }),
    },
    customerLoyaltyAccount: {
      findFirst: jest.fn(),
      create: jest.fn().mockResolvedValue({
        customerId: "customer-1",
        pointsBalance: 0,
        tier: CustomerLoyaltyTier.BRONZE,
      }),
      update: jest.fn().mockResolvedValue({
        customerId: "customer-1",
        pointsBalance: 100,
        tier: CustomerLoyaltyTier.SILVER,
      }),
    },
  };
}

describe("Customer loyalty foundation", () => {
  it("creates a loyalty account when one is missing", async () => {
    const prisma = createPrismaMock();
    const permissions = {
      canReadCustomers: jest.fn().mockResolvedValue(true),
      canWriteCustomers: jest.fn(),
      canManageCustomers: jest.fn(),
    };
    const service = new CustomersService(prisma as never, permissions as never);

    await expect(service.getLoyalty(user, "customer-1")).resolves.toEqual(
      expect.objectContaining({ tier: CustomerLoyaltyTier.BRONZE }),
    );
  });

  it("requires manager access to update loyalty", async () => {
    const permissions = {
      canReadCustomers: jest.fn(),
      canWriteCustomers: jest.fn(),
      canManageCustomers: jest.fn().mockResolvedValue(false),
    };
    const service = new CustomersService(
      createPrismaMock() as never,
      permissions as never,
    );

    await expect(
      service.updateLoyalty(user, "customer-1", {
        tier: CustomerLoyaltyTier.SILVER,
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
