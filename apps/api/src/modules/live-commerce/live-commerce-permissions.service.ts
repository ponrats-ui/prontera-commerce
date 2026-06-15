import { Injectable } from "@nestjs/common";
import { ShopStaffRole } from "@prisma/client";
import { ShopPermissionsService } from "../shops/shop-permissions.service";

@Injectable()
export class LiveCommercePermissionsService {
  constructor(private readonly shopPermissions: ShopPermissionsService) {}

  canReadLiveCommerce(userId: string, shopId: string) {
    return this.shopPermissions.isShopStaff(userId, shopId);
  }

  canManageLiveCommerce(userId: string, shopId: string) {
    return this.shopPermissions.hasShopRole(userId, shopId, [
      ShopStaffRole.OWNER,
      ShopStaffRole.MANAGER,
    ]);
  }
}
