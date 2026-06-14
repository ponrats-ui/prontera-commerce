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
import { CreateShopDto } from "./dto/create-shop.dto";
import { CreateShopInvitationDto } from "./dto/invitation.dto";
import { AddShopStaffDto, UpdateShopStaffDto } from "./dto/staff.dto";
import { UpdateShopDto } from "./dto/update-shop.dto";
import { ShopsService } from "./shops.service";

@ApiTags("Shops")
@ApiBearerAuth()
@Roles("admin", "merchant")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("shops")
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  @ApiOperation({ summary: "Create a merchant shop" })
  @ApiBody({ type: CreateShopDto })
  createShop(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateShopDto,
  ) {
    return this.shopsService.createShop(user, dto);
  }

  @Get("me")
  @ApiOperation({
    summary: "Get shops owned by or assigned to the current user",
  })
  getMyShops(@CurrentUser() user: AuthenticatedUser) {
    return this.shopsService.getMyShops(user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get shop details by ID" })
  getShopById(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.shopsService.getShopById(user, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update shop profile" })
  @ApiBody({ type: UpdateShopDto })
  updateShop(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateShopDto,
  ) {
    return this.shopsService.updateShop(user, id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft delete a shop" })
  @ApiOkResponse({ schema: { example: { success: true } } })
  deleteShop(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.shopsService.softDeleteShop(user, id);
  }

  @Get(":id/staff")
  @ApiOperation({ summary: "List shop staff" })
  listStaff(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.shopsService.listStaff(user, id);
  }

  @Post(":id/staff")
  @ApiOperation({ summary: "Add existing user as shop staff" })
  @ApiBody({ type: AddShopStaffDto })
  addStaff(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: AddShopStaffDto,
  ) {
    return this.shopsService.addStaff(user, id, dto);
  }

  @Patch(":id/staff/:staffId")
  @ApiOperation({ summary: "Update shop staff role or status" })
  @ApiBody({ type: UpdateShopStaffDto })
  updateStaff(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("staffId") staffId: string,
    @Body() dto: UpdateShopStaffDto,
  ) {
    return this.shopsService.updateStaff(user, id, staffId, dto);
  }

  @Delete(":id/staff/:staffId")
  @ApiOperation({ summary: "Remove shop staff" })
  @ApiOkResponse({ schema: { example: { success: true } } })
  removeStaff(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("staffId") staffId: string,
  ) {
    return this.shopsService.removeStaff(user, id, staffId);
  }

  @Post(":id/invitations")
  @ApiOperation({ summary: "Create a shop invitation record" })
  @ApiBody({ type: CreateShopInvitationDto })
  createInvitation(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: CreateShopInvitationDto,
  ) {
    return this.shopsService.createInvitation(user, id, dto);
  }

  @Get(":id/invitations")
  @ApiOperation({ summary: "List shop invitations" })
  listInvitations(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.shopsService.listInvitations(user, id);
  }
}
