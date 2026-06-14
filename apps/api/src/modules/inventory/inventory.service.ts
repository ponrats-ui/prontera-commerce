import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  InventoryAlertStatus,
  InventoryAlertType,
  InventoryItemStatus,
  InventoryMovementType,
  InventoryReservationStatus,
  Prisma,
} from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import type {
  CreateInventoryAdjustmentDto,
  CreateInventoryItemDto,
  CreateInventoryMovementDto,
  CreateInventoryReservationDto,
  ListInventoryMovementsQueryDto,
  ListInventoryReservationsQueryDto,
} from "./dto/inventory.dto";
import { InventoryPermissionsService } from "./inventory-permissions.service";

const itemInclude = {
  warehouse: { select: { id: true, shopId: true, code: true, name: true } },
  productVariant: { select: { id: true, sku: true, name: true } },
} satisfies Prisma.InventoryItemInclude;

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: InventoryPermissionsService,
  ) {}

  async createItem(user: AuthenticatedUser, dto: CreateInventoryItemDto) {
    const warehouse = await this.getWarehouseOrThrow(dto.warehouseId);
    await this.assertCanManage(user.id, warehouse.shopId);
    await this.assertVariantExists(dto.productVariantId);

    const existing = await this.prisma.inventoryItem.findFirst({
      where: {
        warehouseId: dto.warehouseId,
        productVariantId: dto.productVariantId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException(
        "Inventory item already exists for this warehouse and variant.",
      );
    }

    const quantityOnHand = dto.quantityOnHand ?? 0;
    const quantityReserved = dto.quantityReserved ?? 0;

    if (quantityReserved > quantityOnHand) {
      throw new BadRequestException(
        "quantityReserved cannot exceed quantityOnHand.",
      );
    }

    const data: Prisma.InventoryItemCreateInput = {
      warehouse: { connect: { id: dto.warehouseId } },
      productVariant: { connect: { id: dto.productVariantId } },
      sku: dto.sku,
      quantityOnHand,
      quantityReserved,
      reorderPoint: dto.reorderPoint ?? 0,
      reorderQuantity: dto.reorderQuantity ?? 0,
      status:
        dto.status ??
        (quantityOnHand - quantityReserved <= 0
          ? InventoryItemStatus.OUT_OF_STOCK
          : InventoryItemStatus.ACTIVE),
    };

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.create({
        data,
        include: itemInclude,
      });

      if (quantityOnHand > 0) {
        await tx.inventoryMovement.create({
          data: {
            inventoryItemId: item.id,
            movementType: InventoryMovementType.INBOUND,
            quantity: quantityOnHand,
            referenceNumber: "INITIAL_STOCK",
            notes: "Initial inventory item quantity.",
            performedBy: user.id,
          },
        });
      }

      await this.createAlertIfNeeded(tx, item.id, {
        quantityOnHand,
        quantityReserved,
        reorderPoint: dto.reorderPoint ?? 0,
      });

      return this.withAvailable(item);
    });
  }

  async createMovement(
    user: AuthenticatedUser,
    dto: CreateInventoryMovementDto,
  ) {
    const item = await this.getItemOrThrow(dto.inventoryItemId);

    if (
      !(await this.permissions.canCreateMovement(
        user.id,
        item.warehouse.shopId,
        dto.movementType,
      ))
    ) {
      throw new ForbiddenException(
        "You cannot create this inventory movement.",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const next = this.applyMovement(item, dto.movementType, dto.quantity);

      const movement = await tx.inventoryMovement.create({
        data: this.movementData(dto, user.id),
      });

      const updated = await tx.inventoryItem.update({
        where: { id: item.id },
        data: this.itemQuantityUpdate(next),
        include: itemInclude,
      });

      await this.createAlertIfNeeded(tx, item.id, {
        quantityOnHand: next.quantityOnHand,
        quantityReserved: next.quantityReserved,
        reorderPoint: item.reorderPoint,
      });

      return { movement, inventoryItem: this.withAvailable(updated) };
    });
  }

  async listMovements(
    user: AuthenticatedUser,
    query: ListInventoryMovementsQueryDto,
  ) {
    if (query.inventoryItemId) {
      const item = await this.getItemOrThrow(query.inventoryItemId);
      await this.assertCanRead(user.id, item.warehouse.shopId);
    }

    const where: Prisma.InventoryMovementWhereInput = {};

    if (query.inventoryItemId !== undefined) {
      where.inventoryItemId = query.inventoryItemId;
    }

    return this.prisma.inventoryMovement.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async getMovement(user: AuthenticatedUser, movementId: string) {
    const movement = await this.prisma.inventoryMovement.findFirst({
      where: { id: movementId },
      include: { inventoryItem: { include: itemInclude } },
    });

    if (!movement) {
      throw new NotFoundException("Inventory movement not found.");
    }

    await this.assertCanRead(user.id, movement.inventoryItem.warehouse.shopId);
    return movement;
  }

  async createAdjustment(
    user: AuthenticatedUser,
    dto: CreateInventoryAdjustmentDto,
  ) {
    const item = await this.getItemOrThrow(dto.inventoryItemId);
    await this.assertCanManage(user.id, item.warehouse.shopId);

    if (dto.afterQuantity < item.quantityReserved) {
      throw new BadRequestException(
        "afterQuantity cannot be below quantityReserved.",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const adjustmentData: Prisma.InventoryAdjustmentUncheckedCreateInput = {
        inventoryItemId: item.id,
        reason: dto.reason,
        beforeQuantity: item.quantityOnHand,
        afterQuantity: dto.afterQuantity,
        performedBy: user.id,
      };

      if (dto.notes !== undefined) {
        adjustmentData.notes = dto.notes;
      }

      const adjustment = await tx.inventoryAdjustment.create({
        data: adjustmentData,
      });

      const movementData: Prisma.InventoryMovementUncheckedCreateInput = {
        inventoryItemId: item.id,
        movementType: InventoryMovementType.ADJUSTMENT,
        quantity: Math.abs(dto.afterQuantity - item.quantityOnHand),
        referenceNumber: adjustment.id,
        performedBy: user.id,
      };

      if (dto.notes !== undefined) {
        movementData.notes = dto.notes;
      }

      await tx.inventoryMovement.create({ data: movementData });

      const updated = await tx.inventoryItem.update({
        where: { id: item.id },
        data: this.itemQuantityUpdate({
          quantityOnHand: dto.afterQuantity,
          quantityReserved: item.quantityReserved,
        }),
        include: itemInclude,
      });

      await this.createAlertIfNeeded(tx, item.id, {
        quantityOnHand: dto.afterQuantity,
        quantityReserved: item.quantityReserved,
        reorderPoint: item.reorderPoint,
      });

      return { adjustment, inventoryItem: this.withAvailable(updated) };
    });
  }

  async listAdjustments(user: AuthenticatedUser, inventoryItemId?: string) {
    if (inventoryItemId) {
      const item = await this.getItemOrThrow(inventoryItemId);
      await this.assertCanRead(user.id, item.warehouse.shopId);
    }

    const where: Prisma.InventoryAdjustmentWhereInput = {};

    if (inventoryItemId !== undefined) {
      where.inventoryItemId = inventoryItemId;
    }

    return this.prisma.inventoryAdjustment.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async createReservation(
    user: AuthenticatedUser,
    dto: CreateInventoryReservationDto,
  ) {
    const item = await this.getItemOrThrow(dto.inventoryItemId);
    await this.assertCanManage(user.id, item.warehouse.shopId);

    if (dto.expiresAt <= new Date()) {
      throw new BadRequestException(
        "Reservation expiry must be in the future.",
      );
    }

    if (dto.quantity > this.available(item)) {
      throw new BadRequestException("Insufficient available inventory.");
    }

    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.inventoryReservation.create({
        data: {
          inventoryItemId: item.id,
          quantity: dto.quantity,
          expiresAt: dto.expiresAt,
          status: InventoryReservationStatus.ACTIVE,
        },
      });

      const next = {
        quantityOnHand: item.quantityOnHand,
        quantityReserved: item.quantityReserved + dto.quantity,
      };

      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: item.id,
          movementType: InventoryMovementType.RESERVATION,
          quantity: dto.quantity,
          referenceNumber: reservation.id,
          notes: "Inventory reserved for future order allocation.",
          performedBy: user.id,
        },
      });

      const updated = await tx.inventoryItem.update({
        where: { id: item.id },
        data: this.itemQuantityUpdate(next),
        include: itemInclude,
      });

      await this.createAlertIfNeeded(tx, item.id, {
        ...next,
        reorderPoint: item.reorderPoint,
      });

      return { reservation, inventoryItem: this.withAvailable(updated) };
    });
  }

  async listReservations(
    user: AuthenticatedUser,
    inventoryItemId: string,
    query: ListInventoryReservationsQueryDto,
  ) {
    const item = await this.getItemOrThrow(inventoryItemId);
    await this.assertCanRead(user.id, item.warehouse.shopId);

    const where: Prisma.InventoryReservationWhereInput = {
      inventoryItemId,
      deletedAt: null,
    };

    if (query.status !== undefined) {
      where.status = query.status;
    }

    return this.prisma.inventoryReservation.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  async listAlerts(user: AuthenticatedUser, inventoryItemId?: string) {
    if (inventoryItemId) {
      const item = await this.getItemOrThrow(inventoryItemId);
      await this.assertCanRead(user.id, item.warehouse.shopId);
    }

    const where: Prisma.InventoryAlertWhereInput = { deletedAt: null };

    if (inventoryItemId !== undefined) {
      where.inventoryItemId = inventoryItemId;
    }

    return this.prisma.inventoryAlert.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
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
      select: { id: true, shopId: true },
    });

    if (!warehouse) {
      throw new NotFoundException("Warehouse not found.");
    }

    return warehouse;
  }

  private async assertVariantExists(productVariantId: string) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: productVariantId, deletedAt: null },
      select: { id: true },
    });

    if (!variant) {
      throw new BadRequestException("Product variant not found.");
    }
  }

  private async getItemOrThrow(inventoryItemId: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id: inventoryItemId, deletedAt: null },
      include: itemInclude,
    });

    if (!item) {
      throw new NotFoundException("Inventory item not found.");
    }

    return item;
  }

  private applyMovement(
    item: { quantityOnHand: number; quantityReserved: number },
    movementType: InventoryMovementType,
    quantity: number,
  ) {
    const next = {
      quantityOnHand: item.quantityOnHand,
      quantityReserved: item.quantityReserved,
    };

    if (
      movementType === InventoryMovementType.INBOUND ||
      movementType === InventoryMovementType.TRANSFER_IN ||
      movementType === InventoryMovementType.RELEASE
    ) {
      next.quantityOnHand += quantity;
    }

    if (
      movementType === InventoryMovementType.OUTBOUND ||
      movementType === InventoryMovementType.TRANSFER_OUT
    ) {
      next.quantityOnHand -= quantity;
    }

    if (movementType === InventoryMovementType.RESERVATION) {
      next.quantityReserved += quantity;
    }

    if (next.quantityOnHand < 0) {
      throw new BadRequestException("quantityOnHand cannot become negative.");
    }

    if (next.quantityReserved > next.quantityOnHand) {
      throw new BadRequestException(
        "quantityReserved cannot exceed quantityOnHand.",
      );
    }

    return next;
  }

  private movementData(dto: CreateInventoryMovementDto, userId: string) {
    const data: Prisma.InventoryMovementUncheckedCreateInput = {
      inventoryItemId: dto.inventoryItemId,
      movementType: dto.movementType,
      quantity: dto.quantity,
      performedBy: userId,
    };

    if (dto.referenceNumber !== undefined) {
      data.referenceNumber = dto.referenceNumber;
    }

    if (dto.notes !== undefined) {
      data.notes = dto.notes;
    }

    return data;
  }

  private itemQuantityUpdate(next: {
    quantityOnHand: number;
    quantityReserved: number;
  }) {
    const quantityAvailable = next.quantityOnHand - next.quantityReserved;

    return {
      quantityOnHand: next.quantityOnHand,
      quantityReserved: next.quantityReserved,
      status:
        quantityAvailable <= 0
          ? InventoryItemStatus.OUT_OF_STOCK
          : InventoryItemStatus.ACTIVE,
    };
  }

  private async createAlertIfNeeded(
    tx: Prisma.TransactionClient,
    inventoryItemId: string,
    quantities: {
      quantityOnHand: number;
      quantityReserved: number;
      reorderPoint: number;
    },
  ) {
    const currentQuantity =
      quantities.quantityOnHand - quantities.quantityReserved;

    if (currentQuantity <= 0) {
      await tx.inventoryAlert.create({
        data: {
          inventoryItemId,
          alertType: InventoryAlertType.OUT_OF_STOCK,
          threshold: 0,
          currentQuantity,
          status: InventoryAlertStatus.OPEN,
        },
      });
      return;
    }

    if (currentQuantity <= quantities.reorderPoint) {
      await tx.inventoryAlert.create({
        data: {
          inventoryItemId,
          alertType: InventoryAlertType.LOW_STOCK,
          threshold: quantities.reorderPoint,
          currentQuantity,
          status: InventoryAlertStatus.OPEN,
        },
      });
    }
  }

  private available(item: {
    quantityOnHand: number;
    quantityReserved: number;
  }) {
    return item.quantityOnHand - item.quantityReserved;
  }

  private withAvailable<
    T extends { quantityOnHand: number; quantityReserved: number },
  >(item: T) {
    return {
      ...item,
      quantityAvailable: this.available(item),
    };
  }
}
