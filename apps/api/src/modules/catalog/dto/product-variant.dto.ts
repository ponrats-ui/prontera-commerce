import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ProductVariantStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { trim } from "./catalog-shared.dto";

export class CreateProductVariantDto {
  @ApiProperty({ example: "TRAVELER-JACKET-BLUE-M" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @MaxLength(120)
  sku!: string;

  @ApiProperty({ example: "Blue / M" })
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 4900, description: "Price in minor currency units." })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({
    example: 5900,
    description: "Compare-at price in minor currency units.",
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({
    enum: ProductVariantStatus,
    default: ProductVariantStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ProductVariantStatus)
  status?: ProductVariantStatus;
}

export class UpdateProductVariantDto {
  @ApiPropertyOptional({ example: "TRAVELER-JACKET-BLUE-M" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sku?: string;

  @ApiPropertyOptional({ example: "Blue / M" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 4900 })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 5900 })
  @IsOptional()
  @IsInt()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ enum: ProductVariantStatus })
  @IsOptional()
  @IsEnum(ProductVariantStatus)
  status?: ProductVariantStatus;
}
