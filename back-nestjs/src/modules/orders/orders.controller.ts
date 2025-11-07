import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { OrganizationGuard } from '@/auth/guards/organization.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { CurrentOrganization } from '@/auth/decorators/current-organization.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(userId, dto);
  }

  @Get()
  async findMyOrders(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.ordersService.findMyOrders(userId, Number(page), Number(pageSize));
  }

  @Get(':id')
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.ordersService.findOrderById(id, userId);
  }
}

@Controller('organizations/:orgId/orders')
@UseGuards(JwtAuthGuard, OrganizationGuard)
export class OrganizationOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findOrganizationOrders(
    @CurrentOrganization() org: { id: string },
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.ordersService.findOrdersByOrganization(
      org.id,
      Number(page),
      Number(pageSize),
    );
  }
}
