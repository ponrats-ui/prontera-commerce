import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { MerchantBuildingsService } from "./merchant-buildings.service";

@ApiTags("Merchant Profile")
@Controller("merchant")
export class MerchantProfileController {
  constructor(private readonly buildings: MerchantBuildingsService) {}

  @Get(":id")
  @ApiOperation({ summary: "Get public merchant building profile" })
  getProfile(@Param("id") id: string) {
    return this.buildings.getMerchantProfile(id);
  }
}
