import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, ProductStatus, ProductVariantStatus } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import {
  SUPPORTED_CATALOG_LOCALES,
  type ProductTranslationInputDto,
} from "./dto/catalog-shared.dto";
import type { CreateProductImageDto } from "./dto/product-image.dto";
import type {
  CreateProductDto,
  ListProductsQueryDto,
  UpdateProductDto,
} from "./dto/product.dto";
import type {
  CreateProductVariantDto,
  UpdateProductVariantDto,
} from "./dto/product-variant.dto";
import { ProductPermissionsService } from "./product-permissions.service";

const productInclude = {
  category: {
    select: {
      id: true,
      slug: true,
      status: true,
      translations: {
        where: { deletedAt: null },
        orderBy: { localeCode: "asc" },
      },
    },
  },
  translations: {
    where: { deletedAt: null },
    orderBy: { localeCode: "asc" },
  },
  images: {
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  },
  variants: {
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: ProductPermissionsService,
  ) {}

  async createProduct(
    user: AuthenticatedUser,
    shopId: string,
    dto: CreateProductDto,
  ) {
    await this.assertCanManage(user.id, shopId);
    this.assertUniqueLocales(dto.translations);
    await this.validateLocales(dto.translations.map((item) => item.locale));
    await this.assertCategoryBelongsToShop(dto.categoryId, shopId);
    await this.assertUniqueProductSlug(shopId, dto.slug);
    await this.assertUniqueProductSku(shopId, dto.sku);

    const fallback = this.getFallbackTranslation(dto.translations);
    const data: Prisma.ProductCreateInput = {
      shop: { connect: { id: shopId } },
      category: { connect: { id: dto.categoryId } },
      sku: dto.sku,
      slug: dto.slug,
      name: fallback.name,
      status: dto.status ?? ProductStatus.DRAFT,
      translations: {
        create: dto.translations.map((translation) =>
          this.toTranslationCreate(translation),
        ),
      },
    };

    if (fallback.description !== undefined) {
      data.description = fallback.description;
    }

    return this.prisma.product.create({
      data,
      include: productInclude,
    });
  }

  async listProducts(
    user: AuthenticatedUser,
    shopId: string,
    query: ListProductsQueryDto,
  ) {
    await this.assertCanRead(user.id, shopId);

    const where: Prisma.ProductWhereInput = {
      shopId,
      deletedAt: null,
    };

    if (query.status !== undefined) {
      where.status = query.status;
    }

    return this.prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  async getProduct(user: AuthenticatedUser, productId: string) {
    const product = await this.getProductOrThrow(productId);
    await this.assertCanRead(user.id, product.shopId);
    return product;
  }

  async updateProduct(
    user: AuthenticatedUser,
    productId: string,
    dto: UpdateProductDto,
  ) {
    const product = await this.getProductOrThrow(productId);
    await this.assertCanManage(user.id, product.shopId);

    if (dto.categoryId) {
      await this.assertCategoryBelongsToShop(dto.categoryId, product.shopId);
    }

    if (dto.slug && dto.slug !== product.slug) {
      await this.assertUniqueProductSlug(product.shopId, dto.slug, productId);
    }

    if (dto.sku && dto.sku !== product.sku) {
      await this.assertUniqueProductSku(product.shopId, dto.sku, productId);
    }

    if (dto.translations) {
      this.assertUniqueLocales(dto.translations);
      await this.validateLocales(dto.translations.map((item) => item.locale));
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.translations) {
        await this.replaceTranslations(tx, productId, dto.translations);
      }

      const data: Prisma.ProductUpdateInput = {};

      if (dto.sku !== undefined) {
        data.sku = dto.sku;
      }

      if (dto.slug !== undefined) {
        data.slug = dto.slug;
      }

      if (dto.status !== undefined) {
        data.status = dto.status;
      }

      if (dto.categoryId !== undefined) {
        data.category = { connect: { id: dto.categoryId } };
      }

      if (dto.translations) {
        const fallback = this.getFallbackTranslation(dto.translations);
        data.name = fallback.name;
        data.description = fallback.description ?? null;
      }

      return tx.product.update({
        where: { id: productId },
        data,
        include: productInclude,
      });
    });
  }

  async deleteProduct(user: AuthenticatedUser, productId: string) {
    const product = await this.getProductOrThrow(productId);
    await this.assertCanManage(user.id, product.shopId);

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        status: ProductStatus.ARCHIVED,
        deletedAt: new Date(),
      },
    });

    return { success: true };
  }

  async addImage(
    user: AuthenticatedUser,
    productId: string,
    dto: CreateProductImageDto,
  ) {
    const product = await this.getProductOrThrow(productId);
    await this.assertCanManage(user.id, product.shopId);

    const data: Prisma.ProductImageUncheckedCreateInput = {
      productId,
      imageUrl: dto.imageUrl,
      sortOrder: dto.sortOrder ?? 0,
    };

    if (dto.altText !== undefined) {
      data.altText = dto.altText;
    }

    return this.prisma.productImage.create({ data });
  }

  async listImages(user: AuthenticatedUser, productId: string) {
    const product = await this.getProductOrThrow(productId);
    await this.assertCanRead(user.id, product.shopId);

    return this.prisma.productImage.findMany({
      where: { productId, deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }

  async deleteImage(
    user: AuthenticatedUser,
    productId: string,
    imageId: string,
  ) {
    const product = await this.getProductOrThrow(productId);
    await this.assertCanManage(user.id, product.shopId);

    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId, deletedAt: null },
      select: { id: true },
    });

    if (!image) {
      throw new NotFoundException("Product image not found.");
    }

    await this.prisma.productImage.update({
      where: { id: imageId },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  async addVariant(
    user: AuthenticatedUser,
    productId: string,
    dto: CreateProductVariantDto,
  ) {
    const product = await this.getProductOrThrow(productId);
    await this.assertCanManage(user.id, product.shopId);
    await this.assertUniqueVariantSku(productId, dto.sku);

    const data: Prisma.ProductVariantUncheckedCreateInput = {
      productId,
      sku: dto.sku,
      name: dto.name,
      priceCents: dto.price,
      currency: product.shop.preferredCurrency ?? product.shop.currencyCode,
      status: dto.status ?? ProductVariantStatus.ACTIVE,
    };

    if (dto.compareAtPrice !== undefined) {
      data.compareAtPriceCents = dto.compareAtPrice;
    }

    return this.prisma.productVariant.create({ data });
  }

  async listVariants(user: AuthenticatedUser, productId: string) {
    const product = await this.getProductOrThrow(productId);
    await this.assertCanRead(user.id, product.shopId);

    return this.prisma.productVariant.findMany({
      where: { productId, deletedAt: null },
      orderBy: { createdAt: "asc" },
    });
  }

  async updateVariant(
    user: AuthenticatedUser,
    productId: string,
    variantId: string,
    dto: UpdateProductVariantDto,
  ) {
    const product = await this.getProductOrThrow(productId);
    await this.assertCanManage(user.id, product.shopId);

    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId, deletedAt: null },
    });

    if (!variant) {
      throw new NotFoundException("Product variant not found.");
    }

    if (dto.sku && dto.sku !== variant.sku) {
      await this.assertUniqueVariantSku(productId, dto.sku, variantId);
    }

    const data: Prisma.ProductVariantUpdateInput = {};

    if (dto.sku !== undefined) {
      data.sku = dto.sku;
    }

    if (dto.name !== undefined) {
      data.name = dto.name;
    }

    if (dto.price !== undefined) {
      data.priceCents = dto.price;
    }

    if (dto.compareAtPrice !== undefined) {
      data.compareAtPriceCents = dto.compareAtPrice;
    }

    if (dto.status !== undefined) {
      data.status = dto.status;
    }

    return this.prisma.productVariant.update({
      where: { id: variantId },
      data,
    });
  }

  async deleteVariant(
    user: AuthenticatedUser,
    productId: string,
    variantId: string,
  ) {
    const product = await this.getProductOrThrow(productId);
    await this.assertCanManage(user.id, product.shopId);

    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId, deletedAt: null },
      select: { id: true },
    });

    if (!variant) {
      throw new NotFoundException("Product variant not found.");
    }

    await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        status: ProductVariantStatus.ARCHIVED,
        deletedAt: new Date(),
      },
    });

    return { success: true };
  }

  private async assertCanManage(userId: string, shopId: string) {
    if (!(await this.permissions.canManageCatalog(userId, shopId))) {
      throw new ForbiddenException("You cannot manage this catalog.");
    }
  }

  private async assertCanRead(userId: string, shopId: string) {
    if (!(await this.permissions.canReadCatalog(userId, shopId))) {
      throw new ForbiddenException("You cannot read this catalog.");
    }
  }

  private async getProductOrThrow(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      include: {
        ...productInclude,
        shop: {
          select: {
            id: true,
            currencyCode: true,
            preferredCurrency: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found.");
    }

    return product;
  }

  private async assertCategoryBelongsToShop(
    categoryId: string,
    shopId: string,
  ) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, shopId, deletedAt: null },
      select: { id: true },
    });

    if (!category) {
      throw new BadRequestException("Category does not belong to this shop.");
    }
  }

  private async assertUniqueProductSlug(
    shopId: string,
    slug: string,
    productId?: string,
  ) {
    const existing = await this.prisma.product.findFirst({
      where: {
        shopId,
        slug,
        deletedAt: null,
        ...(productId ? { NOT: { id: productId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("Product slug is already in use.");
    }
  }

  private async assertUniqueProductSku(
    shopId: string,
    sku: string,
    productId?: string,
  ) {
    const existing = await this.prisma.product.findFirst({
      where: {
        shopId,
        sku,
        deletedAt: null,
        ...(productId ? { NOT: { id: productId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("Product SKU is already in use.");
    }
  }

  private async assertUniqueVariantSku(
    productId: string,
    sku: string,
    variantId?: string,
  ) {
    const existing = await this.prisma.productVariant.findFirst({
      where: {
        productId,
        sku,
        deletedAt: null,
        ...(variantId ? { NOT: { id: variantId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("Product variant SKU is already in use.");
    }
  }

  private assertUniqueLocales(translations: Array<{ locale: string }>) {
    const locales = new Set<string>();

    for (const translation of translations) {
      if (locales.has(translation.locale)) {
        throw new BadRequestException("Duplicate translation locale.");
      }

      locales.add(translation.locale);
    }
  }

  private async validateLocales(locales: string[]) {
    for (const locale of locales) {
      if (!SUPPORTED_CATALOG_LOCALES.includes(locale as never)) {
        throw new BadRequestException("Unsupported translation locale.");
      }

      const existing = await this.prisma.locale.findFirst({
        where: { code: locale, deletedAt: null },
        select: { code: true },
      });

      if (!existing) {
        throw new BadRequestException("Invalid translation locale.");
      }
    }
  }

  private getFallbackTranslation<T extends { locale: string; name: string }>(
    translations: T[],
  ) {
    const fallback =
      translations.find((translation) => translation.locale === "en-US") ??
      translations[0];

    if (!fallback) {
      throw new BadRequestException("At least one translation is required.");
    }

    return fallback;
  }

  private toTranslationCreate(translation: ProductTranslationInputDto) {
    const data: Prisma.ProductTranslationCreateWithoutProductInput = {
      locale: { connect: { code: translation.locale } },
      name: translation.name,
    };

    if (translation.shortDescription !== undefined) {
      data.shortDescription = translation.shortDescription;
    }

    if (translation.description !== undefined) {
      data.description = translation.description;
    }

    return data;
  }

  private async replaceTranslations(
    tx: Prisma.TransactionClient,
    productId: string,
    translations: ProductTranslationInputDto[],
  ) {
    await tx.productTranslation.updateMany({
      where: { productId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    for (const translation of translations) {
      const data: Prisma.ProductTranslationUncheckedCreateInput = {
        productId,
        localeCode: translation.locale,
        name: translation.name,
      };

      if (translation.shortDescription !== undefined) {
        data.shortDescription = translation.shortDescription;
      }

      if (translation.description !== undefined) {
        data.description = translation.description;
      }

      await tx.productTranslation.create({ data });
    }
  }
}
