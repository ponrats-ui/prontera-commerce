import { ShopStaffRole } from "@prisma/client";
import { ShopPermissionsService } from "../shops/shop-permissions.service";
import { ProductPermissionsService } from "./product-permissions.service";

describe("ProductPermissionsService", () => {
  it("allows owner and manager roles to manage catalog records", async () => {
    const shopPermissions = {
      hasShopRole: jest.fn().mockResolvedValue(true),
      isShopStaff: jest.fn(),
    } as unknown as ShopPermissionsService;
    const service = new ProductPermissionsService(shopPermissions);

    await expect(service.canManageCatalog("user-1", "shop-1")).resolves.toBe(
      true,
    );
    expect(shopPermissions.hasShopRole).toHaveBeenCalledWith(
      "user-1",
      "shop-1",
      [ShopStaffRole.OWNER, ShopStaffRole.MANAGER],
    );
  });

  it("uses shop staff membership for catalog read access", async () => {
    const shopPermissions = {
      hasShopRole: jest.fn(),
      isShopStaff: jest.fn().mockResolvedValue(true),
    } as unknown as ShopPermissionsService;
    const service = new ProductPermissionsService(shopPermissions);

    await expect(service.canReadCatalog("user-1", "shop-1")).resolves.toBe(
      true,
    );
    expect(shopPermissions.isShopStaff).toHaveBeenCalledWith(
      "user-1",
      "shop-1",
    );
  });
});
