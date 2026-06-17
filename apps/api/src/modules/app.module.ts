import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { CatalogModule } from "./catalog/catalog.module";
import { CustomersModule } from "./customers/customers.module";
import { FoundersModule } from "./founders/founders.module";
import { GlobalCommerceModule } from "./global-commerce/global-commerce.module";
import { InventoryModule } from "./inventory/inventory.module";
import { LiveCommerceModule } from "./live-commerce/live-commerce.module";
import { MerchantBuildingsModule } from "./merchant-buildings/merchant-buildings.module";
import { MerchantOnboardingModule } from "./merchant-onboarding/merchant-onboarding.module";
import { OrdersModule } from "./orders/orders.module";
import { PromotionsModule } from "./promotions/promotions.module";
import { ShopsModule } from "./shops/shops.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { WorldModule } from "./world/world.module";

@Module({
  imports: [
    AuthModule,
    GlobalCommerceModule,
    ShopsModule,
    CatalogModule,
    InventoryModule,
    OrdersModule,
    CustomersModule,
    FoundersModule,
    PromotionsModule,
    SubscriptionsModule,
    LiveCommerceModule,
    WorldModule,
    MerchantOnboardingModule,
    MerchantBuildingsModule,
  ],
})
export class AppModule {}
