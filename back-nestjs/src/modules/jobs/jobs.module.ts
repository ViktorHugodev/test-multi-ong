import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentProcessor } from './processors/payment.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'payment' },
      { name: 'notification' },
    ),
  ],
  providers: [PaymentProcessor, NotificationProcessor],
  exports: [BullModule],
})
export class JobsModule {}
