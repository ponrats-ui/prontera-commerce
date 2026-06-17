import { Body, Controller, Get, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { BuildingSettingsDto } from "./dto/merchant-building.dto";
import { MerchantBuildingsService } from "./merchant-buildings.service";

@ApiTags("Merchant Buildings")
@Controller("buildings")
export class MerchantBuildingsController {
  constructor(private readonly buildings: MerchantBuildingsService) {}

  @Get()
  @ApiOperation({ summary: "List published merchant buildings" })
  list() {
    return this.buildings.listPublished();
  }

  @Get("metrics")
  @ApiOperation({ summary: "Get merchant building metrics" })
  metrics() {
    return this.buildings.metrics();
  }

  @Get("me")
  @ApiBearerAuth()
  @Roles("admin", "merchant")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Get current merchant building settings" })
  me(@CurrentUser() user: AuthenticatedUser, @Query("shopId") shopId?: string) {
    return this.buildings.getMyBuilding(user, shopId);
  }

  @Patch("me")
  @ApiBearerAuth()
  @Roles("admin", "merchant")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Update merchant building settings" })
  @ApiBody({ type: BuildingSettingsDto })
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BuildingSettingsDto,
  ) {
    return this.buildings.updateMyBuilding(user, dto);
  }
}
