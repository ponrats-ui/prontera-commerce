import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { UserStatus } from "@prisma/client";
import * as argon2 from "argon2";
import request from "supertest";
import { AuthModule } from "./auth.module";
import { PrismaService } from "../database/prisma.service";

jest.mock("argon2", () => ({
  argon2id: 2,
  hash: jest.fn(),
  verify: jest.fn(),
}));

const user = {
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
  roles: [{ role: { code: "merchant" } }],
} as never;

function createPrismaMock() {
  return {
    user: {
      findFirst: jest.fn(),
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
          create: jest.fn().mockResolvedValue(user),
        },
        role: {
          findFirst: jest.fn().mockResolvedValue({ id: "role-1" }),
          create: jest.fn(),
        },
      }),
    ),
  };
}

describe("AuthController integration", () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createPrismaMock>;
  let jwtService: JwtService;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    jwtService = app.get(JwtService);

    jest.mocked(argon2.hash).mockResolvedValue("hashed-secret" as never);
    jest.mocked(argon2.verify).mockResolvedValue(true as never);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await app.close();
  });

  it("POST /auth/register creates a user session", async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: "MERCHANT@example.com ",
        password: "CorrectHorseBatteryStaple1!",
        preferredLocale: "en-US",
        preferredCurrency: "usd",
        countryCode: "us",
        timezone: "America/New_York",
      })
      .expect(201);

    expect(response.body.user.email).toBe("merchant@example.com");
    expect(response.body.user.preferredCurrency).toBe("USD");
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.refreshToken).toEqual(expect.any(String));
  });

  it("GET /auth/me returns the current user", async () => {
    prisma.user.findFirst.mockResolvedValue(user);
    const token = await jwtService.signAsync(
      {
        sub: "user-1",
        email: "merchant@example.com",
        roles: ["merchant"],
        sid: "session-1",
        typ: "access",
      },
      {
        secret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me",
        expiresIn: "15m",
      },
    );

    const response = await request(app.getHttpServer())
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: "user-1",
        email: "merchant@example.com",
        roles: ["merchant"],
      }),
    );
  });

  it("POST /auth/logout revokes the current session", async () => {
    prisma.session.updateMany.mockResolvedValue({ count: 1 });
    const token = await jwtService.signAsync(
      {
        sub: "user-1",
        email: "merchant@example.com",
        roles: ["merchant"],
        sid: "session-1",
        typ: "access",
      },
      {
        secret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me",
        expiresIn: "15m",
      },
    );

    await request(app.getHttpServer())
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    expect(prisma.session.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "session-1",
          userId: "user-1",
        }),
      }),
    );
  });
});
