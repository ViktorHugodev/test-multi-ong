import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';

@Processor('notification')
@Injectable()
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  @Process('notify-customer')
  async handleCustomerNotification(
    job: Job<{ orderId: string; type: string; email?: string }>,
  ) {
    const { orderId, type, email } = job.data;

    this.logger.log(
      `[Job ${job.id}] Sending ${type} notification to customer for order ${orderId}`,
    );

    // SIMULATE EMAIL SENDING
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.logger.log(
      `[Job ${job.id}] Customer notification sent: ${type} to ${email || 'customer'}`,
    );

    return { sent: true, type };
  }

  @Process('notify-organization')
  async handleOrganizationNotification(
    job: Job<{ orderId: string; organizationId: string; type: string }>,
  ) {
    const { orderId, organizationId, type } = job.data;

    this.logger.log(
      `[Job ${job.id}] Sending ${type} notification to organization ${organizationId}`,
    );

    // SIMULATE NOTIFICATION
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.logger.log(
      `[Job ${job.id}] Organization notification sent: ${type} to ${organizationId}`,
    );

    return { sent: true, type };
  }
}
