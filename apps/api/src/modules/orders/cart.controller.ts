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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CartsService } from "./carts.service";
import { AddCartItemDto, UpdateCartItemDto } from "./dto/cart.dto";

@ApiTags("Cart")
@ApiBearerAuth()
@Roles("admin", "merchant")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("cart")
export class CartController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  @ApiOperation({ summary: "Get current cart" })
  getCart(
    @CurrentUser() user: AuthenticatedUser,
    @Query("shopId") shopId?: string,
  ) {
    return this.cartsService.getCart(user, shopId);
  }

  @Post("items")
  @ApiOperation({ summary: "Add cart item" })
  @ApiBody({ type: AddCartItemDto })
  addItem(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddCartItemDto) {
    return this.cartsService.addItem(user, dto);
  }

  @Patch("items/:id")
  @ApiOperation({ summary: "Update cart item quantity" })
  @ApiBody({ type: UpdateCartItemDto })
  updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartsService.updateItem(user, id, dto);
  }

  @Delete("items/:id")
  @ApiOperation({ summary: "Delete cart item" })
  deleteItem(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.cartsService.deleteItem(user, id);
  }
}
