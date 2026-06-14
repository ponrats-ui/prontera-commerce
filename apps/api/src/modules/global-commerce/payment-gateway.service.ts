import { Injectable } from "@nestjs/common";
import type { PaymentGatewayProvider } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

export interface PaymentGatewayCapability {
  provider: PaymentGatewayProvider;
  countries: string[];
  currencies: string[];
  localMethods: string[];
}

const gatewayCapabilities: PaymentGatewayCapability[] = [
  {
    provider: "STRIPE",
    countries: ["US", "JP", "SG", "TH", "VN"],
    currencies: ["USD", "JPY", "SGD", "THB", "VND"],
    localMethods: ["card", "apple_pay", "google_pay"],
  },
  {
    provider: "OMISE",
    countries: ["TH", "JP", "SG"],
    currencies: ["THB", "JPY", "SGD"],
    localMethods: ["card", "promptpay", "internet_banking"],
  },
  {
    provider: "XENDIT",
    countries: ["VN", "TH"],
    currencies: ["VND", "THB"],
    localMethods: ["bank_transfer", "ewallet"],
  },
  {
    provider: "PAYNOW",
    countries: ["SG"],
    currencies: ["SGD"],
    localMethods: ["paynow"],
  },
  {
    provider: "PROMPTPAY",
    countries: ["TH"],
    currencies: ["THB"],
    localMethods: ["promptpay"],
  },
];

@Injectable()
export class PaymentGatewayService {
  constructor(private readonly prisma: PrismaService) {}

  listCapabilities() {
    return gatewayCapabilities;
  }

  listCapabilitiesForMarket(countryCode: string, currencyCode: string) {
    return gatewayCapabilities.filter(
      (capability) =>
        capability.countries.includes(countryCode) &&
        capability.currencies.includes(currencyCode),
    );
  }

  async listActiveConfigurations(shopId: string) {
    return this.prisma.paymentGatewayConfiguration.findMany({
      where: {
        shopId,
        status: "ACTIVE",
        deletedAt: null,
      },
      orderBy: { provider: "asc" },
    });
  }
}
