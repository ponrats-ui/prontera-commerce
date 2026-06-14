import { Injectable } from "@nestjs/common";
import { ShopStaffRole } from "@prisma/client";
import { ShopPermissionsService } from "../shops/shop-permissions.service";

@Injectable()
export class ProductPermissionsService {
  constructor(private readonly shopPermissions: ShopPermissionsService) {}

  canManageCatalog(userId: string, shopId: string) {
    return this.shopPermissions.hasShopRole(userId, shopId, [
      ShopStaffRole.OWNER,
      ShopStaffRole.MANAGER,
    ]);
  }

  canReadCatalog(userId: string, shopId: string) {
    return this.shopPermissions.isShopStaff(userId, shopId);
  }
}
