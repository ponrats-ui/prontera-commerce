import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { WorldModule } from "../world/world.module";
import { DiscoveryController } from "./discovery.controller";
import { DiscoveryService } from "./discovery.service";

@Module({
  imports: [DatabaseModule, WorldModule],
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}
