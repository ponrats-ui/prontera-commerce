import { JwtService } from "@nestjs/jwt";
import { UserStatus } from "@prisma/client";
import * as argon2 from "argon2";
import { AuthService } from "./auth.service";

jest.mock("argon2", () => ({
  argon2id: 2,
  hash: jest.fn(),
  verify: jest.fn(),
}));

const fixedUser = {
  id: "user-1",
  email: "merchant@example.com",
  passwordHash: "hash",
  name: "Merchant",
  status: UserStatus.ACTIVE,
  countryCode: "US",
  localeCode: "en-US",
  preferredLocale: "en-US",
  preferredCurrency: "USD",
  timeZone: "America/New_York",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  requestedGovernanceActions: [],
  reviewedGovernanceActions: [],
  roles: [{ role: { code: "merchant" } }],
} as never;

function createPrismaMock() {
  return {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(async (callback) =>
      callback({
        user: {
          create: jest.fn().mockResolvedValue(fixedUser),
        },
        role: {
          findFirst: jest.fn().mockResolvedValue({ id: "role-1" }),
          create: jest.fn(),
        },
      }),
    ),
  };
}

describe("AuthService", () => {
  beforeEach(() => {
    jest.mocked(argon2.hash).mockResolvedValue("hashed-secret" as never);
    jest.mocked(argon2.verify).mockResolvedValue(true as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("registers users with a hashed password and creates a session", async () => {
    const prisma = createPrismaMock();
    prisma.user.findFirst.mockResolvedValue(null);
    const jwtService = {
      signAsync: jest
        .fn()
        .mockResolvedValueOnce("access-token")
        .mockResolvedValueOnce("refresh-token"),
    } as unknown as JwtService;
    const service = new AuthService(prisma as never, jwtService);

    const response = await service.register({
      email: "merchant@example.com",
      password: "CorrectHorseBatteryStaple1!",
      preferredLocale: "en-US",
      preferredCurrency: "USD",
      countryCode: "US",
      timezone: "America/New_York",
    });

    expect(response.accessToken).toBe("access-token");
    expect(response.refreshToken).toBe("refresh-token");
    expect(response.user.roles).toEqual(["merchant"]);
    expect(prisma.session.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          refreshTokenHash: "hashed-secret",
        }),
      }),
    );
  });

  it("rejects duplicate registrations", async () => {
    const prisma = createPrismaMock();
    prisma.user.findFirst.mockResolvedValue({ id: "existing-user" });
    const service = new AuthService(prisma as never, {} as JwtService);

    await expect(
      service.register({
        email: "merchant@example.com",
        password: "CorrectHorseBatteryStaple1!",
      }),
    ).rejects.toThrow("Email is already registered.");
  });

  it("rotates refresh tokens by revoking the old session", async () => {
    const prisma = createPrismaMock();
    prisma.session.findFirst.mockResolvedValue({
      id: "session-1",
      refreshTokenHash: "refresh-hash",
      user: fixedUser,
    });
    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({
        sub: "user-1",
        sid: "session-1",
        typ: "refresh",
      }),
      signAsync: jest
        .fn()
        .mockResolvedValueOnce("new-access-token")
        .mockResolvedValueOnce("new-refresh-token"),
    } as unknown as JwtService;
    const service = new AuthService(prisma as never, jwtService);

    const response = await service.refresh({ refreshToken: "old-refresh" });

    expect(response.accessToken).toBe("new-access-token");
    expect(prisma.session.update).toHaveBeenCalledWith({
      where: { id: "session-1" },
      data: expect.objectContaining({
        revokedAt: expect.any(Date),
      }),
    });
    expect(prisma.session.create).toHaveBeenCalled();
  });
});
