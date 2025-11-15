import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PaymentProcessor } from './processors/payment.processor';
import { NotificationProcessor } from './processors/notification.processor';

/**
 * Jobs Module - Handles asynchronous processing with Bull queues
 *
 * Queue Configuration:
 * - Payment Queue: Processes payment gateway calls with retry logic
 * - Notification Queue: Sends notifications to customers and organizations
 *
 * Features:
 * - Exponential backoff retry strategy
 * - Dead Letter Queue (failed jobs retained for analysis)
 * - Automatic cleanup of completed jobs
 * - Stalled job handling
 */
@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'payment',
        defaultJobOptions: {
          attempts: 3, // Retry up to 3 times
          backoff: {
            type: 'exponential',
            delay: 2000, // Start with 2s, then 4s, then 8s
          },
          removeOnComplete: true, // Clean up successful jobs
          removeOnFail: false, // Keep failed jobs for analysis (Dead Letter Queue)
        },
        settings: {
          lockDuration: 30000, // 30 seconds lock
          maxStalledCount: 1, // Move to failed after 1 stalled attempt
          stalledInterval: 30000, // Check for stalled jobs every 30s
        },
      },
      {
        name: 'notification',
        defaultJobOptions: {
          attempts: 3, // Retry up to 3 times
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false, // Keep failed notifications for retry/analysis
        },
        settings: {
          lockDuration: 30000,
          maxStalledCount: 1,
          stalledInterval: 30000,
        },
      },
    ),
  ],
  providers: [PaymentProcessor, NotificationProcessor],
  exports: [BullModule], // Export in case other modules need to add jobs
})
export class JobsModule {}
