import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

export interface TaxCalculationInput {
  shopId: string;
  countryCode: string;
  subtotalCents: number;
  shippingCents?: number;
}

export interface TaxCalculationResult {
  profileId: string | null;
  taxCents: number;
  totalCents: number;
  pricesIncludeTax: boolean;
}

@Injectable()
export class TaxProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveProfile(shopId: string, countryCode: string) {
    return this.prisma.taxProfile.findFirst({
      where: {
        shopId,
        countryCode,
        status: "ACTIVE",
        deletedAt: null,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async calculateTax(
    input: TaxCalculationInput,
  ): Promise<TaxCalculationResult> {
    const profile = await this.getActiveProfile(
      input.shopId,
      input.countryCode,
    );

    if (!profile) {
      return {
        profileId: null,
        taxCents: 0,
        totalCents: input.subtotalCents + (input.shippingCents ?? 0),
        pricesIncludeTax: false,
      };
    }

    const taxableShippingCents = profile.appliesToShipping
      ? (input.shippingCents ?? 0)
      : 0;
    const taxableBaseCents = input.subtotalCents + taxableShippingCents;
    const taxCents = Math.round((taxableBaseCents * profile.rateBps) / 10_000);
    const totalCents = profile.pricesIncludeTax
      ? input.subtotalCents + (input.shippingCents ?? 0)
      : input.subtotalCents + (input.shippingCents ?? 0) + taxCents;

    return {
      profileId: profile.id,
      taxCents,
      totalCents,
      pricesIncludeTax: profile.pricesIncludeTax,
    };
  }
}
