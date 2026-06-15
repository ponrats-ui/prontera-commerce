import { ConflictException, NotFoundException } from "@nestjs/common";
import { CommerceGateStatus, CommerceGateType } from "@prisma/client";
import { CommerceGateService } from "./commerce-gate.service";
import { TravelRecommendationService } from "./travel-recommendation.service";

const zone = {
  id: "zone-1",
  code: "PRONTERA",
  name: "Prontera",
};

const district = {
  id: "district-1",
  zoneId: zone.id,
  code: "FASHION_STREET",
  name: "Fashion Street",
  category: "FASHION",
};

function createPrismaMock() {
  return {
    worldZone: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(zone),
      findMany: jest.fn().mockResolvedValue([zone]),
    },
    worldDistrict: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(district),
      findMany: jest.fn().mockResolvedValue([district]),
    },
    commerceGate: {
      create: jest.fn().mockResolvedValue({
        id: "gate-1",
        sourceZoneId: zone.id,
        destinationZoneId: "zone-2",
        gateType: CommerceGateType.CITY_GATE,
        status: CommerceGateStatus.ACTIVE,
      }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };
}

describe("CommerceGateService", () => {
  it("creates a world zone", async () => {
    const prisma = createPrismaMock();
    const service = new CommerceGateService(
      prisma as never,
      new TravelRecommendationService(),
    );

    await service.createZone({
      code: "PRONTERA",
      name: "Prontera",
    });

    expect(prisma.worldZone.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          code: "PRONTERA",
          status: "ACTIVE",
        }),
      }),
    );
  });

  it("blocks duplicate zone codes", async () => {
    const prisma = createPrismaMock();
    prisma.worldZone.findFirst.mockResolvedValueOnce({ id: zone.id });
    const service = new CommerceGateService(
      prisma as never,
      new TravelRecommendationService(),
    );

    await expect(
      service.createZone({ code: "PRONTERA", name: "Prontera" }),
    ).rejects.toThrow(ConflictException);
  });

  it("creates a commerce gate after validating destinations", async () => {
    const prisma = createPrismaMock();
    prisma.worldZone.findFirst.mockResolvedValue({ id: zone.id });
    prisma.worldDistrict.findFirst.mockResolvedValue({ id: district.id });
    const service = new CommerceGateService(
      prisma as never,
      new TravelRecommendationService(),
    );

    await service.createGate({
      sourceZoneId: zone.id,
      destinationZoneId: "zone-2",
      sourceDistrictId: district.id,
      destinationDistrictId: "district-2",
      title: "Fashion Gate",
      gateType: CommerceGateType.DISTRICT_GATE,
    });

    expect(prisma.commerceGate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Fashion Gate",
          gateType: CommerceGateType.DISTRICT_GATE,
        }),
      }),
    );
  });

  it("rejects gates with missing zones", async () => {
    const prisma = createPrismaMock();
    const service = new CommerceGateService(
      prisma as never,
      new TravelRecommendationService(),
    );

    await expect(
      service.createGate({
        sourceZoneId: zone.id,
        destinationZoneId: "zone-2",
        title: "Broken Gate",
        gateType: CommerceGateType.CITY_GATE,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
