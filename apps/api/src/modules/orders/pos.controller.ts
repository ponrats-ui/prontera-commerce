import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ClosePOSDto, OpenPOSDto } from "./dto/pos.dto";
import { POSService } from "./pos.service";

@ApiTags("POS")
@ApiBearerAuth()
@Roles("admin", "merchant")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("pos")
export class POSController {
  constructor(private readonly posService: POSService) {}

  @Post("open")
  @ApiOperation({ summary: "Open POS session" })
  @ApiBody({ type: OpenPOSDto })
  open(@CurrentUser() user: AuthenticatedUser, @Body() dto: OpenPOSDto) {
    return this.posService.open(user, dto);
  }

  @Post("close")
  @ApiOperation({ summary: "Close POS session" })
  @ApiBody({ type: ClosePOSDto })
  close(@CurrentUser() user: AuthenticatedUser, @Body() dto: ClosePOSDto) {
    return this.posService.close(user, dto);
  }

  @Get("current")
  @ApiOperation({ summary: "Get current POS session" })
  current(
    @CurrentUser() user: AuthenticatedUser,
    @Query("shopId") shopId: string,
  ) {
    return this.posService.current(user, shopId);
  }
}
