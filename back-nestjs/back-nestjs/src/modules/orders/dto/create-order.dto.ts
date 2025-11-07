import { Type } from 'class-transformer';
import { IsArray, IsString, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { OrderItemDto } from './order-item.dto';

class ShippingDetailsDto {
  @IsString()
  recipientName: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;

  @IsString()
  phone: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingDetailsDto)
  shippingDetails: ShippingDetailsDto;

  @IsEnum(['credit_card', 'debit_card', 'pix', 'boleto'])
  paymentMethod: string;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
