import {
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
  IsInt,
  Min,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsString()
  category: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQty: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  weightGrams: number;

  @IsOptional()
  @IsString()
  sku?: string;
}
