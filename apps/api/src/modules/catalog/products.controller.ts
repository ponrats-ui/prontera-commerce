import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateProductImageDto } from "./dto/product-image.dto";
import {
  CreateProductDto,
  ListProductsQueryDto,
  UpdateProductDto,
} from "./dto/product.dto";
import {
  CreateProductVariantDto,
  UpdateProductVariantDto,
} from "./dto/product-variant.dto";
import { ProductsService } from "./products.service";

@ApiTags("Products")
@ApiBearerAuth()
@Roles("admin", "merchant")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post("shops/:shopId/products")
  @ApiOperation({ summary: "Create a shop product" })
  @ApiBody({ type: CreateProductDto })
  createProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param("shopId") shopId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.createProduct(user, shopId, dto);
  }

  @Get("shops/:shopId/products")
  @ApiOperation({ summary: "List shop products" })
  listProducts(
    @CurrentUser() user: AuthenticatedUser,
    @Param("shopId") shopId: string,
    @Query() query: ListProductsQueryDto,
  ) {
    return this.productsService.listProducts(user, shopId, query);
  }

  @Get("products/:id")
  @ApiOperation({ summary: "Get a product" })
  getProduct(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.productsService.getProduct(user, id);
  }

  @Patch("products/:id")
  @ApiOperation({ summary: "Update a product" })
  @ApiBody({ type: UpdateProductDto })
  updateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(user, id, dto);
  }

  @Delete("products/:id")
  @ApiOperation({ summary: "Soft delete a product" })
  @ApiOkResponse({ schema: { example: { success: true } } })
  deleteProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.productsService.deleteProduct(user, id);
  }

  @Post("products/:id/images")
  @ApiOperation({ summary: "Add a product image" })
  @ApiBody({ type: CreateProductImageDto })
  addImage(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: CreateProductImageDto,
  ) {
    return this.productsService.addImage(user, id, dto);
  }

  @Get("products/:id/images")
  @ApiOperation({ summary: "List product images" })
  listImages(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.productsService.listImages(user, id);
  }

  @Delete("products/:id/images/:imageId")
  @ApiOperation({ summary: "Soft delete a product image" })
  @ApiOkResponse({ schema: { example: { success: true } } })
  deleteImage(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("imageId") imageId: string,
  ) {
    return this.productsService.deleteImage(user, id, imageId);
  }

  @Post("products/:id/variants")
  @ApiOperation({ summary: "Create a product variant" })
  @ApiBody({ type: CreateProductVariantDto })
  addVariant(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.productsService.addVariant(user, id, dto);
  }

  @Get("products/:id/variants")
  @ApiOperation({ summary: "List product variants" })
  listVariants(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.productsService.listVariants(user, id);
  }

  @Patch("products/:id/variants/:variantId")
  @ApiOperation({ summary: "Update a product variant" })
  @ApiBody({ type: UpdateProductVariantDto })
  updateVariant(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("variantId") variantId: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.productsService.updateVariant(user, id, variantId, dto);
  }

  @Delete("products/:id/variants/:variantId")
  @ApiOperation({ summary: "Soft delete a product variant" })
  @ApiOkResponse({ schema: { example: { success: true } } })
  deleteVariant(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("variantId") variantId: string,
  ) {
    return this.productsService.deleteVariant(user, id, variantId);
  }
}
