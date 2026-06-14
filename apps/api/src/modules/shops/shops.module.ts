import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { ShopPermissionsService } from "./shop-permissions.service";
import { ShopsController } from "./shops.controller";
import { ShopsService } from "./shops.service";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [ShopsController],
  providers: [ShopPermissionsService, ShopsService],
  exports: [ShopPermissionsService, ShopsService],
})
export class ShopsModule {}
