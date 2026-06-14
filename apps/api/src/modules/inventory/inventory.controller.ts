import {
  Body,
  Controller,
  Get,
  Param,
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
import {
  CreateInventoryAdjustmentDto,
  CreateInventoryItemDto,
  CreateInventoryMovementDto,
  CreateInventoryReservationDto,
  ListInventoryMovementsQueryDto,
  ListInventoryReservationsQueryDto,
} from "./dto/inventory.dto";
import { InventoryService } from "./inventory.service";

@ApiTags("Inventory")
@ApiBearerAuth()
@Roles("admin", "merchant")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post("items")
  @ApiOperation({ summary: "Create an inventory item" })
  @ApiBody({ type: CreateInventoryItemDto })
  createItem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInventoryItemDto,
  ) {
    return this.inventoryService.createItem(user, dto);
  }

  @Post("movements")
  @ApiOperation({ summary: "Create an immutable inventory movement" })
  @ApiBody({ type: CreateInventoryMovementDto })
  createMovement(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInventoryMovementDto,
  ) {
    return this.inventoryService.createMovement(user, dto);
  }

  @Get("movements")
  @ApiOperation({ summary: "List inventory movements" })
  listMovements(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListInventoryMovementsQueryDto,
  ) {
    return this.inventoryService.listMovements(user, query);
  }

  @Get("movements/:id")
  @ApiOperation({ summary: "Get an inventory movement" })
  getMovement(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.inventoryService.getMovement(user, id);
  }

  @Post("adjustments")
  @ApiOperation({ summary: "Create an inventory adjustment" })
  @ApiBody({ type: CreateInventoryAdjustmentDto })
  createAdjustment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInventoryAdjustmentDto,
  ) {
    return this.inventoryService.createAdjustment(user, dto);
  }

  @Get("adjustments")
  @ApiOperation({ summary: "List inventory adjustments" })
  listAdjustments(
    @CurrentUser() user: AuthenticatedUser,
    @Query("inventoryItemId") inventoryItemId?: string,
  ) {
    return this.inventoryService.listAdjustments(user, inventoryItemId);
  }

  @Post("reservations")
  @ApiOperation({ summary: "Create an inventory reservation" })
  @ApiBody({ type: CreateInventoryReservationDto })
  createReservation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInventoryReservationDto,
  ) {
    return this.inventoryService.createReservation(user, dto);
  }

  @Get("items/:inventoryItemId/reservations")
  @ApiOperation({ summary: "List inventory reservations for an item" })
  listReservations(
    @CurrentUser() user: AuthenticatedUser,
    @Param("inventoryItemId") inventoryItemId: string,
    @Query() query: ListInventoryReservationsQueryDto,
  ) {
    return this.inventoryService.listReservations(user, inventoryItemId, query);
  }

  @Get("alerts")
  @ApiOperation({ summary: "List inventory alerts" })
  listAlerts(
    @CurrentUser() user: AuthenticatedUser,
    @Query("inventoryItemId") inventoryItemId?: string,
  ) {
    return this.inventoryService.listAlerts(user, inventoryItemId);
  }
}
