import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { ShopsModule } from "../shops/shops.module";
import { CartController } from "./cart.controller";
import { CartsService } from "./carts.service";
import { CheckoutController } from "./checkout.controller";
import { CheckoutService } from "./checkout.service";
import { OrderPermissionsService } from "./order-permissions.service";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { POSController } from "./pos.controller";
import { POSService } from "./pos.service";

@Module({
  imports: [AuthModule, DatabaseModule, ShopsModule],
  controllers: [
    CartController,
    OrdersController,
    CheckoutController,
    POSController,
  ],
  providers: [
    CartsService,
    OrdersService,
    CheckoutService,
    POSService,
    OrderPermissionsService,
  ],
  exports: [CartsService, OrdersService, CheckoutService, POSService],
})
export class OrdersModule {}
