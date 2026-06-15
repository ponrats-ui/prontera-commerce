import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { CustomerSource, CustomerStatus, ShopStaffRole } from "@prisma/client";
import request from "supertest";
import type { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PrismaService } from "../database/prisma.service";
import { CustomersModule } from "./customers.module";

const shopId = "11111111-1111-4111-8111-111111111111";
const customerId = "22222222-2222-4222-8222-222222222222";
const addressId = "33333333-3333-4333-8333-333333333333";
const groupId = "44444444-4444-4444-8444-444444444444";
const tagId = "55555555-5555-4555-8555-555555555555";

const ownerUser: AuthenticatedUser = {
  id: "owner-1",
  email: "owner@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

const cashierUser: AuthenticatedUser = {
  id: "cashier-1",
  email: "cashier@example.com",
  roles: ["merchant"],
  sessionId: "session-2",
};

const outsiderUser: AuthenticatedUser = {
  id: "outsider-1",
  email: "outsider@example.com",
  roles: ["merchant"],
  sessionId: "session-3",
};

const customer = {
  id: customerId,
  shopId,
  firstName: "Ada",
  lastName: "Merchant",
  displayName: "Ada Merchant",
  email: "ada@example.com",
  normalizedEmail: "ada@example.com",
  phone: "+15551234567",
  normalizedPhone: "+15551234567",
  birthDate: null,
  gender: null,
  preferredLocale: "en-US",
  preferredCurrency: "USD",
  countryCode: "US",
  timeZone: "America/New_York",
  status: CustomerStatus.ACTIVE,
  source: CustomerSource.MANUAL,
  deletedAt: null,
};

function roleFor(userId: string) {
  if (userId === ownerUser.id) return ShopStaffRole.OWNER;
  if (userId === cashierUser.id) return ShopStaffRole.CASHIER;
  return null;
}

function createPrismaMock(getCurrentUser: () => AuthenticatedUser) {
  const tx = {
    customer: {
      create: jest.fn().mockResolvedValue(customer),
      update: jest
        .fn()
        .mockResolvedValue({ ...customer, displayName: "Updated" }),
    },
    customerAddress: {
      updateMany: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: addressId, customerId }),
    },
    customerNote: {
      create: jest.fn().mockResolvedValue({ id: "note-1", customerId }),
    },
    customerActivity: {
      create: jest.fn(),
    },
    customerGroupMember: {
      create: jest.fn().mockResolvedValue({ id: "group-member-1" }),
    },
    customerTagAssignment: {
      create: jest.fn().mockResolvedValue({ id: "tag-assignment-1" }),
    },
  };

  return {
    shop: {
      findFirst: jest.fn(() => {
        const role = roleFor(getCurrentUser().id);
        return Promise.resolve({
          ownerId: ownerUser.id,
          staff: role ? [{ role }] : [],
        });
      }),
    },
    customer: {
      findFirst: jest.fn((args) => {
        if (args.where?.id === customerId) return Promise.resolve(customer);
        return Promise.resolve(null);
      }),
      findMany: jest.fn().mockResolvedValue([customer]),
      update: jest
        .fn()
        .mockResolvedValue({ ...customer, deletedAt: new Date() }),
    },
    customerAddress: {
      findFirst: jest.fn().mockResolvedValue({ id: addressId }),
      findMany: jest.fn().mockResolvedValue([{ id: addressId, customerId }]),
      update: jest.fn().mockResolvedValue({ id: addressId, customerId }),
    },
    customerNote: {
      findMany: jest.fn().mockResolvedValue([{ id: "note-1", customerId }]),
    },
    customerGroup: {
      findFirst: jest.fn((args) => {
        if (args.where?.id === groupId) {
          return Promise.resolve({ id: groupId, shopId, name: "VIP" });
        }
        return Promise.resolve(null);
      }),
      findMany: jest
        .fn()
        .mockResolvedValue([{ id: groupId, shopId, name: "VIP" }]),
      create: jest.fn().mockResolvedValue({ id: groupId, shopId, name: "VIP" }),
      update: jest.fn().mockResolvedValue({ id: groupId, shopId, name: "VIP" }),
    },
    customerGroupMember: {
      findFirst: jest.fn().mockResolvedValue(null),
      updateMany: jest.fn(),
    },
    customerTag: {
      findFirst: jest.fn((args) => {
        if (args.where?.id === tagId) {
          return Promise.resolve({ id: tagId, shopId, name: "high-value" });
        }
        return Promise.resolve(null);
      }),
      findMany: jest
        .fn()
        .mockResolvedValue([{ id: tagId, shopId, name: "high-value" }]),
      create: jest
        .fn()
        .mockResolvedValue({ id: tagId, shopId, name: "high-value" }),
      update: jest
        .fn()
        .mockResolvedValue({ id: tagId, shopId, name: "high-value" }),
    },
    customerTagAssignment: {
      findFirst: jest.fn().mockResolvedValue(null),
      updateMany: jest.fn(),
    },
    customerActivity: {
      findMany: jest.fn().mockResolvedValue([{ id: "activity-1", customerId }]),
    },
    customerLoyaltyAccount: {
      findFirst: jest.fn().mockResolvedValue({
        id: "loyalty-1",
        customerId,
        pointsBalance: 0,
        lifetimePoints: 0,
        tier: "BRONZE",
        status: "ACTIVE",
      }),
      create: jest.fn(),
      update: jest.fn().mockResolvedValue({
        id: "loyalty-1",
        customerId,
        pointsBalance: 10,
      }),
    },
    $transaction: jest.fn((callback) => callback(tx)),
    tx,
  };
}

describe("CustomersController (integration)", () => {
  let app: INestApplication;
  let currentUser = ownerUser;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    currentUser = ownerUser;
    prisma = createPrismaMock(() => currentUser);

    const moduleRef = await Test.createTestingModule({
      imports: [CustomersModule],
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
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("creates and lists customers", async () => {
    await request(app.getHttpServer())
      .post(`/shops/${shopId}/customers`)
      .send({
        firstName: "Ada",
        lastName: "Merchant",
        email: "ada@example.com",
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/shops/${shopId}/customers`)
      .expect(200);

    expect(response.body).toHaveLength(1);
  });

  it("updates a customer", async () => {
    await request(app.getHttpServer())
      .patch(`/customers/${customerId}`)
      .send({ displayName: "Updated" })
      .expect(200);
  });

  it("adds an address and note", async () => {
    currentUser = cashierUser;

    await request(app.getHttpServer())
      .post(`/customers/${customerId}/addresses`)
      .send({ addressLine1: "123 Main", countryCode: "US" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/customers/${customerId}/notes`)
      .send({ note: "Prefers counter pickup." })
      .expect(201);
  });

  it("adds tag and group assignments", async () => {
    await request(app.getHttpServer())
      .post(`/shops/${shopId}/customer-groups`)
      .send({ name: "VIP" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/shops/${shopId}/customer-tags`)
      .send({ name: "high-value", color: "#0f766e" })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/customers/${customerId}/groups/${groupId}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/customers/${customerId}/tags/${tagId}`)
      .expect(201);
  });

  it("blocks unauthorized customer access", async () => {
    currentUser = outsiderUser;

    await request(app.getHttpServer())
      .get(`/shops/${shopId}/customers`)
      .expect(403);
  });
});
