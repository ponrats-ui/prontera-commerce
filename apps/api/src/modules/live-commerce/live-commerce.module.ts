import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { ShopsModule } from "../shops/shops.module";
import { LiveCommerceController } from "./live-commerce.controller";
import { LiveCommercePermissionsService } from "./live-commerce-permissions.service";
import { LiveCommercePlanAccessService } from "./live-commerce-plan-access.service";
import { LiveCommerceService } from "./live-commerce.service";

@Module({
  imports: [AuthModule, DatabaseModule, ShopsModule],
  controllers: [LiveCommerceController],
  providers: [
    LiveCommerceService,
    LiveCommercePermissionsService,
    LiveCommercePlanAccessService,
  ],
  exports: [
    LiveCommerceService,
    LiveCommercePermissionsService,
    LiveCommercePlanAccessService,
  ],
})
export class LiveCommerceModule {}
