import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { ShopsModule } from "../shops/shops.module";
import { CustomerAddressService } from "./customer-address.service";
import { CustomerPermissionsService } from "./customer-permissions.service";
import { CustomersController } from "./customers.controller";
import { CustomersService } from "./customers.service";

@Module({
  imports: [AuthModule, DatabaseModule, ShopsModule],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    CustomerAddressService,
    CustomerPermissionsService,
  ],
  exports: [
    CustomersService,
    CustomerAddressService,
    CustomerPermissionsService,
  ],
})
export class CustomersModule {}
