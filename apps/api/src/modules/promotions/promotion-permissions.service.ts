import { Injectable } from "@nestjs/common";
import { ShopStaffRole } from "@prisma/client";
import { ShopPermissionsService } from "../shops/shop-permissions.service";

@Injectable()
export class PromotionPermissionsService {
  constructor(private readonly shopPermissions: ShopPermissionsService) {}

  canReadPromotions(userId: string, shopId: string) {
    return this.shopPermissions.isShopStaff(userId, shopId);
  }

  canManagePromotions(userId: string, shopId: string) {
    return this.shopPermissions.hasShopRole(userId, shopId, [
      ShopStaffRole.OWNER,
      ShopStaffRole.MANAGER,
    ]);
  }
}
