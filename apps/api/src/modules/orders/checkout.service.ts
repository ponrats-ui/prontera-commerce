import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CartStatus,
  InventoryItemStatus,
  InventoryMovementType,
  InventoryReservationStatus,
  OrderStatus,
  PaymentMethod,
  PaymentRecordStatus,
  Prisma,
} from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import type {
  CancelCheckoutDto,
  CheckoutDto,
  ConfirmCheckoutDto,
} from "./dto/orders.dto";
import { OrderPermissionsService } from "./order-permissions.service";
import { OrdersService } from "./orders.service";

const checkoutCartInclude = {
  items: {
    where: { deletedAt: null },
    include: {
      product: { select: { id: true, name: true } },
      productVariant: {
        select: {
          id: true,
          sku: true,
          name: true,
          priceCents: true,
          currency: true,
        },
      },
      inventoryItem: true,
      reservation: true,
    },
  },
} satisfies Prisma.CartInclude;

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: OrderPermissionsService,
    private readonly ordersService: OrdersService,
  ) {}

  async checkout(user: AuthenticatedUser, dto: CheckoutDto) {
    if (!(await this.permissions.canCreateTransaction(user.id, dto.shopId))) {
      throw new ForbiddenException("You cannot checkout for this shop.");
    }

    const cart = await this.getCheckoutCart(
      user.id,
      dto.shopId,
      CartStatus.ACTIVE,
    );

    if (!cart.items.length) {
      throw new BadRequestException("Cart is empty.");
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const currency = cart.items[0]?.currency ?? "USD";
    const orderNumber = this.ordersService.generateOrderNumber();

    return this.prisma.$transaction(async (tx) => {
      const reservedItems: Array<{
        cartItemId: string;
        inventoryItemId: string;
        reservationId: string;
        quantity: number;
        beforeReserved: number;
        quantityOnHand: number;
      }> = [];

      for (const item of cart.items) {
        const inventoryItem = await tx.inventoryItem.findFirst({
          where: {
            productVariantId: item.productVariantId,
            deletedAt: null,
            warehouse: { shopId: dto.shopId, deletedAt: null },
          },
          orderBy: { createdAt: "asc" },
        });

        if (!inventoryItem) {
          throw new BadRequestException(
            "Inventory item not found for checkout.",
          );
        }

        const available =
          inventoryItem.quantityOnHand - inventoryItem.quantityReserved;
        if (available < item.quantity) {
          throw new BadRequestException("Insufficient available inventory.");
        }

        const reservation = await tx.inventoryReservation.create({
          data: {
            inventoryItemId: inventoryItem.id,
            quantity: item.quantity,
            status: InventoryReservationStatus.ACTIVE,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          },
        });

        await tx.inventoryMovement.create({
          data: {
            inventoryItemId: inventoryItem.id,
            movementType: InventoryMovementType.RESERVATION,
            quantity: item.quantity,
            referenceNumber: reservation.id,
            notes: "Checkout inventory reservation.",
            performedBy: user.id,
          },
        });

        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantityReserved: inventoryItem.quantityReserved + item.quantity,
          },
        });

        await tx.cartItem.update({
          where: { id: item.id },
          data: {
            inventoryItemId: inventoryItem.id,
            reservationId: reservation.id,
          },
        });

        reservedItems.push({
          cartItemId: item.id,
          inventoryItemId: inventoryItem.id,
          reservationId: reservation.id,
          quantity: item.quantity,
          beforeReserved: inventoryItem.quantityReserved,
          quantityOnHand: inventoryItem.quantityOnHand,
        });
      }

      const paymentData: Prisma.PaymentRecordCreateWithoutOrderInput = {
        amount: subtotal,
        currency,
        method: dto.paymentMethod ?? PaymentMethod.MANUAL,
        status: PaymentRecordStatus.PENDING,
      };

      if (dto.referenceNumber !== undefined) {
        paymentData.referenceNumber = dto.referenceNumber;
      }

      const orderData: Prisma.OrderUncheckedCreateInput = {
        orderNumber,
        shopId: dto.shopId,
        customerId: user.id,
        status: OrderStatus.PENDING,
        subtotal,
        discount: 0,
        tax: 0,
        total: subtotal,
        currency,
      };

      if (dto.notes !== undefined) {
        orderData.notes = dto.notes;
      }

      const order = await tx.order.create({
        data: {
          ...orderData,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              productName: item.product.name,
              productVariantName: item.productVariant.name,
              sku: item.productVariant.sku,
            })),
          },
          paymentRecords: {
            create: paymentData,
          },
        },
        include: { items: true, paymentRecords: true },
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { status: CartStatus.CHECKOUT },
      });

      return { order, reservations: reservedItems };
    });
  }

  async confirm(user: AuthenticatedUser, dto: ConfirmCheckoutDto) {
    const order = await this.getOrderOrThrow(dto.orderId);
    if (!(await this.permissions.canCreateTransaction(user.id, order.shopId))) {
      throw new ForbiddenException("You cannot confirm this order.");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException("Only pending orders can be confirmed.");
    }

    const cart = await this.getCheckoutCart(
      order.customerId ?? user.id,
      order.shopId,
      CartStatus.CHECKOUT,
    );

    return this.prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        if (
          !item.inventoryItemId ||
          !item.reservationId ||
          !item.inventoryItem
        ) {
          throw new BadRequestException("Checkout reservation is incomplete.");
        }

        const nextOnHand = item.inventoryItem.quantityOnHand - item.quantity;
        const nextReserved =
          item.inventoryItem.quantityReserved - item.quantity;

        if (nextOnHand < 0 || nextReserved < 0) {
          throw new BadRequestException("Inventory cannot become negative.");
        }

        await tx.inventoryMovement.create({
          data: {
            inventoryItemId: item.inventoryItemId,
            movementType: InventoryMovementType.OUTBOUND,
            quantity: item.quantity,
            referenceNumber: order.orderNumber,
            notes: "Order confirmed.",
            performedBy: user.id,
          },
        });

        await tx.inventoryReservation.update({
          where: { id: item.reservationId },
          data: { status: InventoryReservationStatus.RELEASED },
        });

        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            quantityOnHand: nextOnHand,
            quantityReserved: nextReserved,
            status:
              nextOnHand - nextReserved <= 0
                ? InventoryItemStatus.OUT_OF_STOCK
                : InventoryItemStatus.ACTIVE,
          },
        });
      }

      await tx.paymentRecord.updateMany({
        where: { orderId: order.id, status: PaymentRecordStatus.PENDING },
        data: { status: PaymentRecordStatus.PAID },
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { status: CartStatus.CONVERTED },
      });

      return tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CONFIRMED },
        include: { items: true, paymentRecords: true },
      });
    });
  }

  async cancel(user: AuthenticatedUser, dto: CancelCheckoutDto) {
    const order = await this.getOrderOrThrow(dto.orderId);
    if (!(await this.permissions.canCreateTransaction(user.id, order.shopId))) {
      throw new ForbiddenException("You cannot cancel this order.");
    }

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.DRAFT
    ) {
      throw new BadRequestException(
        "Only draft or pending orders can be cancelled.",
      );
    }

    const cart = await this.getCheckoutCart(
      order.customerId ?? user.id,
      order.shopId,
      CartStatus.CHECKOUT,
    );

    return this.prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        if (
          !item.inventoryItemId ||
          !item.reservationId ||
          !item.inventoryItem
        ) {
          continue;
        }

        const nextReserved =
          item.inventoryItem.quantityReserved - item.quantity;

        await tx.inventoryMovement.create({
          data: {
            inventoryItemId: item.inventoryItemId,
            movementType: InventoryMovementType.RELEASE,
            quantity: item.quantity,
            referenceNumber: order.orderNumber,
            notes: "Checkout cancelled.",
            performedBy: user.id,
          },
        });

        await tx.inventoryReservation.update({
          where: { id: item.reservationId },
          data: { status: InventoryReservationStatus.RELEASED },
        });

        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: { quantityReserved: Math.max(0, nextReserved) },
        });
      }

      await tx.paymentRecord.updateMany({
        where: { orderId: order.id },
        data: { status: PaymentRecordStatus.FAILED },
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { status: CartStatus.CANCELLED },
      });

      return tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED },
        include: { items: true, paymentRecords: true },
      });
    });
  }

  private async getOrderOrThrow(orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
    });

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    return order;
  }

  private async getCheckoutCart(
    userId: string,
    shopId: string,
    status: CartStatus,
  ) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId, shopId, status, deletedAt: null },
      include: checkoutCartInclude,
      orderBy: { updatedAt: "desc" },
    });

    if (!cart) {
      throw new NotFoundException("Checkout cart not found.");
    }

    return cart;
  }
}
