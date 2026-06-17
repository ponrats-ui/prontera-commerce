import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AdminBuildingUpdateDto } from "./dto/merchant-building.dto";
import { MerchantBuildingsService } from "./merchant-buildings.service";

@ApiTags("Admin Merchant Buildings")
@ApiBearerAuth()
@Roles("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin/buildings")
export class AdminMerchantBuildingsController {
  constructor(private readonly buildings: MerchantBuildingsService) {}

  @Get()
  @ApiOperation({ summary: "Review merchant buildings" })
  list() {
    return this.buildings.adminList();
  }

  @Patch(":id")
  @ApiOperation({ summary: "Assign official status or moderate signage" })
  @ApiBody({ type: AdminBuildingUpdateDto })
  update(@Param("id") id: string, @Body() dto: AdminBuildingUpdateDto) {
    return this.buildings.adminUpdate(id, dto);
  }
}
