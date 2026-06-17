import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DiscoveryService } from "./discovery.service";
import { DiscoveryQueryDto, TrackDiscoveryEventDto } from "./dto/discovery.dto";

@ApiTags("Merchant Discovery")
@Controller("discover")
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get()
  @ApiOperation({ summary: "Get merchant discovery overview" })
  overview(@Query() query: DiscoveryQueryDto) {
    return this.discoveryService.overview(query);
  }

  @Get("merchants")
  @ApiOperation({ summary: "Search and browse discoverable merchants" })
  merchants(@Query() query: DiscoveryQueryDto) {
    return this.discoveryService.listMerchants(query);
  }

  @Get("categories")
  @ApiOperation({ summary: "List merchant discovery categories" })
  categories(@Query() query: DiscoveryQueryDto) {
    return this.discoveryService.categories(query);
  }

  @Get("founders")
  @ApiOperation({ summary: "List founder merchants" })
  founders(@Query() query: DiscoveryQueryDto) {
    return this.discoveryService.listFounders(query);
  }

  @Get("official")
  @ApiOperation({ summary: "List official stores" })
  official(@Query() query: DiscoveryQueryDto) {
    return this.discoveryService.listOfficial(query);
  }

  @Get("featured")
  @ApiOperation({ summary: "List featured merchants" })
  featured(@Query() query: DiscoveryQueryDto) {
    return this.discoveryService.listFeatured(query);
  }

  @Get("metrics")
  @ApiOperation({ summary: "Get discovery metrics" })
  metrics() {
    return this.discoveryService.metrics();
  }

  @Post("events")
  @ApiOperation({ summary: "Track a merchant discovery event" })
  @ApiBody({ type: TrackDiscoveryEventDto })
  track(@Body() dto: TrackDiscoveryEventDto) {
    return this.discoveryService.track(dto);
  }
}
