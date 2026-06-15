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
import {
  CreateLiveChannelDto,
  LiveCommerceAccessDto,
  UpdateLiveChannelDto,
} from "./dto/live-channel.dto";
import { LiveCommerceService } from "./live-commerce.service";

@ApiTags("Live Commerce")
@ApiBearerAuth()
@Roles("admin", "merchant")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class LiveCommerceController {
  constructor(private readonly liveCommerceService: LiveCommerceService) {}

  @Get("shops/:shopId/live-channels/access")
  @ApiOperation({ summary: "Check Live Commerce plan access" })
  @ApiOkResponse({ type: LiveCommerceAccessDto })
  getAccess(
    @CurrentUser() user: AuthenticatedUser,
    @Param("shopId") shopId: string,
  ) {
    return this.liveCommerceService.getAccess(user, shopId);
  }

  @Post("shops/:shopId/live-channels")
  @ApiOperation({ summary: "Create a shop live channel" })
  @ApiBody({ type: CreateLiveChannelDto })
  createChannel(
    @CurrentUser() user: AuthenticatedUser,
    @Param("shopId") shopId: string,
    @Body() dto: CreateLiveChannelDto,
  ) {
    return this.liveCommerceService.createChannel(user, shopId, dto);
  }

  @Get("shops/:shopId/live-channels")
  @ApiOperation({ summary: "List shop live channels" })
  listChannels(
    @CurrentUser() user: AuthenticatedUser,
    @Param("shopId") shopId: string,
  ) {
    return this.liveCommerceService.listChannels(user, shopId);
  }

  @Get("shops/:shopId/live-channels/active")
  @ApiOperation({ summary: "Get the active shop live channel" })
  getActiveChannel(
    @CurrentUser() user: AuthenticatedUser,
    @Param("shopId") shopId: string,
  ) {
    return this.liveCommerceService.getActiveChannel(user, shopId);
  }

  @Get("live-channels/:id")
  @ApiOperation({ summary: "Get a live channel" })
  getChannel(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.liveCommerceService.getChannel(user, id);
  }

  @Patch("live-channels/:id")
  @ApiOperation({ summary: "Update a live channel" })
  @ApiBody({ type: UpdateLiveChannelDto })
  updateChannel(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateLiveChannelDto,
  ) {
    return this.liveCommerceService.updateChannel(user, id, dto);
  }

  @Delete("live-channels/:id")
  @ApiOperation({ summary: "Soft delete a live channel" })
  @ApiOkResponse({ schema: { example: { success: true } } })
  deleteChannel(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.liveCommerceService.deleteChannel(user, id);
  }

  @Post("live-channels/:id/go-live")
  @ApiOperation({ summary: "Set a live channel to LIVE" })
  goLive(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.liveCommerceService.goLive(user, id);
  }

  @Post("live-channels/:id/end")
  @ApiOperation({ summary: "End a live channel" })
  endLive(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.liveCommerceService.endLive(user, id);
  }
}
