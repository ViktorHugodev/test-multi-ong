import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OrdersController, OrganizationOrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'payment-processing',
      },
      {
        name: 'notifications',
      },
    ),
  ],
  controllers: [OrdersController, OrganizationOrdersController],
  providers: [OrdersService, OrdersRepository],
  exports: [OrdersService],
})
export class OrdersModule {}
