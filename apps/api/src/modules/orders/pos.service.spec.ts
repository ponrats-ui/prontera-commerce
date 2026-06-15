import { POSSessionStatus } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { POSService } from "./pos.service";

const user: AuthenticatedUser = {
  id: "cashier-1",
  email: "cashier@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

describe("POSService", () => {
  it("opens a POS session with an initial shift", async () => {
    const prisma = {
      pOSSession: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: "pos-1" }),
      },
    };
    const service = new POSService(
      prisma as never,
      {
        canCreateTransaction: jest.fn().mockResolvedValue(true),
      } as never,
    );

    await expect(
      service.open(user, { shopId: "shop-1", openingCash: 1000 }),
    ).resolves.toEqual({ id: "pos-1" });
  });

  it("closes an open POS session", async () => {
    const tx = {
      pOSShift: { updateMany: jest.fn() },
      pOSSession: {
        update: jest
          .fn()
          .mockResolvedValue({ status: POSSessionStatus.CLOSED }),
      },
    };
    const prisma = {
      pOSSession: {
        findFirst: jest.fn().mockResolvedValue({
          id: "pos-1",
          shopId: "shop-1",
          status: POSSessionStatus.OPEN,
        }),
      },
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const service = new POSService(
      prisma as never,
      {
        canCreateTransaction: jest.fn().mockResolvedValue(true),
      } as never,
    );

    await expect(
      service.close(user, { sessionId: "pos-1", closingCash: 1200 }),
    ).resolves.toEqual({ status: POSSessionStatus.CLOSED });
  });
});
