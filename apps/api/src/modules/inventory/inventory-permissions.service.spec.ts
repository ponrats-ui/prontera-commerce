import { InventoryMovementType, ShopStaffRole } from "@prisma/client";
import { ShopPermissionsService } from "../shops/shop-permissions.service";
import { InventoryPermissionsService } from "./inventory-permissions.service";

describe("InventoryPermissionsService", () => {
  it("allows owners and managers to manage inventory", async () => {
    const shopPermissions = {
      hasShopRole: jest.fn().mockResolvedValue(true),
      getAccess: jest.fn(),
      isShopStaff: jest.fn(),
    } as unknown as ShopPermissionsService;
    const service = new InventoryPermissionsService(shopPermissions);

    await expect(service.canManageInventory("user-1", "shop-1")).resolves.toBe(
      true,
    );
    expect(shopPermissions.hasShopRole).toHaveBeenCalledWith(
      "user-1",
      "shop-1",
      [ShopStaffRole.OWNER, ShopStaffRole.MANAGER],
    );
  });

  it("allows cashiers to create outbound movement only", async () => {
    const shopPermissions = {
      hasShopRole: jest.fn(),
      getAccess: jest.fn().mockResolvedValue({
        role: ShopStaffRole.CASHIER,
      }),
      isShopStaff: jest.fn(),
    } as unknown as ShopPermissionsService;
    const service = new InventoryPermissionsService(shopPermissions);

    await expect(
      service.canCreateMovement(
        "user-1",
        "shop-1",
        InventoryMovementType.OUTBOUND,
      ),
    ).resolves.toBe(true);
    await expect(
      service.canCreateMovement(
        "user-1",
        "shop-1",
        InventoryMovementType.INBOUND,
      ),
    ).resolves.toBe(false);
  });
});
