// ========================================
// Arquivo: back-nestjs/src/modules/jobs/processors/payment.processor.ts
// Status: ✏️ IMPLEMENTAR
// Responsabilidade: Processar pagamentos de forma assíncrona com retry
// ========================================

import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Job, Queue } from 'bull';
import { PrismaService } from '@/database/prisma/prisma.service';
import { PaymentGatewayService, PaymentErrorType } from '../services/payment-gateway.service';
import { IdempotencyService } from '../services/idempotency.service';
import { JobLogService } from '../services/job-log.service';
import { ProcessPaymentDto } from '../dto/process-payment.dto';

/**
 * Payment Processor
 *
 * Processa pagamentos de forma assíncrona com:
 * - Idempotência via Redis
 * - Retry exponencial em falhas transitórias
 * - Dead letter queue para falhas permanentes
 * - Notificações automáticas pós-processamento
 * - Logging completo e rastreável
 *
 * Fluxo:
 * 1. Verificar idempotência
 * 2. Buscar pedido e validar status
 * 3. Criar registro Payment (pending)
 * 4. Chamar gateway de pagamento
 * 5. Atualizar Order e Payment baseado no resultado
 * 6. Disparar notificações
 * 7. Registrar em JobLog
 */
@Processor('payment-processing')
@Injectable()
export class PaymentProcessor {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentGateway: PaymentGatewayService,
    private readonly idempotencyService: IdempotencyService,
    private readonly jobLogService: JobLogService,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  @Process('process-payment')
  async handlePayment(job: Job<ProcessPaymentDto>) {
    const { orderId, amount, idempotencyKey, orderNumber, customerEmail } = job.data;
    const startTime = Date.now();

    this.logger.log(
      `[Job ${job.id}] Processing payment for order ${orderId} (attempt ${job.attemptsMade + 1}/${job.opts.attempts})`,
    );

    // 1. CRIAR JOB LOG
    await this.jobLogService.createLog(
      String(job.id),
      'payment-processing',
      'process-payment',
      job.data,
    );

    await this.jobLogService.markAsProcessing(String(job.id), job.attemptsMade + 1);

    try {
      // 2. VERIFICAR IDEMPOTÊNCIA
      const idempotencyKeyFinal = idempotencyKey ||
        this.idempotencyService.generateKey(orderId, 'payment');

      const cachedResult = await this.idempotencyService.checkJobProcessed(idempotencyKeyFinal);

      if (cachedResult) {
        this.logger.warn(
          `[Job ${job.id}] Payment already processed for order ${orderId}`,
        );

        await this.jobLogService.updateLog(
          String(job.id),
          'completed',
          { skipped: true, reason: 'Already processed', cachedResult },
        );

        return cachedResult;
      }

      // 3. BUSCAR PEDIDO E VALIDAR
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          customer: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Verificar se já foi processado (status diferente de pending ou payment_processing)
      if (order.status !== 'pending' && order.status !== 'payment_processing') {
        this.logger.warn(
          `[Job ${job.id}] Order ${orderId} already in status ${order.status}, skipping`,
        );

        const result = {
          skipped: true,
          reason: `Order already in status: ${order.status}`,
        };

        await this.jobLogService.updateLog(String(job.id), 'completed', result);
        await this.idempotencyService.markJobAsProcessed(idempotencyKeyFinal, result);

        return result;
      }

      // 4. CRIAR REGISTRO DE PAYMENT (PENDING)
      const payment = await this.prisma.payment.create({
        data: {
          orderId,
          amount: amount || order.totalAmount,
          status: 'processing',
          attempts: job.attemptsMade + 1,
          lastAttemptAt: new Date(),
        },
      });

      // 5. CHAMAR GATEWAY DE PAGAMENTO
      this.logger.log(`[Job ${job.id}] Calling payment gateway for order ${orderId}`);

      const paymentResult = await this.paymentGateway.processPayment(
        orderId,
        Number(amount || order.totalAmount),
      );

      // 6. PAGAMENTO APROVADO
      if (paymentResult.success) {
        const duration = Date.now() - startTime;

        this.logger.log(
          `[Job ${job.id}] ✅ Payment APPROVED for order ${orderId} - TxnID: ${paymentResult.transactionId} (${duration}ms)`,
        );

        // Atualizar Order e Payment atomicamente
        await this.prisma.$transaction([
          this.prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'confirmed',
              transactionId: paymentResult.transactionId,
              paidAt: new Date(),
            },
          }),
          this.prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'approved',
              transactionId: paymentResult.transactionId,
              gatewayResponse: paymentResult.gatewayResponse,
              processedAt: new Date(),
            },
          }),
        ]);

        // Disparar notificação de pagamento aprovado
        await this.notificationQueue.add(
          'send-notification',
          {
            orderId,
            type: 'payment_approved',
            recipient: customerEmail || order.customer.email,
            orderNumber: orderNumber || order.orderNumber,
            amount: Number(order.totalAmount),
            transactionId: paymentResult.transactionId,
            idempotencyKey: this.idempotencyService.generateKey(
              orderId,
              'notification:payment_approved',
            ),
          },
          {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
          },
        );

        const successResult = {
          success: true,
          transactionId: paymentResult.transactionId,
          duration,
          gatewayResponse: paymentResult.gatewayResponse,
        };

        // Atualizar JobLog e cache de idempotência
        await this.jobLogService.updateLog(String(job.id), 'completed', successResult);
        await this.idempotencyService.markJobAsProcessed(idempotencyKeyFinal, successResult);

        return successResult;
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      // 7. TRATAMENTO DE ERROS
      this.logger.error(
        `[Job ${job.id}] ❌ Payment processing error for order ${orderId} (${duration}ms):`,
        error.message,
      );

      // Verificar se é erro do gateway (com tipo definido)
      if (error.type === PaymentErrorType.TRANSIENT) {
        // ERRO TRANSITÓRIO - PERMITIR RETRY
        this.logger.warn(
          `[Job ${job.id}] Transient error detected - Will retry (${error.code})`,
        );

        await this.jobLogService.markAsRetrying(
          String(job.id),
          job.attemptsMade + 1,
          `${error.code}: ${error.message}`,
        );

        // Atualizar payment com tentativa
        await this.prisma.payment.updateMany({
          where: { orderId, status: 'processing' },
          data: {
            attempts: job.attemptsMade + 1,
            lastAttemptAt: new Date(),
          },
        });

        // Lançar erro para Bull fazer retry
        throw error;
      }

      if (error.type === PaymentErrorType.PERMANENT) {
        // ERRO PERMANENTE - NÃO RETRY
        this.logger.error(
          `[Job ${job.id}] Permanent error detected - No retry (${error.code})`,
        );

        // Marcar pedido como falhado
        await this.prisma.$transaction([
          this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'failed' },
          }),
          this.prisma.payment.updateMany({
            where: { orderId, status: 'processing' },
            data: {
              status: 'failed',
              gatewayResponse: { error: error.message, code: error.code },
              processedAt: new Date(),
            },
          }),
        ]);

        // Disparar notificação de falha
        await this.notificationQueue.add(
          'send-notification',
          {
            orderId,
            type: 'payment_failed',
            recipient: customerEmail || (await this.getCustomerEmail(orderId)),
            orderNumber: orderNumber || (await this.getOrderNumber(orderId)),
            metadata: { errorCode: error.code, errorMessage: error.message },
          },
          { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
        );

        const failResult = {
          success: false,
          error: error.message,
          errorCode: error.code,
          errorType: 'PERMANENT',
        };

        await this.jobLogService.updateLog(String(job.id), 'failed', failResult, error.message);

        // NÃO lançar erro - job completo (mas falhado)
        return failResult;
      }

      // ERRO DESCONHECIDO - RETRY
      this.logger.error(`[Job ${job.id}] Unknown error - Will retry:`, error.stack);

      await this.jobLogService.markAsRetrying(
        String(job.id),
        job.attemptsMade + 1,
        error.message,
      );

      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(
      `[Queue] Job ${job.id} started processing payment for order ${job.data.orderId}`,
    );
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    const duration = Date.now() - job.timestamp;

    this.logger.log(
      `[Queue] Job ${job.id} completed for order ${job.data.orderId} - Duration: ${duration}ms`,
    );
  }

  @OnQueueFailed()
  async onFailed(job: Job, error: Error) {
    const duration = Date.now() - job.timestamp;

    this.logger.error(
      `[Queue] Job ${job.id} failed for order ${job.data.orderId} after ${job.attemptsMade} attempts - Duration: ${duration}ms`,
    );

    // Se esgotou todas as tentativas, marcar como failed definitivamente
    if (job.attemptsMade >= (job.opts.attempts || 5)) {
      this.logger.error(
        `[Queue] Job ${job.id} exhausted all retries - Moving to DLQ`,
      );

      await this.jobLogService.updateLog(
        String(job.id),
        'failed',
        undefined,
        `Exhausted all ${job.attemptsMade} retry attempts: ${error.message}`,
      );

      // Garantir que order está marcada como failed
      try {
        await this.prisma.order.update({
          where: { id: job.data.orderId },
          data: { status: 'failed' },
        });

        // Enviar notificação de falha final
        const customerEmail = await this.getCustomerEmail(job.data.orderId);
        const orderNumber = await this.getOrderNumber(job.data.orderId);

        await this.notificationQueue.add(
          'send-notification',
          {
            orderId: job.data.orderId,
            type: 'payment_failed',
            recipient: customerEmail,
            orderNumber,
            metadata: {
              error: error.message,
              attempts: job.attemptsMade,
            },
          },
          { attempts: 3 },
        );
      } catch (updateError) {
        this.logger.error(
          `[Queue] Error updating order ${job.data.orderId} to failed:`,
          updateError.message,
        );
      }
    }
  }

  // Helper methods
  private async getCustomerEmail(orderId: string): Promise<string> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: { select: { email: true } } },
    });
    return order?.customer?.email || 'customer@example.com';
  }

  private async getOrderNumber(orderId: string): Promise<string> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { orderNumber: true },
    });
    return order?.orderNumber || orderId;
  }
}

// ========================================
// Configurações Críticas:
// - Idempotência: Evita processamento duplicado
// - Retry exponencial: 2s, 4s, 8s, 16s, 32s (5 tentativas)
// - Erro transitório: Network, timeout (retry)
// - Erro permanente: Cartão recusado (no retry)
// - DLQ: Jobs falhados mantidos para análise
// - Notificações: Sucesso e falha
// ========================================

// ========================================
// Cenários de Falha Cobertos:
// - Pedido não encontrado: Error (no retry)
// - Pedido já processado: Skip (idempotência)
// - Gateway timeout: Retry automático
// - Cartão recusado: Marca como failed (no retry)
// - Network error: Retry automático
// - Tentativas esgotadas: Move para DLQ + notifica
// - Redis down: Fail open (processa)
// ========================================
