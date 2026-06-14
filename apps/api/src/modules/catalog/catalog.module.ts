import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { ShopsModule } from "../shops/shops.module";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { ProductPermissionsService } from "./product-permissions.service";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
  imports: [AuthModule, DatabaseModule, ShopsModule],
  controllers: [CategoriesController, ProductsController],
  providers: [CategoriesService, ProductsService, ProductPermissionsService],
  exports: [CategoriesService, ProductsService, ProductPermissionsService],
})
export class CatalogModule {}
