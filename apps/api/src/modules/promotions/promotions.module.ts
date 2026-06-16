import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { ShopsModule } from "../shops/shops.module";
import { PromotionEngineService } from "./promotion-engine.service";
import { PromotionPermissionsService } from "./promotion-permissions.service";
import { PromotionsController } from "./promotions.controller";

@Module({
  imports: [AuthModule, DatabaseModule, ShopsModule],
  controllers: [PromotionsController],
  providers: [PromotionEngineService, PromotionPermissionsService],
  exports: [PromotionEngineService],
})
export class PromotionsModule {}
