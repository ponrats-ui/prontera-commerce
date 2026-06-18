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
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CommerceGateService } from "./commerce-gate.service";
import {
  CreateCommerceGateDto,
  CreateWorldDistrictDto,
  CreateWorldZoneDto,
  TravelQueryDto,
  WorldSearchQueryDto,
} from "./dto/world.dto";
import { WorldDiscoveryService } from "./world-discovery.service";

@ApiTags("World Travel")
@Controller("world")
export class WorldController {
  constructor(
    private readonly commerceGateService: CommerceGateService,
    private readonly worldDiscoveryService: WorldDiscoveryService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get the public commerce world overview" })
  overview(@Query() query: WorldSearchQueryDto) {
    return this.worldDiscoveryService.getMap(query);
  }

  @Get("regions")
  @ApiOperation({ summary: "List world regions" })
  listRegions() {
    return this.worldDiscoveryService.listRegions();
  }

  @Get("cities")
  @ApiOperation({ summary: "List world cities" })
  listCities() {
    return this.worldDiscoveryService.listCities();
  }

  @Get("cities/:slug")
  @ApiOperation({ summary: "Get a world city by slug" })
  getCity(@Param("slug") slug: string) {
    return this.worldDiscoveryService.getCityBySlug(slug);
  }

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
    return this.worldDiscoveryService.listDistricts();
  }

  @Get("districts/:slug")
  @ApiOperation({ summary: "Get a world district by slug" })
  getDistrict(@Param("slug") slug: string) {
    return this.worldDiscoveryService.getDistrictBySlug(slug);
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

  @Get("shops")
  @ApiOperation({ summary: "Discover world storefronts" })
  listShops(@Query() query: WorldSearchQueryDto) {
    return this.worldDiscoveryService.listShops(query);
  }

  @Get("shops/:slug")
  @ApiOperation({ summary: "Get a world storefront preview by shop slug" })
  getShop(@Param("slug") slug: string) {
    return this.worldDiscoveryService.getShopBySlug(slug);
  }

  @Get("live")
  @ApiOperation({ summary: "List live storefronts with world priority" })
  listLive(@Query() query: WorldSearchQueryDto) {
    return this.worldDiscoveryService.listLive(query);
  }

  @Get("founders")
  @ApiOperation({ summary: "List founder merchant storefronts" })
  listFounders(@Query() query: WorldSearchQueryDto) {
    return this.worldDiscoveryService.listFounders(query);
  }

  @Get("map")
  @ApiOperation({ summary: "Get world map with cities, districts, and shops" })
  getMap(@Query() query: WorldSearchQueryDto) {
    return this.worldDiscoveryService.getMap(query);
  }
}
