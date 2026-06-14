import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

export interface LocalizationContextInput {
  requestedLocaleCode?: string;
  userLocaleCode?: string | null;
  shopLocaleCode?: string | null;
  countryCode?: string | null;
}

export interface LocalizationContext {
  localeCode: string;
  countryCode: string | null;
  currencyCode: string;
  timeZone: string;
}

const platformDefaults: LocalizationContext = {
  localeCode: "en-US",
  countryCode: "US",
  currencyCode: "USD",
  timeZone: "UTC",
};

@Injectable()
export class LocalizationService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveContext(
    input: LocalizationContextInput,
  ): Promise<LocalizationContext> {
    const localeCode =
      input.requestedLocaleCode ??
      input.userLocaleCode ??
      input.shopLocaleCode ??
      platformDefaults.localeCode;

    const locale = await this.prisma.locale.findFirst({
      where: {
        code: localeCode,
        deletedAt: null,
      },
    });

    const country = input.countryCode
      ? await this.prisma.country.findFirst({
          where: {
            code: input.countryCode,
            isActive: true,
            deletedAt: null,
          },
        })
      : null;

    return {
      localeCode: locale?.code ?? platformDefaults.localeCode,
      countryCode:
        country?.code ?? input.countryCode ?? platformDefaults.countryCode,
      currencyCode:
        country?.defaultCurrencyCode ?? platformDefaults.currencyCode,
      timeZone: country?.defaultTimeZone ?? platformDefaults.timeZone,
    };
  }

  async listActiveMarkets() {
    return this.prisma.country.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      include: {
        defaultCurrency: true,
        defaultLocale: {
          include: { language: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }
}
