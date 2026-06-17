import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { ShopsModule } from "../shops/shops.module";
import { AdminMerchantBuildingsController } from "./admin-merchant-buildings.controller";
import { MerchantBuildingsController } from "./merchant-buildings.controller";
import { MerchantBuildingsService } from "./merchant-buildings.service";
import { MerchantProfileController } from "./merchant-profile.controller";

@Module({
  imports: [AuthModule, DatabaseModule, ShopsModule],
  controllers: [
    MerchantBuildingsController,
    AdminMerchantBuildingsController,
    MerchantProfileController,
  ],
  providers: [MerchantBuildingsService],
  exports: [MerchantBuildingsService],
})
export class MerchantBuildingsModule {}
