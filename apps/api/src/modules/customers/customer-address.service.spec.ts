import { ForbiddenException } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CustomerAddressService } from "./customer-address.service";

const user: AuthenticatedUser = {
  id: "user-1",
  email: "cashier@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

function createPrismaMock() {
  const tx = {
    customerAddress: {
      updateMany: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: "address-1" }),
    },
    customerActivity: {
      create: jest.fn(),
    },
  };

  return {
    customer: {
      findFirst: jest
        .fn()
        .mockResolvedValue({ id: "customer-1", shopId: "shop-1" }),
    },
    customerAddress: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(tx)),
    tx,
  };
}

describe("CustomerAddressService", () => {
  it("adds an address and clears previous defaults", async () => {
    const prisma = createPrismaMock();
    const permissions = {
      canWriteCustomers: jest.fn().mockResolvedValue(true),
      canReadCustomers: jest.fn(),
    };
    const service = new CustomerAddressService(
      prisma as never,
      permissions as never,
    );

    await expect(
      service.addAddress(user, "customer-1", {
        addressLine1: "123 Main",
        countryCode: "US",
        isDefaultShipping: true,
      }),
    ).resolves.toEqual({ id: "address-1" });

    expect(prisma.tx.customerAddress.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { isDefaultShipping: false },
      }),
    );
  });

  it("blocks address creation without write access", async () => {
    const permissions = {
      canWriteCustomers: jest.fn().mockResolvedValue(false),
      canReadCustomers: jest.fn(),
    };
    const service = new CustomerAddressService(
      createPrismaMock() as never,
      permissions as never,
    );

    await expect(
      service.addAddress(user, "customer-1", {
        addressLine1: "123 Main",
        countryCode: "US",
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
