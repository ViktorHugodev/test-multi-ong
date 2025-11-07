import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../../database/prisma/prisma.service';

export interface PaymentJobData {
  orderId: string;
  paymentMethod: string;
  amount: number;
}

@Processor('payment')
export class PaymentProcessor {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('process-payment')
  async handlePayment(job: Job<PaymentJobData>) {
    this.logger.log(`Processing payment for order: ${job.data.orderId}`);

    try {
      // Simulate payment processing
      await this.simulatePaymentGateway(job.data);

      // Update order status
      await this.prisma.order.update({
        where: { id: job.data.orderId },
        data: {
          status: 'confirmed',
          paidAt: new Date(),
        },
      });

      this.logger.log(`Payment successful for order: ${job.data.orderId}`);

      return { success: true, orderId: job.data.orderId };
    } catch (error) {
      this.logger.error(
        `Payment failed for order ${job.data.orderId}: ${error.message}`,
      );

      // Update order to failed status
      await this.prisma.order.update({
        where: { id: job.data.orderId },
        data: { status: 'failed' },
      });

      throw error;
    }
  }

  /**
   * Simulate payment gateway integration
   * In production, integrate with Stripe, PayPal, etc.
   */
  private async simulatePaymentGateway(data: PaymentJobData): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate 10% failure rate for testing
    if (Math.random() < 0.1) {
      throw new Error('Payment gateway error');
    }

    this.logger.log(
      `Payment gateway processed: ${data.paymentMethod} - $${data.amount}`,
    );
  }
}
