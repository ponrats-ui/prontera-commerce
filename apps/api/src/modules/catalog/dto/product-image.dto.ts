import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from "class-validator";
import { trim } from "./catalog-shared.dto";

export class CreateProductImageDto {
  @ApiProperty({ example: "https://cdn.example.com/products/jacket.png" })
  @Transform(trim)
  @IsUrl({ require_tld: false })
  imageUrl!: string;

  @ApiPropertyOptional({ example: "Traveler jacket in blue" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  altText?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
