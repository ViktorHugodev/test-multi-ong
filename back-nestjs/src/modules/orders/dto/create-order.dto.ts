import {
  IsArray,
  IsString,
  IsOptional,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsObject()
  shippingDetails?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    recipientName: string;
    recipientPhone: string;
  };

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
