import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CartStatus, Prisma } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import type { AddCartItemDto, UpdateCartItemDto } from "./dto/cart.dto";
import { OrderPermissionsService } from "./order-permissions.service";

const cartInclude = {
  items: {
    where: { deletedAt: null },
    include: {
      product: { select: { id: true, name: true, slug: true } },
      productVariant: {
        select: {
          id: true,
          sku: true,
          name: true,
          priceCents: true,
          currency: true,
        },
      },
      inventoryItem: {
        select: { id: true, quantityOnHand: true, quantityReserved: true },
      },
      reservation: { select: { id: true, status: true, expiresAt: true } },
    },
    orderBy: { createdAt: "asc" },
  },
  shop: {
    select: {
      id: true,
      name: true,
      currencyCode: true,
      preferredCurrency: true,
    },
  },
} satisfies Prisma.CartInclude;

@Injectable()
export class CartsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: OrderPermissionsService,
  ) {}

  async getCart(user: AuthenticatedUser, shopId?: string) {
    const where: Prisma.CartWhereInput = {
      userId: user.id,
      status: { in: [CartStatus.ACTIVE, CartStatus.CHECKOUT] },
      deletedAt: null,
    };

    if (shopId !== undefined) {
      where.shopId = shopId;
    }

    const cart = await this.prisma.cart.findFirst({
      where,
      include: cartInclude,
      orderBy: { updatedAt: "desc" },
    });

    if (!cart) {
      return null;
    }

    if (!(await this.permissions.canReadTransactions(user.id, cart.shopId))) {
      throw new ForbiddenException("You cannot read this cart.");
    }

    return this.withTotals(cart);
  }

  async addItem(user: AuthenticatedUser, dto: AddCartItemDto) {
    if (!(await this.permissions.canCreateTransaction(user.id, dto.shopId))) {
      throw new ForbiddenException("You cannot add items to this cart.");
    }

    const variant = await this.prisma.productVariant.findFirst({
      where: {
        id: dto.productVariantId,
        deletedAt: null,
        product: { shopId: dto.shopId, deletedAt: null },
      },
      include: {
        product: { select: { id: true, shopId: true } },
      },
    });

    if (!variant) {
      throw new BadRequestException(
        "Product variant does not belong to this shop.",
      );
    }

    const cart = await this.getOrCreateCart(user.id, dto.shopId);

    const item = await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: variant.product.id,
        productVariantId: variant.id,
        quantity: dto.quantity,
        unitPrice: variant.priceCents,
        currency: variant.currency,
      },
    });

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { status: CartStatus.ACTIVE },
    });

    return item;
  }

  async updateItem(
    user: AuthenticatedUser,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ) {
    const item = await this.getCartItemOrThrow(cartItemId);
    await this.assertCanMutateCart(user.id, item.cart.shopId);

    if (item.reservationId) {
      throw new BadRequestException("Cannot update a reserved cart item.");
    }

    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: dto.quantity },
    });
  }

  async deleteItem(user: AuthenticatedUser, cartItemId: string) {
    const item = await this.getCartItemOrThrow(cartItemId);
    await this.assertCanMutateCart(user.id, item.cart.shopId);

    if (item.reservationId) {
      throw new BadRequestException("Cannot delete a reserved cart item.");
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  private async getOrCreateCart(userId: string, shopId: string) {
    const existing = await this.prisma.cart.findFirst({
      where: { userId, shopId, status: CartStatus.ACTIVE, deletedAt: null },
      select: { id: true },
    });

    if (existing) return existing;

    return this.prisma.cart.create({
      data: { userId, shopId, status: CartStatus.ACTIVE },
      select: { id: true },
    });
  }

  private async getCartItemOrThrow(cartItemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, deletedAt: null },
      include: { cart: { select: { id: true, shopId: true, status: true } } },
    });

    if (!item) {
      throw new NotFoundException("Cart item not found.");
    }

    return item;
  }

  private async assertCanMutateCart(userId: string, shopId: string) {
    if (!(await this.permissions.canCreateTransaction(userId, shopId))) {
      throw new ForbiddenException("You cannot modify this cart.");
    }
  }

  private withTotals<
    T extends { items: Array<{ quantity: number; unitPrice: number }> },
  >(cart: T) {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    return { ...cart, subtotal, total: subtotal };
  }
}
