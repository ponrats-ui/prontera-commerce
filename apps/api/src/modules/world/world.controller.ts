import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CommerceGateService } from "./commerce-gate.service";
import {
  CreateCommerceGateDto,
  CreateWorldDistrictDto,
  CreateWorldZoneDto,
  TravelQueryDto,
} from "./dto/world.dto";

@ApiTags("World Travel")
@Controller("world")
export class WorldController {
  constructor(private readonly commerceGateService: CommerceGateService) {}

  @Post("zones")
  @ApiBearerAuth()
  @Roles("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Create a world zone" })
  @ApiBody({ type: CreateWorldZoneDto })
  createZone(@Body() dto: CreateWorldZoneDto) {
    return this.commerceGateService.createZone(dto);
  }

  @Get("zones")
  @ApiOperation({ summary: "List world zones" })
  listZones() {
    return this.commerceGateService.listZones();
  }

  @Get("zones/:id")
  @ApiOperation({ summary: "Get a world zone" })
  getZone(@Param("id") id: string) {
    return this.commerceGateService.getZone(id);
  }

  @Post("districts")
  @ApiBearerAuth()
  @Roles("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Create a world district" })
  @ApiBody({ type: CreateWorldDistrictDto })
  createDistrict(@Body() dto: CreateWorldDistrictDto) {
    return this.commerceGateService.createDistrict(dto);
  }

  @Get("districts")
  @ApiOperation({ summary: "List world districts" })
  listDistricts() {
    return this.commerceGateService.listDistricts();
  }

  @Get("zones/:id/districts")
  @ApiOperation({ summary: "List districts in a world zone" })
  listZoneDistricts(@Param("id") id: string) {
    return this.commerceGateService.listZoneDistricts(id);
  }

  @Post("gates")
  @ApiBearerAuth()
  @Roles("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Create a commerce gate" })
  @ApiBody({ type: CreateCommerceGateDto })
  createGate(@Body() dto: CreateCommerceGateDto) {
    return this.commerceGateService.createGate(dto);
  }

  @Get("gates")
  @ApiOperation({ summary: "List commerce gates" })
  listGates() {
    return this.commerceGateService.listGates();
  }

  @Get("gates/available")
  @ApiOperation({ summary: "List active commerce gates available for travel" })
  listAvailableGates() {
    return this.commerceGateService.listAvailableGates();
  }

  @Get("travel")
  @ApiOperation({ summary: "Get world travel overview and recommendations" })
  getTravelOverview(@Query() query: TravelQueryDto) {
    return this.commerceGateService.getTravelOverview(query);
  }
}
