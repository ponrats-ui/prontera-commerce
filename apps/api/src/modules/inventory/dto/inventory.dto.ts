import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  InventoryAdjustmentReason,
  InventoryItemStatus,
  InventoryMovementType,
  InventoryReservationStatus,
} from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";

const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreateInventoryItemDto {
  @ApiProperty()
  @IsUUID()
  warehouseId!: string;

  @ApiProperty()
  @IsUUID()
  productVariantId!: string;

  @ApiProperty({ example: "TRAVELER-JACKET-BLUE-M" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @MaxLength(120)
  sku!: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  quantityOnHand?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  quantityReserved?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderPoint?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(0)
  reorderQuantity?: number;

  @ApiPropertyOptional({ enum: InventoryItemStatus })
  @IsOptional()
  @IsEnum(InventoryItemStatus)
  status?: InventoryItemStatus;
}

export class CreateInventoryMovementDto {
  @ApiProperty()
  @IsUUID()
  inventoryItemId!: string;

  @ApiProperty({ enum: InventoryMovementType })
  @IsEnum(InventoryMovementType)
  movementType!: InventoryMovementType;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  referenceNumber?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class ListInventoryMovementsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  inventoryItemId?: string;
}

export class CreateInventoryAdjustmentDto {
  @ApiProperty()
  @IsUUID()
  inventoryItemId!: string;

  @ApiProperty({ enum: InventoryAdjustmentReason })
  @IsEnum(InventoryAdjustmentReason)
  reason!: InventoryAdjustmentReason;

  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(0)
  afterQuantity!: number;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class CreateInventoryReservationDto {
  @ApiProperty()
  @IsUUID()
  inventoryItemId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: "2026-07-14T00:00:00.000Z" })
  @Type(() => Date)
  @IsDate()
  expiresAt!: Date;
}

export class ListInventoryReservationsQueryDto {
  @ApiPropertyOptional({ enum: InventoryReservationStatus })
  @IsOptional()
  @IsEnum(InventoryReservationStatus)
  status?: InventoryReservationStatus;
}
