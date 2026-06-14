import { OmitType, PartialType } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { ShopStatus } from "@prisma/client";
import { CreateShopDto } from "./create-shop.dto";

export class UpdateShopDto extends PartialType(
  OmitType(CreateShopDto, ["slug"] as const),
) {
  @IsOptional()
  @IsEnum(ShopStatus)
  status?: ShopStatus;
}
