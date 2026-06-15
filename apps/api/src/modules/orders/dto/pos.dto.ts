import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsUUID, Min } from "class-validator";

export class OpenPOSDto {
  @ApiProperty()
  @IsUUID()
  shopId!: string;

  @ApiProperty({ example: 10000 })
  @IsInt()
  @Min(0)
  openingCash!: number;
}

export class ClosePOSDto {
  @ApiProperty()
  @IsUUID()
  sessionId!: string;

  @ApiProperty({ example: 12500 })
  @IsInt()
  @Min(0)
  closingCash!: number;
}
