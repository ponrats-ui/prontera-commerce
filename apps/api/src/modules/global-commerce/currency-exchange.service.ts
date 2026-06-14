import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

export interface CurrencyConversionInput {
  amountMinor: number;
  baseCurrencyCode: string;
  quoteCurrencyCode: string;
  at?: Date;
}

@Injectable()
export class CurrencyExchangeService {
  constructor(private readonly prisma: PrismaService) {}

  async getLatestRate(baseCurrencyCode: string, quoteCurrencyCode: string) {
    if (baseCurrencyCode === quoteCurrencyCode) {
      return null;
    }

    return this.prisma.currencyExchangeRate.findFirst({
      where: {
        baseCurrencyCode,
        quoteCurrencyCode,
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { effectiveAt: "desc" },
    });
  }

  async convertMinorUnits(input: CurrencyConversionInput): Promise<number> {
    if (input.baseCurrencyCode === input.quoteCurrencyCode) {
      return input.amountMinor;
    }

    const rate = await this.getLatestRate(
      input.baseCurrencyCode,
      input.quoteCurrencyCode,
    );

    if (!rate) {
      throw new NotFoundException(
        `Missing exchange rate ${input.baseCurrencyCode}/${input.quoteCurrencyCode}`,
      );
    }

    return Math.round(input.amountMinor * rate.rate.toNumber());
  }
}
