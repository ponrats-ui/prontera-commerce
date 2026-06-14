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
import { CategoriesService } from "./categories.service";
import {
  CreateCategoryDto,
  ListCategoriesQueryDto,
  UpdateCategoryDto,
} from "./dto/category.dto";

@ApiTags("Categories")
@ApiBearerAuth()
@Roles("admin", "merchant")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: "Create a product category" })
  @ApiBody({ type: CreateCategoryDto })
  createCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.createCategory(user, dto);
  }

  @Get()
  @ApiOperation({ summary: "List product categories for a shop" })
  listCategories(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListCategoriesQueryDto,
  ) {
    return this.categoriesService.listCategories(user, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a product category" })
  getCategory(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.categoriesService.getCategory(user, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a product category" })
  @ApiBody({ type: UpdateCategoryDto })
  updateCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(user, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft delete a product category" })
  @ApiOkResponse({ schema: { example: { success: true } } })
  deleteCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.categoriesService.deleteCategory(user, id);
  }
}
