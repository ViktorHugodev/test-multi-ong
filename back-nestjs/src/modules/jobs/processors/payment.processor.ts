import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Processor('payment')
@Injectable()
export class PaymentProcessor {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notification') private notificationQueue: Queue,
  ) {}

  @Process('process-payment')
  async handlePayment(job: Job<{ orderId: string }>) {
    const { orderId } = job.data;

    this.logger.log(`[Job ${job.id}] Processing payment for order ${orderId}`);

    // 1. IDEMPOTENCY CHECK - verificar status do pedido
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      this.logger.warn(`Order ${orderId} not found, skipping`);
      return { skipped: true, reason: 'Order not found' };
    }

    if (order.status !== 'payment_processing') {
      this.logger.warn(
        `Order ${orderId} status is ${order.status}, skipping payment`,
      );
      return {
        skipped: true,
        reason: `Already processed. Current status: ${order.status}`,
      };
    }

    // 2. SIMULATE PAYMENT GATEWAY CALL
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simular delay
      const success = Math.random() > 0.1; // 90% success rate

      if (success) {
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Update order status
        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'confirmed',
            transactionId,
            paidAt: new Date(),
          },
        });

        this.logger.log(`[Job ${job.id}] Payment successful for order ${orderId}`);

        // Enqueue notification jobs
        await this.notificationQueue.add(
          'notify-customer',
          {
            orderId,
            type: 'payment_success',
            email: 'customer@example.com', // Get from order
          },
          { attempts: 3, backoff: 2000 },
        );

        // Notificar cada organização envolvida
        const organizationIds = [
          ...new Set(order.items.map((item) => item.organizationId)),
        ];

        for (const orgId of organizationIds) {
          await this.notificationQueue.add(
            'notify-organization',
            {
              orderId,
              organizationId: orgId,
              type: 'new_order',
            },
            { attempts: 3, backoff: 2000 },
          );
        }

        return {
          success: true,
          transactionId,
        };
      } else {
        // Payment failed
        await this.prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'failed',
          },
        });

        this.logger.error(`[Job ${job.id}] Payment failed for order ${orderId}`);

        await this.notificationQueue.add(
          'notify-customer',
          {
            orderId,
            type: 'payment_failed',
          },
          { attempts: 3, backoff: 2000 },
        );

        return {
          success: false,
          error: 'Payment gateway declined',
        };
      }
    } catch (error) {
      this.logger.error(
        `[Job ${job.id}] Error processing payment for order ${orderId}`,
        error.stack,
      );

      // Throw error to trigger retry
      throw error;
    }
  }
}
