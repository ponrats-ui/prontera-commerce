import { ShopStaffRole, StaffStatus } from "@prisma/client";
import { ShopPermissionsService } from "./shop-permissions.service";

function createPrismaMock() {
  return {
    shop: {
      findFirst: jest.fn(),
    },
    shopStaff: {
      count: jest.fn(),
    },
  };
}

describe("ShopPermissionsService", () => {
  it("treats the shop owner as OWNER even without a staff row", async () => {
    const prisma = createPrismaMock();
    prisma.shop.findFirst.mockResolvedValue({
      ownerId: "user-1",
      staff: [],
    });
    const service = new ShopPermissionsService(prisma as never);

    await expect(service.getAccess("user-1", "shop-1")).resolves.toEqual({
      isOwner: true,
      isStaff: false,
      role: ShopStaffRole.OWNER,
    });
  });

  it("allows managers to manage staff roles but not owners or managers", () => {
    const service = new ShopPermissionsService(createPrismaMock() as never);

    expect(
      service.canRemoveRole(ShopStaffRole.MANAGER, ShopStaffRole.STAFF),
    ).toBe(true);
    expect(
      service.canRemoveRole(ShopStaffRole.MANAGER, ShopStaffRole.CASHIER),
    ).toBe(true);
    expect(
      service.canRemoveRole(ShopStaffRole.MANAGER, ShopStaffRole.MANAGER),
    ).toBe(false);
    expect(
      service.canRemoveRole(ShopStaffRole.MANAGER, ShopStaffRole.OWNER),
    ).toBe(false);
  });

  it("counts active owners for last-owner protection", async () => {
    const prisma = createPrismaMock();
    prisma.shopStaff.count.mockResolvedValue(2);
    const service = new ShopPermissionsService(prisma as never);

    await expect(service.countActiveOwners("shop-1")).resolves.toBe(2);
    expect(prisma.shopStaff.count).toHaveBeenCalledWith({
      where: {
        shopId: "shop-1",
        role: ShopStaffRole.OWNER,
        status: StaffStatus.ACTIVE,
        deletedAt: null,
      },
    });
  });
});
