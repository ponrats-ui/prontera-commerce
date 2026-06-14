import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, WarehouseStatus } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import type {
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from "./dto/warehouse.dto";
import { InventoryPermissionsService } from "./inventory-permissions.service";

const warehouseInclude = {
  country: { select: { code: true, name: true } },
} satisfies Prisma.WarehouseInclude;

@Injectable()
export class WarehousesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: InventoryPermissionsService,
  ) {}

  async createWarehouse(
    user: AuthenticatedUser,
    shopId: string,
    dto: CreateWarehouseDto,
  ) {
    await this.assertCanManage(user.id, shopId);
    await this.validateCountryAndTimezone(dto.countryCode, dto.timezone);
    await this.assertUniqueCode(shopId, dto.code);

    const data: Prisma.WarehouseCreateInput = {
      shop: { connect: { id: shopId } },
      country: { connect: { code: dto.countryCode } },
      name: dto.name,
      code: dto.code,
      timeZone: dto.timezone,
      status: dto.status ?? WarehouseStatus.ACTIVE,
    };

    if (dto.address !== undefined) {
      data.address = dto.address;
    }

    return this.prisma.warehouse.create({ data, include: warehouseInclude });
  }

  async listWarehouses(user: AuthenticatedUser, shopId: string) {
    await this.assertCanRead(user.id, shopId);

    return this.prisma.warehouse.findMany({
      where: { shopId, deletedAt: null },
      include: warehouseInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  async getWarehouse(user: AuthenticatedUser, warehouseId: string) {
    const warehouse = await this.getWarehouseOrThrow(warehouseId);
    await this.assertCanRead(user.id, warehouse.shopId);
    return warehouse;
  }

  async updateWarehouse(
    user: AuthenticatedUser,
    warehouseId: string,
    dto: UpdateWarehouseDto,
  ) {
    const warehouse = await this.getWarehouseOrThrow(warehouseId);
    await this.assertCanManage(user.id, warehouse.shopId);

    if (dto.countryCode || dto.timezone) {
      await this.validateCountryAndTimezone(
        dto.countryCode ?? warehouse.countryCode,
        dto.timezone ?? warehouse.timeZone,
      );
    }

    if (dto.code && dto.code !== warehouse.code) {
      await this.assertUniqueCode(warehouse.shopId, dto.code, warehouseId);
    }

    const data: Prisma.WarehouseUpdateInput = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.code !== undefined) data.code = dto.code;
    if (dto.address !== undefined) data.address = dto.address;
    if (dto.timezone !== undefined) data.timeZone = dto.timezone;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.countryCode !== undefined) {
      data.country = { connect: { code: dto.countryCode } };
    }

    return this.prisma.warehouse.update({
      where: { id: warehouseId },
      data,
      include: warehouseInclude,
    });
  }

  async deleteWarehouse(user: AuthenticatedUser, warehouseId: string) {
    const warehouse = await this.getWarehouseOrThrow(warehouseId);
    await this.assertCanManage(user.id, warehouse.shopId);

    await this.prisma.warehouse.update({
      where: { id: warehouseId },
      data: { status: WarehouseStatus.INACTIVE, deletedAt: new Date() },
    });

    return { success: true };
  }

  private async assertCanManage(userId: string, shopId: string) {
    if (!(await this.permissions.canManageInventory(userId, shopId))) {
      throw new ForbiddenException("You cannot manage inventory.");
    }
  }

  private async assertCanRead(userId: string, shopId: string) {
    if (!(await this.permissions.canReadInventory(userId, shopId))) {
      throw new ForbiddenException("You cannot read inventory.");
    }
  }

  private async getWarehouseOrThrow(warehouseId: string) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: warehouseId, deletedAt: null },
      include: warehouseInclude,
    });

    if (!warehouse) {
      throw new NotFoundException("Warehouse not found.");
    }

    return warehouse;
  }

  private async assertUniqueCode(
    shopId: string,
    code: string,
    warehouseId?: string,
  ) {
    const existing = await this.prisma.warehouse.findFirst({
      where: {
        shopId,
        code,
        deletedAt: null,
        ...(warehouseId ? { NOT: { id: warehouseId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("Warehouse code is already in use.");
    }
  }

  private async validateCountryAndTimezone(
    countryCode: string,
    timezone: string,
  ) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    } catch {
      throw new BadRequestException("Invalid timezone.");
    }

    const country = await this.prisma.country.findFirst({
      where: { code: countryCode, isActive: true, deletedAt: null },
      select: { code: true },
    });

    if (!country) {
      throw new BadRequestException("Invalid countryCode.");
    }
  }
}
