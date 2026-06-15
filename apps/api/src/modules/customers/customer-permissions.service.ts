import { Injectable } from "@nestjs/common";
import { ShopStaffRole } from "@prisma/client";
import { ShopPermissionsService } from "../shops/shop-permissions.service";

@Injectable()
export class CustomerPermissionsService {
  constructor(private readonly shopPermissions: ShopPermissionsService) {}

  canManageCustomers(userId: string, shopId: string) {
    return this.shopPermissions.hasShopRole(userId, shopId, [
      ShopStaffRole.OWNER,
      ShopStaffRole.MANAGER,
    ]);
  }

  canWriteCustomers(userId: string, shopId: string) {
    return this.shopPermissions.hasShopRole(userId, shopId, [
      ShopStaffRole.OWNER,
      ShopStaffRole.MANAGER,
      ShopStaffRole.CASHIER,
    ]);
  }

  canReadCustomers(userId: string, shopId: string) {
    return this.shopPermissions.isShopStaff(userId, shopId);
  }
}
