import { Injectable } from "@nestjs/common";
import { InventoryMovementType, ShopStaffRole } from "@prisma/client";
import { ShopPermissionsService } from "../shops/shop-permissions.service";

@Injectable()
export class InventoryPermissionsService {
  constructor(private readonly shopPermissions: ShopPermissionsService) {}

  canManageInventory(userId: string, shopId: string) {
    return this.shopPermissions.hasShopRole(userId, shopId, [
      ShopStaffRole.OWNER,
      ShopStaffRole.MANAGER,
    ]);
  }

  async canCreateMovement(
    userId: string,
    shopId: string,
    movementType: InventoryMovementType,
  ) {
    const access = await this.shopPermissions.getAccess(userId, shopId);

    if (
      access.role === ShopStaffRole.OWNER ||
      access.role === ShopStaffRole.MANAGER
    ) {
      return true;
    }

    return (
      access.role === ShopStaffRole.CASHIER &&
      movementType === InventoryMovementType.OUTBOUND
    );
  }

  canReadInventory(userId: string, shopId: string) {
    return this.shopPermissions.isShopStaff(userId, shopId);
  }
}
