import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CategoryStatus, Prisma } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import {
  SUPPORTED_CATALOG_LOCALES,
  type CategoryTranslationInputDto,
} from "./dto/catalog-shared.dto";
import type {
  CreateCategoryDto,
  ListCategoriesQueryDto,
  UpdateCategoryDto,
} from "./dto/category.dto";
import { ProductPermissionsService } from "./product-permissions.service";

const categoryInclude = {
  translations: {
    where: { deletedAt: null },
    orderBy: { localeCode: "asc" },
  },
} satisfies Prisma.CategoryInclude;

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: ProductPermissionsService,
  ) {}

  async createCategory(user: AuthenticatedUser, dto: CreateCategoryDto) {
    await this.assertCanManage(user.id, dto.shopId);
    this.assertUniqueLocales(dto.translations);
    await this.validateLocales(dto.translations.map((item) => item.locale));

    const existing = await this.prisma.category.findFirst({
      where: { shopId: dto.shopId, slug: dto.slug, deletedAt: null },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("Category slug is already in use.");
    }

    const fallback = this.getFallbackTranslation(dto.translations);
    const data: Prisma.CategoryCreateInput = {
      shop: { connect: { id: dto.shopId } },
      slug: dto.slug,
      name: fallback.name,
      status: dto.status ?? CategoryStatus.ACTIVE,
      translations: {
        create: dto.translations.map((translation) =>
          this.toTranslationCreate(translation),
        ),
      },
    };

    if (fallback.description !== undefined) {
      data.description = fallback.description;
    }

    return this.prisma.category.create({
      data,
      include: categoryInclude,
    });
  }

  async listCategories(user: AuthenticatedUser, query: ListCategoriesQueryDto) {
    await this.assertCanRead(user.id, query.shopId);

    const where: Prisma.CategoryWhereInput = {
      shopId: query.shopId,
      deletedAt: null,
    };

    if (query.status !== undefined) {
      where.status = query.status;
    }

    return this.prisma.category.findMany({
      where,
      include: categoryInclude,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  }

  async getCategory(user: AuthenticatedUser, categoryId: string) {
    const category = await this.getCategoryOrThrow(categoryId);
    await this.assertCanRead(user.id, category.shopId);
    return category;
  }

  async updateCategory(
    user: AuthenticatedUser,
    categoryId: string,
    dto: UpdateCategoryDto,
  ) {
    const category = await this.getCategoryOrThrow(categoryId);
    await this.assertCanManage(user.id, category.shopId);

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.prisma.category.findFirst({
        where: {
          shopId: category.shopId,
          slug: dto.slug,
          deletedAt: null,
          NOT: { id: categoryId },
        },
        select: { id: true },
      });

      if (existing) {
        throw new ConflictException("Category slug is already in use.");
      }
    }

    if (dto.translations) {
      this.assertUniqueLocales(dto.translations);
      await this.validateLocales(dto.translations.map((item) => item.locale));
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.translations) {
        await this.replaceTranslations(tx, categoryId, dto.translations);
      }

      const data: Prisma.CategoryUpdateInput = {};

      if (dto.slug !== undefined) {
        data.slug = dto.slug;
      }

      if (dto.status !== undefined) {
        data.status = dto.status;
      }

      if (dto.translations) {
        const fallback = this.getFallbackTranslation(dto.translations);
        data.name = fallback.name;
        data.description = fallback.description ?? null;
      }

      return tx.category.update({
        where: { id: categoryId },
        data,
        include: categoryInclude,
      });
    });
  }

  async deleteCategory(user: AuthenticatedUser, categoryId: string) {
    const category = await this.getCategoryOrThrow(categoryId);
    await this.assertCanManage(user.id, category.shopId);

    await this.prisma.category.update({
      where: { id: categoryId },
      data: {
        status: CategoryStatus.ARCHIVED,
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

  private async getCategoryOrThrow(categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, deletedAt: null },
      include: categoryInclude,
    });

    if (!category) {
      throw new NotFoundException("Category not found.");
    }

    return category;
  }

  private assertUniqueLocales(
    translations: Array<{ locale: string }>,
  ): asserts translations is Array<{ locale: string }> {
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

  private toTranslationCreate(translation: CategoryTranslationInputDto) {
    const data: Prisma.CategoryTranslationCreateWithoutCategoryInput = {
      locale: { connect: { code: translation.locale } },
      name: translation.name,
    };

    if (translation.description !== undefined) {
      data.description = translation.description;
    }

    return data;
  }

  private async replaceTranslations(
    tx: Prisma.TransactionClient,
    categoryId: string,
    translations: CategoryTranslationInputDto[],
  ) {
    await tx.categoryTranslation.updateMany({
      where: { categoryId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    for (const translation of translations) {
      const data: Prisma.CategoryTranslationUncheckedCreateInput = {
        categoryId,
        localeCode: translation.locale,
        name: translation.name,
      };

      if (translation.description !== undefined) {
        data.description = translation.description;
      }

      await tx.categoryTranslation.create({ data });
    }
  }
}
