import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @CurrentUser('id') customerId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(customerId, createOrderDto);
  }

  @Get()
  findByCustomer(@CurrentUser('id') customerId: string) {
    return this.ordersService.findByCustomer(customerId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') customerId: string,
  ) {
    return this.ordersService.findOne(id, customerId);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @CurrentUser('id') customerId: string,
  ) {
    return this.ordersService.cancelOrder(id, customerId);
  }
}
