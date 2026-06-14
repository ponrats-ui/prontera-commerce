import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { CreateWarehouseDto, UpdateWarehouseDto } from "./dto/warehouse.dto";
import { WarehousesService } from "./warehouses.service";

@ApiTags("Warehouses")
@ApiBearerAuth()
@Roles("admin", "merchant")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post("shops/:shopId/warehouses")
  @ApiOperation({ summary: "Create a shop warehouse" })
  @ApiBody({ type: CreateWarehouseDto })
  createWarehouse(
    @CurrentUser() user: AuthenticatedUser,
    @Param("shopId") shopId: string,
    @Body() dto: CreateWarehouseDto,
  ) {
    return this.warehousesService.createWarehouse(user, shopId, dto);
  }

  @Get("shops/:shopId/warehouses")
  @ApiOperation({ summary: "List shop warehouses" })
  listWarehouses(
    @CurrentUser() user: AuthenticatedUser,
    @Param("shopId") shopId: string,
  ) {
    return this.warehousesService.listWarehouses(user, shopId);
  }

  @Get("warehouses/:id")
  @ApiOperation({ summary: "Get a warehouse" })
  getWarehouse(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.warehousesService.getWarehouse(user, id);
  }

  @Patch("warehouses/:id")
  @ApiOperation({ summary: "Update a warehouse" })
  @ApiBody({ type: UpdateWarehouseDto })
  updateWarehouse(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.updateWarehouse(user, id, dto);
  }

  @Delete("warehouses/:id")
  @ApiOperation({ summary: "Soft delete a warehouse" })
  @ApiOkResponse({ schema: { example: { success: true } } })
  deleteWarehouse(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.warehousesService.deleteWarehouse(user, id);
  }
}
