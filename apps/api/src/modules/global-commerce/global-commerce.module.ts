import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { CurrencyExchangeService } from "./currency-exchange.service";
import { LocalizationService } from "./localization.service";
import { PaymentGatewayService } from "./payment-gateway.service";
import { ShippingZoneService } from "./shipping-zone.service";
import { TaxProfileService } from "./tax-profile.service";

@Module({
  imports: [DatabaseModule],
  providers: [
    CurrencyExchangeService,
    LocalizationService,
    PaymentGatewayService,
    ShippingZoneService,
    TaxProfileService,
  ],
  exports: [
    CurrencyExchangeService,
    LocalizationService,
    PaymentGatewayService,
    ShippingZoneService,
    TaxProfileService,
  ],
})
export class GlobalCommerceModule {}
