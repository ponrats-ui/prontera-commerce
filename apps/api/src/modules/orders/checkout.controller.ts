import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CheckoutService } from "./checkout.service";
import {
  CancelCheckoutDto,
  CheckoutDto,
  ConfirmCheckoutDto,
} from "./dto/orders.dto";

@ApiTags("Checkout")
@ApiBearerAuth()
@Roles("admin", "merchant")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("checkout")
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @ApiOperation({ summary: "Begin checkout and reserve inventory" })
  @ApiBody({ type: CheckoutDto })
  checkout(@CurrentUser() user: AuthenticatedUser, @Body() dto: CheckoutDto) {
    return this.checkoutService.checkout(user, dto);
  }

  @Post("confirm")
  @ApiOperation({ summary: "Confirm checkout and reduce inventory" })
  @ApiBody({ type: ConfirmCheckoutDto })
  confirm(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConfirmCheckoutDto,
  ) {
    return this.checkoutService.confirm(user, dto);
  }

  @Post("cancel")
  @ApiOperation({ summary: "Cancel checkout and release reservations" })
  @ApiBody({ type: CancelCheckoutDto })
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CancelCheckoutDto,
  ) {
    return this.checkoutService.cancel(user, dto);
  }
}
