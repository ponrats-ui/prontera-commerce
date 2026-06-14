import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class ShippingZoneService {
  constructor(private readonly prisma: PrismaService) {}

  async listActiveZonesForCountry(shopId: string, countryCode: string) {
    return this.prisma.shippingZone.findMany({
      where: {
        shopId,
        status: "ACTIVE",
        deletedAt: null,
        countries: {
          some: {
            countryCode,
            deletedAt: null,
          },
        },
      },
      include: {
        countries: {
          where: { deletedAt: null },
          include: { country: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async isCountryShippable(shopId: string, countryCode: string) {
    const zone = await this.prisma.shippingZone.findFirst({
      where: {
        shopId,
        status: "ACTIVE",
        deletedAt: null,
        countries: {
          some: {
            countryCode,
            deletedAt: null,
          },
        },
      },
      select: { id: true },
    });

    return Boolean(zone);
  }
}
