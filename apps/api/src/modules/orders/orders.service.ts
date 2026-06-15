import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  OrderStatus,
  PaymentMethod,
  PaymentRecordStatus,
  Prisma,
} from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import type { CreateOrderDto } from "./dto/orders.dto";
import { OrderPermissionsService } from "./order-permissions.service";

const orderInclude = {
  items: true,
  paymentRecords: {
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: OrderPermissionsService,
  ) {}

  async createOrder(user: AuthenticatedUser, dto: CreateOrderDto) {
    if (!(await this.permissions.canCreateTransaction(user.id, dto.shopId))) {
      throw new ForbiddenException("You cannot create orders for this shop.");
    }

    const variants = await this.loadVariants(dto.shopId, dto.items);
    const subtotal = dto.items.reduce((sum, item) => {
      const variant = variants.get(item.productVariantId);
      return sum + (variant?.priceCents ?? 0) * item.quantity;
    }, 0);
    const discount = dto.discount ?? 0;
    const tax = dto.tax ?? 0;
    const total = subtotal - discount + tax;

    if (total < 0) {
      throw new BadRequestException("Order total cannot be negative.");
    }

    const currency = variants.values().next().value?.currency ?? "USD";
    const orderNumber = this.generateOrderNumber();
    const data: Prisma.OrderCreateInput = {
      orderNumber,
      shop: { connect: { id: dto.shopId } },
      customer: { connect: { id: user.id } },
      status: dto.status ?? OrderStatus.DRAFT,
      subtotal,
      discount,
      tax,
      total,
      currency,
      items: {
        create: dto.items.map((item) => {
          const variant = variants.get(item.productVariantId);
          if (!variant) {
            throw new BadRequestException("Invalid product variant.");
          }

          return {
            productId: variant.product.id,
            productVariantId: variant.id,
            quantity: item.quantity,
            unitPrice: variant.priceCents,
            totalPrice: item.quantity * variant.priceCents,
            productName: variant.product.name,
            productVariantName: variant.name,
            sku: variant.sku,
          };
        }),
      },
    };

    if (dto.notes !== undefined) {
      data.notes = dto.notes;
    }

    if (dto.payment) {
      const paymentData: Prisma.PaymentRecordCreateWithoutOrderInput = {
        amount: total,
        currency,
        method: dto.payment.method,
        status: dto.payment.status ?? PaymentRecordStatus.PENDING,
      };

      if (dto.payment.referenceNumber !== undefined) {
        paymentData.referenceNumber = dto.payment.referenceNumber;
      }

      data.paymentRecords = {
        create: paymentData,
      };
    }

    return this.prisma.order.create({ data, include: orderInclude });
  }

  async listOrders(user: AuthenticatedUser, shopId: string) {
    if (!(await this.permissions.canReadTransactions(user.id, shopId))) {
      throw new ForbiddenException("You cannot read orders for this shop.");
    }

    return this.prisma.order.findMany({
      where: { shopId, deletedAt: null },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  async getOrder(user: AuthenticatedUser, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException("Order not found.");
    }

    if (!(await this.permissions.canReadTransactions(user.id, order.shopId))) {
      throw new ForbiddenException("You cannot read this order.");
    }

    return order;
  }

  generateOrderNumber() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `ORD-${date}-${suffix}`;
  }

  private async loadVariants(
    shopId: string,
    items: Array<{ productVariantId: string }>,
  ) {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        id: { in: items.map((item) => item.productVariantId) },
        deletedAt: null,
        product: { shopId, deletedAt: null },
      },
      include: {
        product: { select: { id: true, name: true, shopId: true } },
      },
    });

    if (variants.length !== items.length) {
      throw new BadRequestException(
        "One or more product variants are invalid.",
      );
    }

    return new Map(variants.map((variant) => [variant.id, variant]));
  }
}
