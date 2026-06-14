import { Injectable } from "@nestjs/common";
import { ShopStaffRole, StaffStatus } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";

export interface ShopAccess {
  isOwner: boolean;
  isStaff: boolean;
  role: ShopStaffRole | null;
}

@Injectable()
export class ShopPermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccess(userId: string, shopId: string): Promise<ShopAccess> {
    const shop = await this.prisma.shop.findFirst({
      where: { id: shopId, deletedAt: null },
      select: {
        ownerId: true,
        staff: {
          where: {
            userId,
            status: StaffStatus.ACTIVE,
            deletedAt: null,
          },
          select: { role: true },
          take: 1,
        },
      },
    });

    const role = shop?.staff[0]?.role ?? null;
    const isOwner = shop?.ownerId === userId || role === ShopStaffRole.OWNER;

    return {
      isOwner,
      isStaff: Boolean(role),
      role: isOwner ? ShopStaffRole.OWNER : role,
    };
  }

  async isShopOwner(userId: string, shopId: string) {
    return (await this.getAccess(userId, shopId)).isOwner;
  }

  async isShopStaff(userId: string, shopId: string) {
    const access = await this.getAccess(userId, shopId);
    return access.isOwner || access.isStaff;
  }

  async hasShopRole(userId: string, shopId: string, roles: ShopStaffRole[]) {
    const access = await this.getAccess(userId, shopId);
    return Boolean(access.role && roles.includes(access.role));
  }

  async canManageShop(userId: string, shopId: string) {
    return this.hasShopRole(userId, shopId, [
      ShopStaffRole.OWNER,
      ShopStaffRole.MANAGER,
    ]);
  }

  async canManageStaff(userId: string, shopId: string) {
    return this.hasShopRole(userId, shopId, [
      ShopStaffRole.OWNER,
      ShopStaffRole.MANAGER,
    ]);
  }

  canRemoveRole(actorRole: ShopStaffRole | null, targetRole: ShopStaffRole) {
    if (actorRole === ShopStaffRole.OWNER) {
      return true;
    }

    if (actorRole === ShopStaffRole.MANAGER) {
      return (
        targetRole !== ShopStaffRole.OWNER &&
        targetRole !== ShopStaffRole.MANAGER
      );
    }

    return false;
  }

  async countActiveOwners(shopId: string) {
    return this.prisma.shopStaff.count({
      where: {
        shopId,
        role: ShopStaffRole.OWNER,
        status: StaffStatus.ACTIVE,
        deletedAt: null,
      },
    });
  }
}
