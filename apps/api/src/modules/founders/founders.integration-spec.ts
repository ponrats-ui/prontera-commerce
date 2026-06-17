import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { FounderApplicationStatus } from "@prisma/client";
import request from "supertest";
import type { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PrismaService } from "../database/prisma.service";
import { FoundersModule } from "./founders.module";

const user: AuthenticatedUser = {
  id: "admin-1",
  email: "admin@example.com",
  roles: ["admin"],
  sessionId: "session-1",
};
const shopId = "11111111-1111-4111-8111-111111111111";

const application = {
  id: "application-1",
  merchantName: "COM",
  businessName: "Velora PC",
  businessType: "Computer Store",
  category: "IT Equipment",
  website: null,
  facebookPage: null,
  email: "merchant@example.com",
  phone: "+66812345678",
  motivation: "I want to help build the first merchant civilization.",
  status: FounderApplicationStatus.PENDING,
  reviewedBy: null,
  reviewNotes: null,
  submittedAt: new Date("2026-06-17T00:00:00.000Z"),
  reviewedAt: null,
};

function createPrismaMock() {
  const tx = {
    shop: {
      findFirst: jest.fn().mockResolvedValue({
        id: "shop-1",
        name: "Velora PC",
        slug: "velora-pc",
      }),
    },
    founderApplication: {
      update: jest.fn().mockResolvedValue({
        ...application,
        status: FounderApplicationStatus.APPROVED,
      }),
    },
    founderMerchantProgram: {
      upsert: jest.fn().mockResolvedValue({
        id: "founder-1",
        shopId: "shop-1",
        isFounderMerchant: true,
      }),
    },
    subscriptionPlan: {
      upsert: jest.fn(),
      findFirst: jest.fn().mockResolvedValue({
        id: "pro-plan",
        planType: "PRO",
      }),
    },
    merchantSubscription: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: "sub-1", status: "TRIAL" }),
    },
    merchantWorldLocation: { updateMany: jest.fn() },
    merchantBuilding: { updateMany: jest.fn() },
  };

  return {
    founderApplication: {
      create: jest.fn().mockResolvedValue(application),
      findFirst: jest.fn().mockResolvedValue(application),
      findMany: jest.fn().mockResolvedValue([application]),
      count: jest.fn().mockResolvedValue(1),
    },
    founderMerchantProgram: {
      count: jest.fn().mockResolvedValue(1),
    },
    shop: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    $transaction: jest.fn((callback) => callback(tx)),
  };
}

describe("FoundersController integration", () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const moduleRef = await Test.createTestingModule({
      imports: [FoundersModule],
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

  it("submits a Founder Merchant application", async () => {
    const response = await request(app.getHttpServer())
      .post("/founders/applications")
      .send({
        merchantName: "COM",
        businessName: "Velora PC",
        businessType: "Computer Store",
        category: "IT Equipment",
        email: "merchant@example.com",
        phone: "+66812345678",
        motivation: "I want to help build the first merchant civilization.",
      })
      .expect(201);

    expect(response.body.application.status).toBe(
      FounderApplicationStatus.PENDING,
    );
  });

  it("lists applications for admin review", async () => {
    const response = await request(app.getHttpServer())
      .get("/admin/founders")
      .expect(200);

    expect(response.body).toHaveLength(1);
  });

  it("approves applications", async () => {
    const response = await request(app.getHttpServer())
      .patch("/admin/founders/application-1/approve")
      .send({ shopId, reviewNotes: "Approved." })
      .expect(200);

    expect(response.body.founderProgram.isFounderMerchant).toBe(true);
  });
});
