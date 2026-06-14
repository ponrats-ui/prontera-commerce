import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CategoryStatus } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateNested,
} from "class-validator";
import {
  CategoryTranslationInputDto,
  trim,
  trimLower,
} from "./catalog-shared.dto";

export class CreateCategoryDto {
  @ApiProperty({ example: "shop-uuid" })
  @IsUUID()
  shopId!: string;

  @ApiProperty({ example: "adventurer-gear" })
  @Transform(trimLower)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(160)
  slug!: string;

  @ApiPropertyOptional({ enum: CategoryStatus, default: CategoryStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @ApiProperty({ type: [CategoryTranslationInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CategoryTranslationInputDto)
  translations!: CategoryTranslationInputDto[];
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: "adventurer-gear" })
  @Transform(trimLower)
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(160)
  slug?: string;

  @ApiPropertyOptional({ enum: CategoryStatus })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @ApiPropertyOptional({ type: [CategoryTranslationInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CategoryTranslationInputDto)
  translations?: CategoryTranslationInputDto[];
}

export class ListCategoriesQueryDto {
  @ApiProperty({ example: "shop-uuid" })
  @IsUUID()
  shopId!: string;

  @ApiPropertyOptional({ enum: CategoryStatus })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;
}

export { trim, trimLower };
