import { ShopStaffRole } from "@prisma/client";
import { CustomerPermissionsService } from "./customer-permissions.service";

describe("CustomerPermissionsService", () => {
  it("allows owners and managers to fully manage CRM", async () => {
    const shopPermissions = {
      hasShopRole: jest.fn().mockResolvedValue(true),
      isShopStaff: jest.fn(),
    };
    const service = new CustomerPermissionsService(shopPermissions as never);

    await expect(service.canManageCustomers("user-1", "shop-1")).resolves.toBe(
      true,
    );
    expect(shopPermissions.hasShopRole).toHaveBeenCalledWith(
      "user-1",
      "shop-1",
      [ShopStaffRole.OWNER, ShopStaffRole.MANAGER],
    );
  });

  it("allows cashiers to write customer profiles without full management", async () => {
    const shopPermissions = {
      hasShopRole: jest.fn().mockResolvedValue(true),
      isShopStaff: jest.fn(),
    };
    const service = new CustomerPermissionsService(shopPermissions as never);

    await expect(service.canWriteCustomers("user-1", "shop-1")).resolves.toBe(
      true,
    );
    expect(shopPermissions.hasShopRole).toHaveBeenCalledWith(
      "user-1",
      "shop-1",
      [ShopStaffRole.OWNER, ShopStaffRole.MANAGER, ShopStaffRole.CASHIER],
    );
  });
});
