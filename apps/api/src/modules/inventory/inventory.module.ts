import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { ShopsModule } from "../shops/shops.module";
import { InventoryController } from "./inventory.controller";
import { InventoryPermissionsService } from "./inventory-permissions.service";
import { InventoryService } from "./inventory.service";
import { WarehousesController } from "./warehouses.controller";
import { WarehousesService } from "./warehouses.service";

@Module({
  imports: [AuthModule, DatabaseModule, ShopsModule],
  controllers: [WarehousesController, InventoryController],
  providers: [WarehousesService, InventoryService, InventoryPermissionsService],
  exports: [WarehousesService, InventoryService, InventoryPermissionsService],
})
export class InventoryModule {}
