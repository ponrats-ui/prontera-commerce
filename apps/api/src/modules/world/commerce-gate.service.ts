import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CommerceGateStatus,
  Prisma,
  WorldZoneStatus,
} from "@prisma/client";
import type {
  CreateCommerceGateDto,
  CreateWorldDistrictDto,
  CreateWorldZoneDto,
  TravelQueryDto,
} from "./dto/world.dto";
import { PrismaService } from "../database/prisma.service";
import { TravelRecommendationService } from "./travel-recommendation.service";

const districtInclude = {
  zone: {
    select: {
      id: true,
      code: true,
      name: true,
      status: true,
    },
  },
} satisfies Prisma.WorldDistrictInclude;

const gateInclude = {
  sourceZone: {
    select: { id: true, code: true, name: true },
  },
  destinationZone: {
    select: { id: true, code: true, name: true },
  },
  sourceDistrict: {
    select: { id: true, code: true, name: true, category: true },
  },
  destinationDistrict: {
    select: { id: true, code: true, name: true, category: true },
  },
} satisfies Prisma.CommerceGateInclude;

@Injectable()
export class CommerceGateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recommendations: TravelRecommendationService,
  ) {}

  async createZone(dto: CreateWorldZoneDto) {
    await this.assertUniqueZoneCode(dto.code);

    return this.prisma.worldZone.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description ?? null,
        status: dto.status ?? WorldZoneStatus.ACTIVE,
        thumbnailUrl: dto.thumbnailUrl ?? null,
        mapImageUrl: dto.mapImageUrl ?? null,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  listZones() {
    return this.prisma.worldZone.findMany({
      where: { status: WorldZoneStatus.ACTIVE },
      include: {
        districts: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  async getZone(id: string) {
    const zone = await this.prisma.worldZone.findFirst({
      where: { id },
      include: {
        districts: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
    });

    if (!zone) {
      throw new NotFoundException("World zone not found");
    }

    return zone;
  }

  async createDistrict(dto: CreateWorldDistrictDto) {
    await this.assertZoneExists(dto.zoneId);
    await this.assertUniqueDistrictCode(dto.zoneId, dto.code);

    return this.prisma.worldDistrict.create({
      data: {
        zoneId: dto.zoneId,
        code: dto.code,
        name: dto.name,
        description: dto.description ?? null,
        category: dto.category,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: districtInclude,
    });
  }

  listDistricts() {
    return this.prisma.worldDistrict.findMany({
      include: districtInclude,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  async listZoneDistricts(zoneId: string) {
    await this.assertZoneExists(zoneId);

    return this.prisma.worldDistrict.findMany({
      where: { zoneId },
      include: districtInclude,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  }

  async createGate(dto: CreateCommerceGateDto) {
    await this.assertZoneExists(dto.sourceZoneId);
    await this.assertZoneExists(dto.destinationZoneId);

    if (dto.sourceDistrictId) {
      await this.assertDistrictBelongsToZone(
        dto.sourceDistrictId,
        dto.sourceZoneId,
        "Source district must belong to source zone.",
      );
    }

    if (dto.destinationDistrictId) {
      await this.assertDistrictBelongsToZone(
        dto.destinationDistrictId,
        dto.destinationZoneId,
        "Destination district must belong to destination zone.",
      );
    }

    return this.prisma.commerceGate.create({
      data: {
        sourceZoneId: dto.sourceZoneId,
        destinationZoneId: dto.destinationZoneId,
        sourceDistrictId: dto.sourceDistrictId ?? null,
        destinationDistrictId: dto.destinationDistrictId ?? null,
        title: dto.title,
        description: dto.description ?? null,
        gateType: dto.gateType,
        status: dto.status ?? CommerceGateStatus.ACTIVE,
      },
      include: gateInclude,
    });
  }

  listGates() {
    return this.prisma.commerceGate.findMany({
      include: gateInclude,
      orderBy: [{ status: "asc" }, { title: "asc" }],
    });
  }

  listAvailableGates() {
    return this.prisma.commerceGate.findMany({
      where: { status: CommerceGateStatus.ACTIVE },
      include: gateInclude,
      orderBy: [{ gateType: "asc" }, { title: "asc" }],
    });
  }

  async getTravelOverview(query: TravelQueryDto) {
    const [zones, districts, gates] = await Promise.all([
      this.listZones(),
      this.listDistricts(),
      this.listAvailableGates(),
    ]);

    return {
      zones,
      districts,
      gates,
      recommendations: this.recommendations.recommend(query.searchTerm),
    };
  }

  private async assertUniqueZoneCode(code: string) {
    const existing = await this.prisma.worldZone.findFirst({
      where: { code },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("World zone code already exists.");
    }
  }

  private async assertUniqueDistrictCode(zoneId: string, code: string) {
    const existing = await this.prisma.worldDistrict.findFirst({
      where: { zoneId, code },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("World district code already exists.");
    }
  }

  private async assertZoneExists(id: string) {
    const zone = await this.prisma.worldZone.findFirst({
      where: { id },
      select: { id: true },
    });

    if (!zone) {
      throw new NotFoundException("World zone not found");
    }
  }

  private async assertDistrictBelongsToZone(
    districtId: string,
    zoneId: string,
    message: string,
  ) {
    const district = await this.prisma.worldDistrict.findFirst({
      where: { id: districtId, zoneId },
      select: { id: true },
    });

    if (!district) {
      throw new NotFoundException(message);
    }
  }
}
