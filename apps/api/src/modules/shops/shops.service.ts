import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, ShopStaffRole, ShopStatus, StaffStatus } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import type { CreateShopDto } from "./dto/create-shop.dto";
import type { CreateShopInvitationDto } from "./dto/invitation.dto";
import type { AddShopStaffDto, UpdateShopStaffDto } from "./dto/staff.dto";
import type { UpdateShopDto } from "./dto/update-shop.dto";
import { ShopPermissionsService } from "./shop-permissions.service";

const shopInclude = {
  owner: {
    select: {
      id: true,
      email: true,
      name: true,
    },
  },
  staff: {
    where: { deletedAt: null },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.ShopInclude;

@Injectable()
export class ShopsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: ShopPermissionsService,
  ) {}

  async createShop(user: AuthenticatedUser, dto: CreateShopDto) {
    await this.validateGlobalFields({
      countryCode: dto.countryCode,
      preferredCurrency: dto.preferredCurrency,
      preferredLocale: dto.preferredLocale,
      timeZone: dto.timeZone,
    });

    const existingSlug = await this.prisma.shop.findFirst({
      where: {
        slug: dto.slug,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (existingSlug) {
      throw new ConflictException("Shop slug is already in use.");
    }

    const data: Prisma.ShopCreateInput = {
      owner: { connect: { id: user.id } },
      name: dto.name,
      slug: dto.slug,
      country: { connect: { code: dto.countryCode } },
      locale: { connect: { code: dto.preferredLocale } },
      currency: { connect: { code: dto.preferredCurrency } },
      preferredLocaleRef: { connect: { code: dto.preferredLocale } },
      preferredCurrencyRef: { connect: { code: dto.preferredCurrency } },
      timeZone: dto.timeZone,
      staff: {
        create: {
          user: { connect: { id: user.id } },
          role: ShopStaffRole.OWNER,
          status: StaffStatus.ACTIVE,
          title: "Owner",
        },
      },
    };

    for (const key of [
      "description",
      "logoUrl",
      "bannerUrl",
      "contactEmail",
      "contactPhone",
    ] as const) {
      if (dto[key] !== undefined) {
        data[key] = dto[key];
      }
    }

    return this.prisma.$transaction(async (tx) =>
      tx.shop.create({
        data,
        include: shopInclude,
      }),
    );
  }

  async getMyShops(user: AuthenticatedUser) {
    return this.prisma.shop.findMany({
      where: {
        deletedAt: null,
        OR: [
          { ownerId: user.id },
          {
            staff: {
              some: {
                userId: user.id,
                status: StaffStatus.ACTIVE,
                deletedAt: null,
              },
            },
          },
        ],
      },
      include: shopInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  async getShopById(user: AuthenticatedUser, shopId: string) {
    const shop = await this.prisma.shop.findFirst({
      where: { id: shopId, deletedAt: null },
      include: shopInclude,
    });

    if (!shop) {
      throw new NotFoundException("Shop not found.");
    }

    const canView =
      shop.isPublic ||
      shop.status === ShopStatus.ACTIVE ||
      (await this.permissions.isShopStaff(user.id, shopId));

    if (!canView) {
      throw new ForbiddenException("You do not have access to this shop.");
    }

    return shop;
  }

  async updateShop(
    user: AuthenticatedUser,
    shopId: string,
    dto: UpdateShopDto,
  ) {
    if (!(await this.permissions.canManageShop(user.id, shopId))) {
      throw new ForbiddenException("You cannot manage this shop.");
    }

    await this.ensureShopExists(shopId);
    await this.validateGlobalFields(dto);

    const data: Prisma.ShopUpdateInput = {};

    for (const key of [
      "name",
      "description",
      "logoUrl",
      "bannerUrl",
      "contactEmail",
      "contactPhone",
      "timeZone",
      "status",
    ] as const) {
      if (dto[key] !== undefined) {
        data[key] = dto[key] as never;
      }
    }

    if (dto.countryCode) {
      data.country = { connect: { code: dto.countryCode } };
    }

    if (dto.preferredLocale) {
      data.locale = { connect: { code: dto.preferredLocale } };
      data.preferredLocaleRef = { connect: { code: dto.preferredLocale } };
    }

    if (dto.preferredCurrency) {
      data.currency = { connect: { code: dto.preferredCurrency } };
      data.preferredCurrencyRef = {
        connect: { code: dto.preferredCurrency },
      };
    }

    return this.prisma.shop.update({
      where: { id: shopId },
      data,
      include: shopInclude,
    });
  }

  async softDeleteShop(user: AuthenticatedUser, shopId: string) {
    if (!(await this.permissions.isShopOwner(user.id, shopId))) {
      throw new ForbiddenException("Only the shop owner can delete this shop.");
    }

    await this.ensureShopExists(shopId);

    await this.prisma.shop.update({
      where: { id: shopId },
      data: {
        status: ShopStatus.ARCHIVED,
        deletedAt: new Date(),
      },
    });

    return { success: true };
  }

  async listStaff(user: AuthenticatedUser, shopId: string) {
    if (!(await this.permissions.isShopStaff(user.id, shopId))) {
      throw new ForbiddenException(
        "You do not have access to this shop staff.",
      );
    }

    return this.prisma.shopStaff.findMany({
      where: { shopId, deletedAt: null },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async addStaff(
    user: AuthenticatedUser,
    shopId: string,
    dto: AddShopStaffDto,
  ) {
    await this.assertCanManageStaff(user.id, shopId, dto.role);

    const staffUser = await this.prisma.user.findFirst({
      where: {
        email: { equals: dto.email, mode: "insensitive" },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!staffUser) {
      throw new NotFoundException(
        "User not found. Create an invitation first.",
      );
    }

    const existingStaff = await this.prisma.shopStaff.findFirst({
      where: { shopId, userId: staffUser.id, deletedAt: null },
      select: { id: true },
    });

    if (existingStaff) {
      throw new ConflictException("User is already shop staff.");
    }

    const data: Prisma.ShopStaffUncheckedCreateInput = {
      shopId,
      userId: staffUser.id,
      role: dto.role,
      status: StaffStatus.ACTIVE,
    };

    if (dto.title !== undefined) {
      data.title = dto.title;
    }

    return this.prisma.shopStaff.create({
      data,
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async updateStaff(
    user: AuthenticatedUser,
    shopId: string,
    staffId: string,
    dto: UpdateShopStaffDto,
  ) {
    const target = await this.getStaffOrThrow(shopId, staffId);
    await this.assertCanManageStaff(user.id, shopId, target.role);

    if (
      target.role === ShopStaffRole.OWNER &&
      dto.status &&
      dto.status !== StaffStatus.ACTIVE &&
      (await this.permissions.countActiveOwners(shopId)) <= 1
    ) {
      throw new BadRequestException("Cannot remove the last OWNER.");
    }

    if (
      target.role === ShopStaffRole.OWNER &&
      dto.role &&
      dto.role !== ShopStaffRole.OWNER
    ) {
      if ((await this.permissions.countActiveOwners(shopId)) <= 1) {
        throw new BadRequestException("Cannot remove the last OWNER.");
      }
    }

    const data: Prisma.ShopStaffUpdateInput = {};

    if (dto.role !== undefined) {
      data.role = dto.role;
    }

    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    if (dto.title !== undefined) {
      data.title = dto.title;
    }

    return this.prisma.shopStaff.update({
      where: { id: staffId },
      data,
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async removeStaff(user: AuthenticatedUser, shopId: string, staffId: string) {
    const target = await this.getStaffOrThrow(shopId, staffId);
    await this.assertCanManageStaff(user.id, shopId, target.role);

    if (
      target.role === ShopStaffRole.OWNER &&
      (await this.permissions.countActiveOwners(shopId)) <= 1
    ) {
      throw new BadRequestException("Cannot remove the last OWNER.");
    }

    await this.prisma.shopStaff.update({
      where: { id: staffId },
      data: {
        status: StaffStatus.REMOVED,
        deletedAt: new Date(),
      },
    });

    return { success: true };
  }

  async createInvitation(
    user: AuthenticatedUser,
    shopId: string,
    dto: CreateShopInvitationDto,
  ) {
    await this.assertCanManageStaff(user.id, shopId, dto.role);

    if (dto.expiresAt <= new Date()) {
      throw new BadRequestException("Invitation expiry must be in the future.");
    }

    return this.prisma.shopInvitation.create({
      data: {
        shopId,
        email: dto.email,
        role: dto.role,
        expiresAt: dto.expiresAt,
      },
    });
  }

  async listInvitations(user: AuthenticatedUser, shopId: string) {
    if (!(await this.permissions.canManageStaff(user.id, shopId))) {
      throw new ForbiddenException("You cannot manage shop invitations.");
    }

    return this.prisma.shopInvitation.findMany({
      where: { shopId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  private async assertCanManageStaff(
    userId: string,
    shopId: string,
    targetRole: ShopStaffRole,
  ) {
    const access = await this.permissions.getAccess(userId, shopId);

    if (!this.permissions.canRemoveRole(access.role, targetRole)) {
      throw new ForbiddenException("You cannot manage this staff role.");
    }
  }

  private async getStaffOrThrow(shopId: string, staffId: string) {
    const staff = await this.prisma.shopStaff.findFirst({
      where: { id: staffId, shopId, deletedAt: null },
    });

    if (!staff) {
      throw new NotFoundException("Shop staff not found.");
    }

    return staff;
  }

  private async ensureShopExists(shopId: string) {
    const shop = await this.prisma.shop.findFirst({
      where: { id: shopId, deletedAt: null },
      select: { id: true },
    });

    if (!shop) {
      throw new NotFoundException("Shop not found.");
    }
  }

  private async validateGlobalFields(fields: {
    countryCode?: string;
    preferredLocale?: string;
    preferredCurrency?: string;
    timeZone?: string;
  }) {
    if (fields.timeZone) {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: fields.timeZone });
      } catch {
        throw new BadRequestException("Invalid timeZone.");
      }
    }

    const checks: Array<Promise<unknown>> = [];

    if (fields.countryCode) {
      checks.push(
        this.prisma.country
          .findFirst({
            where: {
              code: fields.countryCode,
              isActive: true,
              deletedAt: null,
            },
            select: { code: true },
          })
          .then((country) => {
            if (!country) throw new BadRequestException("Invalid countryCode.");
          }),
      );
    }

    if (fields.preferredLocale) {
      checks.push(
        this.prisma.locale
          .findFirst({
            where: { code: fields.preferredLocale, deletedAt: null },
            select: { code: true },
          })
          .then((locale) => {
            if (!locale)
              throw new BadRequestException("Invalid preferredLocale.");
          }),
      );
    }

    if (fields.preferredCurrency) {
      checks.push(
        this.prisma.currency
          .findFirst({
            where: {
              code: fields.preferredCurrency,
              isActive: true,
              deletedAt: null,
            },
            select: { code: true },
          })
          .then((currency) => {
            if (!currency) {
              throw new BadRequestException("Invalid preferredCurrency.");
            }
          }),
      );
    }

    await Promise.all(checks);
  }
}
