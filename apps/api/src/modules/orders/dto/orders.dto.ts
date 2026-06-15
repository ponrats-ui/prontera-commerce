import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  OrderStatus,
  PaymentMethod,
  PaymentRecordStatus,
} from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreateOrderItemDto {
  @ApiProperty()
  @IsUUID()
  productVariantId!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreatePaymentRecordDto {
  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @ApiPropertyOptional({ enum: PaymentRecordStatus })
  @IsOptional()
  @IsEnum(PaymentRecordStatus)
  status?: PaymentRecordStatus;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  referenceNumber?: string;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsUUID()
  shopId!: string;

  @ApiPropertyOptional({ enum: OrderStatus, default: OrderStatus.DRAFT })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  tax?: number;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({ type: CreatePaymentRecordDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePaymentRecordDto)
  payment?: CreatePaymentRecordDto;
}

export class CheckoutDto {
  @ApiProperty()
  @IsUUID()
  shopId!: string;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.MANUAL })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

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

export class ConfirmCheckoutDto {
  @ApiProperty()
  @IsUUID()
  orderId!: string;
}

export class CancelCheckoutDto {
  @ApiProperty()
  @IsUUID()
  orderId!: string;
}
