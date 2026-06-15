import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { CommerceGateStatus, CommerceGateType } from "@prisma/client";
import request from "supertest";
import type { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PrismaService } from "../database/prisma.service";
import { WorldModule } from "./world.module";

const zoneId = "11111111-1111-4111-8111-111111111111";
const destinationZoneId = "22222222-2222-4222-8222-222222222222";
const districtId = "33333333-3333-4333-8333-333333333333";
const gateId = "44444444-4444-4444-8444-444444444444";

const adminUser: AuthenticatedUser = {
  id: "admin-1",
  email: "admin@example.com",
  roles: ["admin"],
  sessionId: "session-1",
};

const zone = {
  id: zoneId,
  code: "PRONTERA",
  name: "Prontera",
  description: null,
  status: "ACTIVE",
  thumbnailUrl: null,
  mapImageUrl: null,
  sortOrder: 0,
};

const district = {
  id: districtId,
  zoneId,
  code: "FASHION_STREET",
  name: "Fashion Street",
  description: null,
  category: "FASHION",
  sortOrder: 0,
  zone,
};

const gate = {
  id: gateId,
  sourceZoneId: zoneId,
  destinationZoneId,
  sourceDistrictId: null,
  destinationDistrictId: districtId,
  title: "Prontera Fashion Gate",
  description: null,
  gateType: CommerceGateType.DISTRICT_GATE,
  status: CommerceGateStatus.ACTIVE,
  sourceZone: zone,
  destinationZone: { ...zone, id: destinationZoneId, code: "GEFFEN" },
  sourceDistrict: null,
  destinationDistrict: district,
};

function createPrismaMock() {
  return {
    worldZone: {
      findFirst: jest.fn().mockResolvedValue({ id: zoneId }),
      create: jest.fn().mockResolvedValue(zone),
      findMany: jest.fn().mockResolvedValue([zone]),
    },
    worldDistrict: {
      findFirst: jest.fn().mockResolvedValue({ id: districtId }),
      create: jest.fn().mockResolvedValue(district),
      findMany: jest.fn().mockResolvedValue([district]),
    },
    commerceGate: {
      create: jest.fn().mockResolvedValue(gate),
      findMany: jest.fn().mockResolvedValue([gate]),
    },
  };
}

describe("WorldController (integration)", () => {
  let app: INestApplication;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const moduleRef = await Test.createTestingModule({
      imports: [WorldModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => { getRequest: () => { user: AuthenticatedUser } };
        }) => {
          context.switchToHttp().getRequest().user = adminUser;
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

  it("creates a zone", async () => {
    prisma.worldZone.findFirst.mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .post("/world/zones")
      .send({ code: "PRONTERA", name: "Prontera" })
      .expect(201);
  });

  it("creates a district", async () => {
    prisma.worldDistrict.findFirst.mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .post("/world/districts")
      .send({
        zoneId,
        code: "FASHION_STREET",
        name: "Fashion Street",
        category: "FASHION",
      })
      .expect(201);
  });

  it("creates a commerce gate", async () => {
    await request(app.getHttpServer())
      .post("/world/gates")
      .send({
        sourceZoneId: zoneId,
        destinationZoneId,
        destinationDistrictId: districtId,
        title: "Prontera Fashion Gate",
        gateType: "DISTRICT_GATE",
      })
      .expect(201);
  });

  it("lists available gates", async () => {
    const response = await request(app.getHttpServer())
      .get("/world/gates/available")
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe(CommerceGateStatus.ACTIVE);
  });

  it("returns travel recommendations", async () => {
    const response = await request(app.getHttpServer())
      .get("/world/travel?searchTerm=keyboard")
      .expect(200);

    expect(response.body.recommendations).toEqual([
      expect.objectContaining({ label: "AI District" }),
    ]);
  });
});
