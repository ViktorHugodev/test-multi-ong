import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PaymentProcessor } from './processors/payment.processor';
import { NotificationProcessor } from './processors/notification.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'payment',
      },
      {
        name: 'notification',
      },
    ),
  ],
  providers: [PaymentProcessor, NotificationProcessor],
})
export class JobsModule {}
