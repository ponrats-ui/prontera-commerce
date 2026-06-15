import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateOrderDto } from "./dto/orders.dto";
import { OrdersService } from "./orders.service";

@ApiTags("Orders")
@ApiBearerAuth()
@Roles("admin", "merchant")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post("orders")
  @ApiOperation({ summary: "Create an order" })
  @ApiBody({ type: CreateOrderDto })
  createOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(user, dto);
  }

  @Get("shops/:shopId/orders")
  @ApiOperation({ summary: "List shop orders" })
  listOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Param("shopId") shopId: string,
  ) {
    return this.ordersService.listOrders(user, shopId);
  }

  @Get("orders/:id")
  @ApiOperation({ summary: "Get order" })
  getOrder(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.ordersService.getOrder(user, id);
  }
}
