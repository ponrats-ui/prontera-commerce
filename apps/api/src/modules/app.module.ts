import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { CatalogModule } from "./catalog/catalog.module";
import { GlobalCommerceModule } from "./global-commerce/global-commerce.module";
import { ShopsModule } from "./shops/shops.module";

@Module({
  imports: [AuthModule, GlobalCommerceModule, ShopsModule, CatalogModule],
})
export class AppModule {}
