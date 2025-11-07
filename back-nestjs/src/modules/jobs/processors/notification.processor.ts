import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../../database/prisma/prisma.service';

export interface NotificationJobData {
  orderId: string;
  customerId: string;
  type: 'order_created' | 'order_confirmed' | 'order_cancelled';
}

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('send-email')
  async handleEmailNotification(job: Job<NotificationJobData>) {
    this.logger.log(
      `Sending ${job.data.type} email for order: ${job.data.orderId}`,
    );

    try {
      // Fetch order and customer details
      const order = await this.prisma.order.findUnique({
        where: { id: job.data.orderId },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error(`Order ${job.data.orderId} not found`);
      }

      // Send email based on type
      await this.sendEmail(job.data.type, order);

      this.logger.log(`Email sent successfully for order: ${job.data.orderId}`);

      return { success: true, orderId: job.data.orderId };
    } catch (error) {
      this.logger.error(
        `Failed to send email for order ${job.data.orderId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Send email notification
   * In production, integrate with SendGrid, AWS SES, etc.
   */
  private async sendEmail(type: string, order: any): Promise<void> {
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const templates = {
      order_created: {
        subject: `Order Confirmed - ${order.orderNumber}`,
        body: `Your order has been created successfully!`,
      },
      order_confirmed: {
        subject: `Payment Confirmed - ${order.orderNumber}`,
        body: `Your payment has been confirmed. Thank you!`,
      },
      order_cancelled: {
        subject: `Order Cancelled - ${order.orderNumber}`,
        body: `Your order has been cancelled.`,
      },
    };

    const template = templates[type];
    this.logger.log(`Email to ${order.customer.email}: ${template.subject}`);

    // In production, actually send email here
    // await emailService.send({ to: order.customer.email, ...template });
  }

  @Process('send-sms')
  async handleSmsNotification(job: Job<NotificationJobData>) {
    this.logger.log(`Sending SMS notification for order: ${job.data.orderId}`);

    // Simulate SMS sending
    await new Promise((resolve) => setTimeout(resolve, 500));

    this.logger.log(`SMS sent for order: ${job.data.orderId}`);

    return { success: true };
  }
}
