import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { CommerceGateService } from "./commerce-gate.service";
import { TravelRecommendationService } from "./travel-recommendation.service";
import { WorldController } from "./world.controller";
import { WorldDiscoveryService } from "./world-discovery.service";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [WorldController],
  providers: [
    CommerceGateService,
    TravelRecommendationService,
    WorldDiscoveryService,
  ],
  exports: [
    CommerceGateService,
    TravelRecommendationService,
    WorldDiscoveryService,
  ],
})
export class WorldModule {}
